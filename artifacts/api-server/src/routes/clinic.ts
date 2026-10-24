import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  or,
  sql,
} from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreatePatientBody,
  CreatePatientConsultationBody,
  CreatePatientConsultationParams,
  CreatePatientPrescriptionBody,
  CreatePatientPrescriptionParams,
  SaveClinicalDraftBody,
  GetPatientParams,
  ListPatientConsultationsParams,
  ListPatientPrescriptionsParams,
  ListPatientsQueryParams,
  UpdatePatientBody,
  UpdatePatientParams,
  UpdateProfessionalProfileBody,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  clinicalConsultations,
  clinicalDrafts,
  clinicalHistories,
  clinicalTestResults,
  organizationMembers,
  patients,
  plans,
  prescriptions,
  professionalProfiles,
  subscriptions,
  usageCounters,
  userProfiles,
} from "@workspace/db/schema";
import { authenticatedUserId, requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
const FREE_LIMITS = { patients: 10, exams: 5, prescriptions: 10 };
type LimitFeature = keyof typeof FREE_LIMITS;

function monthInClinicTimezone() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) throw new Error("Unable to determine the current billing month");
  return `${year}-${month}`;
}

function dateOnly(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day) return value;
  }
  return null;
}

function bodyWithoutBlankOptionalFields(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;
  const result = { ...(body as Record<string, unknown>) };
  for (const key of ["birthDate", "email", "sex", "phone", "address", "notes"]) {
    if (result[key] === "") delete result[key];
  }
  return result;
}

async function getFeatureLimit(
  userId: string,
  organizationId: string | null,
  feature: LimitFeature,
) {
  const scope = organizationId
    ? eq(subscriptions.organizationId, organizationId)
    : and(eq(subscriptions.userId, userId), isNull(subscriptions.organizationId));
  const [subscription] = await db
    .select({ limits: plans.limits })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(and(
      scope,
      eq(subscriptions.status, "active"),
      eq(plans.active, true),
      or(isNull(subscriptions.currentPeriodEnd), gte(subscriptions.currentPeriodEnd, new Date())),
    ))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);

  const limit = subscription?.limits?.[feature];
  return typeof limit === "number" && Number.isFinite(limit)
    ? Math.max(0, limit)
    : FREE_LIMITS[feature];
}

async function accessiblePatient(userId: string, patientId: string) {
  const [patient] = await db.select().from(patients)
    .where(eq(patients.id, patientId))
    .limit(1);
  if (!patient) return null;
  if (patient.ownerUserId === userId) return { patient, role: "owner" };
  if (!patient.organizationId) return null;

  const [membership] = await db.select({ role: organizationMembers.role })
    .from(organizationMembers)
    .where(and(
      eq(organizationMembers.organizationId, patient.organizationId),
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.status, "active"),
    ))
    .limit(1);
  return membership ? { patient, role: membership.role } : null;
}

function canWriteClinicalRecords(role: string) {
  return ["owner", "super_admin", "organization_admin", "professional"].includes(role);
}

async function consumeMonthlyUsage(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  organizationId: string | null,
  feature: LimitFeature,
  limit: number,
) {
  const accountKey = organizationId ? `org:${organizationId}` : `user:${userId}`;
  const usageMonth = monthInClinicTimezone();
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${accountKey}))`);
  const [counter] = await tx.select({ id: usageCounters.id, used: usageCounters.used })
    .from(usageCounters)
    .where(and(
      eq(usageCounters.accountKey, accountKey),
      eq(usageCounters.usageMonth, usageMonth),
      eq(usageCounters.feature, feature),
    ))
    .limit(1);
  if ((counter?.used ?? 0) >= limit) return false;

  if (counter) {
    await tx.update(usageCounters)
      .set({ used: counter.used + 1, updatedAt: new Date() })
      .where(eq(usageCounters.id, counter.id));
  } else {
    await tx.insert(usageCounters).values({
      accountKey,
      userId,
      organizationId,
      usageMonth,
      feature,
      used: 1,
    });
  }
  return true;
}

router.use(requireAuth);

router.get("/me", async (req, res) => {
  const userId = authenticatedUserId(req);
  const [base] = await db.select().from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1);
  const [profile] = await db.select().from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);
  return res.json({
    firstName: base?.firstName ?? "",
    lastName: base?.lastName ?? "",
    email: base?.email ?? "",
    profession: profile?.profession ?? "Optometrista",
    licenseNumber: profile?.licenseNumber ?? "",
    specialty: profile?.specialty ?? "",
    country: profile?.country ?? "México",
    officeName: profile?.officeName ?? "",
    officeAddress: profile?.officeAddress ?? "",
    officePhone: profile?.officePhone ?? "",
    officeEmail: profile?.officeEmail ?? "",
    prescriptionName: profile?.prescriptionName ?? "",
    prescriptionProfessionalName: profile?.prescriptionProfessionalName ?? "",
    prescriptionLicense: profile?.prescriptionLicense ?? "",
    prescriptionPhone: profile?.prescriptionPhone ?? "",
    prescriptionEmail: profile?.prescriptionEmail ?? "",
    prescriptionAddress: profile?.prescriptionAddress ?? "",
    ...(profile?.logoUri ? { logoUri: profile.logoUri } : {}),
    ...(profile?.signatureUri ? { signatureUri: profile.signatureUri } : {}),
  });
});

router.get("/usage", async (req, res) => {
  const userId = authenticatedUserId(req);
  const month = monthInClinicTimezone();
  const accountKey = `user:${userId}`;
  const [activePlan] = await db.select({ name: plans.name, limits: plans.limits })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(and(
      eq(subscriptions.userId, userId),
      isNull(subscriptions.organizationId),
      eq(subscriptions.status, "active"),
      eq(plans.active, true),
      or(isNull(subscriptions.currentPeriodEnd), gte(subscriptions.currentPeriodEnd, new Date())),
    ))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1);
  const planName = activePlan?.name.toLowerCase() ?? "";
  const plan = planName.includes("clinic") ? "clinic" : planName.includes("pro") ? "pro" : "free";
  const rows = await db.select({
    feature: usageCounters.feature,
    used: usageCounters.used,
  }).from(usageCounters).where(and(
    eq(usageCounters.accountKey, accountKey),
    eq(usageCounters.usageMonth, month),
  ));
  const usage = Object.fromEntries(rows.map((row) => [row.feature, row.used]));
  return res.json({
    plan,
    month,
    usage: {
      patients: usage.patients ?? 0,
      exams: usage.exams ?? 0,
      prescriptions: usage.prescriptions ?? 0,
    },
    limits: {
      patients: await getFeatureLimit(userId, null, "patients"),
      exams: await getFeatureLimit(userId, null, "exams"),
      prescriptions: await getFeatureLimit(userId, null, "prescriptions"),
    },
  });
});

router.put("/professional-profile", async (req, res) => {
  const parsed = UpdateProfessionalProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid professional profile", issues: parsed.error.issues });

  const userId = authenticatedUserId(req);
  const input = parsed.data;
  await db.transaction(async (tx) => {
    await tx.insert(userProfiles).values({
      id: userId,
      email: input.email || null,
      firstName: input.firstName,
      lastName: input.lastName,
    }).onConflictDoUpdate({
      target: userProfiles.id,
      set: {
        email: input.email || null,
        firstName: input.firstName,
        lastName: input.lastName,
        updatedAt: new Date(),
      },
    });

    await tx.insert(professionalProfiles).values({
      userId,
      profession: input.profession || "Optometrista",
      licenseNumber: input.licenseNumber || null,
      specialty: input.specialty || null,
      country: input.country || null,
      officeName: input.officeName || null,
      officeAddress: input.officeAddress || null,
      officePhone: input.officePhone || null,
      officeEmail: input.officeEmail || null,
      prescriptionName: input.prescriptionName || null,
      prescriptionProfessionalName: input.prescriptionProfessionalName || null,
      prescriptionLicense: input.prescriptionLicense || null,
      prescriptionPhone: input.prescriptionPhone || null,
      prescriptionEmail: input.prescriptionEmail || null,
      prescriptionAddress: input.prescriptionAddress || null,
      logoUri: input.logoUri || null,
      signatureUri: input.signatureUri || null,
    }).onConflictDoUpdate({
      target: professionalProfiles.userId,
      set: {
        profession: input.profession || "Optometrista",
        licenseNumber: input.licenseNumber || null,
        specialty: input.specialty || null,
        country: input.country || null,
        officeName: input.officeName || null,
        officeAddress: input.officeAddress || null,
        officePhone: input.officePhone || null,
        officeEmail: input.officeEmail || null,
        prescriptionName: input.prescriptionName || null,
        prescriptionProfessionalName: input.prescriptionProfessionalName || null,
        prescriptionLicense: input.prescriptionLicense || null,
        prescriptionPhone: input.prescriptionPhone || null,
        prescriptionEmail: input.prescriptionEmail || null,
        prescriptionAddress: input.prescriptionAddress || null,
        logoUri: input.logoUri || null,
        signatureUri: input.signatureUri || null,
        updatedAt: new Date(),
      },
    });
  });
  return res.json(input);
});

router.get("/patients", async (req, res) => {
  const userId = authenticatedUserId(req);
  const parsed = ListPatientsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid patient search" });

  const memberships = await db.select({ organizationId: organizationMembers.organizationId })
    .from(organizationMembers)
    .where(and(eq(organizationMembers.userId, userId), eq(organizationMembers.status, "active")));
  const organizationIds = memberships.map((membership) => membership.organizationId);
  const access = organizationIds.length
    ? or(eq(patients.ownerUserId, userId), inArray(patients.organizationId, organizationIds))
    : eq(patients.ownerUserId, userId);
  const search = parsed.data.q?.trim();
  const query = db.select().from(patients)
    .where(and(
      access,
      search ? or(
        ilike(patients.firstName, `%${search}%`),
        ilike(patients.lastName, `%${search}%`),
        ilike(patients.phone, `%${search}%`),
        ilike(patients.email, `%${search}%`),
      ) : undefined,
    ))
    .orderBy(asc(patients.lastName), asc(patients.firstName))
    .limit(100);
  return res.json(await query);
});

router.post("/patients", async (req, res) => {
  const parsed = CreatePatientBody.safeParse(bodyWithoutBlankOptionalFields(req.body));
  if (!parsed.success) return res.status(400).json({ error: "Invalid patient", issues: parsed.error.issues });

  const userId = authenticatedUserId(req);
  const limit = await getFeatureLimit(userId, null, "patients");
  const input = parsed.data;
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`user:${userId}`}))`);
    await tx.insert(userProfiles).values({ id: userId }).onConflictDoNothing();
    const [current] = await tx.select({ total: count() }).from(patients)
      .where(eq(patients.ownerUserId, userId));
    if ((current?.total ?? 0) >= limit) return null;

    const [created] = await tx.insert(patients).values({
      ownerUserId: userId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      birthDate: dateOnly(input.birthDate),
      sex: input.sex?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      notes: input.notes?.trim() || null,
      status: "active",
    }).returning();
    return created;
  });
  if (!result) return res.status(403).json({ error: "Plan limit reached", feature: "patients", limit });
  return res.status(201).json(result);
});

router.get("/patients/:patientId", async (req, res) => {
  const parsed = GetPatientParams.safeParse(req.params);
  if (!parsed.success) return res.status(404).json({ error: "Patient not found" });
  const visible = await accessiblePatient(authenticatedUserId(req), parsed.data.patientId);
  if (!visible) return res.status(404).json({ error: "Patient not found" });
  return res.json(visible.patient);
});

router.patch("/patients/:patientId", async (req, res) => {
  const params = UpdatePatientParams.safeParse(req.params);
  const body = UpdatePatientBody.safeParse(bodyWithoutBlankOptionalFields(req.body));
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid patient update" });

  const visible = await accessiblePatient(authenticatedUserId(req), params.data.patientId);
  if (!visible) return res.status(404).json({ error: "Patient not found" });
  if (!["owner", "super_admin", "organization_admin", "professional", "reception"].includes(visible.role)) {
    return res.status(403).json({ error: "Insufficient organization role" });
  }
  const input = body.data;
  const [updated] = await db.update(patients).set({
    ...(input.firstName !== undefined ? { firstName: input.firstName.trim() } : {}),
    ...(input.lastName !== undefined ? { lastName: input.lastName.trim() } : {}),
    ...(input.birthDate !== undefined ? { birthDate: dateOnly(input.birthDate) } : {}),
    ...(input.sex !== undefined ? { sex: input.sex.trim() || null } : {}),
    ...(input.phone !== undefined ? { phone: input.phone.trim() || null } : {}),
    ...(input.email !== undefined ? { email: input.email.trim() || null } : {}),
    ...(input.address !== undefined ? { address: input.address.trim() || null } : {}),
    ...(input.notes !== undefined ? { notes: input.notes.trim() || null } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    updatedAt: new Date(),
  }).where(eq(patients.id, visible.patient.id)).returning();
  return res.json(updated);
});

router.get("/patients/:patientId/consultations", async (req, res) => {
  const parsed = ListPatientConsultationsParams.safeParse(req.params);
  if (!parsed.success) return res.status(404).json({ error: "Patient not found" });
  const visible = await accessiblePatient(authenticatedUserId(req), parsed.data.patientId);
  if (!visible) return res.status(404).json({ error: "Patient not found" });
  const records = await db.select().from(clinicalConsultations)
    .where(eq(clinicalConsultations.patientId, visible.patient.id))
    .orderBy(desc(clinicalConsultations.consultationDate), desc(clinicalConsultations.consultationTime));
  return res.json(records);
});

router.post("/patients/:patientId/consultations", async (req, res) => {
  const params = CreatePatientConsultationParams.safeParse(req.params);
  const body = CreatePatientConsultationBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid consultation" });
  const userId = authenticatedUserId(req);
  const visible = await accessiblePatient(userId, params.data.patientId);
  if (!visible) return res.status(404).json({ error: "Patient not found" });
  if (!canWriteClinicalRecords(visible.role)) return res.status(403).json({ error: "Insufficient organization role" });

  const organizationId = visible.patient.organizationId;
  const limit = await getFeatureLimit(userId, organizationId, "exams");
  const input = body.data;
  const consultationDate = dateOnly(input.consultationDate);
  if (!consultationDate) return res.status(400).json({ error: "Consultation date must be a valid YYYY-MM-DD date" });
  const created = await db.transaction(async (tx) => {
    await tx.insert(userProfiles).values({ id: userId }).onConflictDoNothing();
    const allowed = await consumeMonthlyUsage(tx, userId, organizationId, "exams", limit);
    if (!allowed) return null;

    let [history] = await tx.select().from(clinicalHistories)
      .where(eq(clinicalHistories.patientId, visible.patient.id))
      .limit(1);
    if (!history) {
      [history] = await tx.insert(clinicalHistories).values({
        patientId: visible.patient.id,
        ownerUserId: visible.patient.ownerUserId,
        organizationId,
      }).returning();
    }

    const [consultation] = await tx.insert(clinicalConsultations).values({
      historyId: history.id,
      patientId: visible.patient.id,
      professionalId: userId,
      organizationId,
      consultationDate,
      consultationTime: input.consultationTime || null,
      reason: input.reason?.trim() || null,
      observations: input.observations?.trim() || null,
      clinicalData: input.clinicalData,
    }).returning();

    const data = input.clinicalData;
    const sections = ["antecedents", "acuity", "refraction", "tests", "results"];
    for (const category of sections) {
      const section = data[category];
      if (section !== undefined && section !== null) {
        await tx.insert(clinicalTestResults).values({
          consultationId: consultation.id,
          category,
          resultData: typeof section === "object" && !Array.isArray(section)
            ? section as Record<string, unknown>
            : { value: section },
        });
      }
    }
    return consultation;
  });
  if (!created) return res.status(403).json({ error: "Plan limit reached", feature: "exams", limit });
  return res.status(201).json(created);
});

router.get("/patients/:patientId/prescriptions", async (req, res) => {
  const parsed = ListPatientPrescriptionsParams.safeParse(req.params);
  if (!parsed.success) return res.status(404).json({ error: "Patient not found" });
  const visible = await accessiblePatient(authenticatedUserId(req), parsed.data.patientId);
  if (!visible) return res.status(404).json({ error: "Patient not found" });
  const records = await db.select().from(prescriptions)
    .where(eq(prescriptions.patientId, visible.patient.id))
    .orderBy(desc(prescriptions.issuedAt), desc(prescriptions.createdAt));
  return res.json(records);
});

router.post("/patients/:patientId/prescriptions", async (req, res) => {
  const params = CreatePatientPrescriptionParams.safeParse(req.params);
  const body = CreatePatientPrescriptionBody.safeParse(req.body);
  if (!params.success || !body.success) return res.status(400).json({ error: "Invalid prescription" });
  const userId = authenticatedUserId(req);
  const visible = await accessiblePatient(userId, params.data.patientId);
  if (!visible) return res.status(404).json({ error: "Patient not found" });
  if (!canWriteClinicalRecords(visible.role)) return res.status(403).json({ error: "Insufficient organization role" });

  if (body.data.consultationId) {
    const [consultation] = await db.select({ id: clinicalConsultations.id })
      .from(clinicalConsultations)
      .where(and(
        eq(clinicalConsultations.id, body.data.consultationId),
        eq(clinicalConsultations.patientId, visible.patient.id),
      ))
      .limit(1);
    if (!consultation) return res.status(400).json({ error: "Consultation does not belong to this patient" });
  }

  const issuedAt = dateOnly(body.data.issuedAt);
  if (!issuedAt) return res.status(400).json({ error: "Prescription date must be a valid YYYY-MM-DD date" });
  const limit = await getFeatureLimit(userId, visible.patient.organizationId, "prescriptions");
  const created = await db.transaction(async (tx) => {
    const allowed = await consumeMonthlyUsage(tx, userId, visible.patient.organizationId, "prescriptions", limit);
    if (!allowed) return null;
    const [record] = await tx.insert(prescriptions).values({
      patientId: visible.patient.id,
      consultationId: body.data.consultationId ?? null,
      professionalId: userId,
      organizationId: visible.patient.organizationId,
      issuedAt,
      prescriptionData: body.data.prescriptionData,
      professionalSnapshot: body.data.professionalSnapshot,
    }).returning();
    return record;
  });
  if (!created) return res.status(403).json({ error: "Plan limit reached", feature: "prescriptions", limit });
  return res.status(201).json(created);
});

router.get("/clinical-draft", async (req, res) => {
  const userId = authenticatedUserId(req);
  const [draft] = await db.select().from(clinicalDrafts)
    .where(eq(clinicalDrafts.userId, userId))
    .limit(1);
  if (!draft) return res.json(null);
  return res.json({
    ...(draft.patientId ? { patientId: draft.patientId } : {}),
    draftData: draft.draftData,
    updatedAt: draft.updatedAt,
  });
});

router.put("/clinical-draft", async (req, res) => {
  const parsed = SaveClinicalDraftBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid clinical draft", issues: parsed.error.issues });

  const userId = authenticatedUserId(req);
  const patientId = parsed.data.patientId ?? null;
  const visible = patientId ? await accessiblePatient(userId, patientId) : null;
  if (patientId && !visible) return res.status(404).json({ error: "Patient not found" });
  await db.insert(userProfiles).values({ id: userId }).onConflictDoNothing();
  const [draft] = await db.insert(clinicalDrafts).values({
    userId,
    patientId,
    organizationId: visible?.patient.organizationId ?? null,
    draftData: parsed.data.draftData,
  }).onConflictDoUpdate({
    target: clinicalDrafts.userId,
    set: {
      patientId,
      organizationId: visible?.patient.organizationId ?? null,
      draftData: parsed.data.draftData,
      updatedAt: new Date(),
    },
  }).returning();
  return res.json({
    ...(draft.patientId ? { patientId: draft.patientId } : {}),
    draftData: draft.draftData,
    updatedAt: draft.updatedAt,
  });
});

router.delete("/clinical-draft", async (req, res) => {
  const userId = authenticatedUserId(req);
  await db.delete(clinicalDrafts).where(eq(clinicalDrafts.userId, userId));
  return res.status(204).end();
});

export default router;
