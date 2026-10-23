import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 320 }),
  firstName: varchar("first_name", { length: 120 }).notNull().default(""),
  lastName: varchar("last_name", { length: 120 }).notNull().default(""),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("user_profiles_email_uq").on(table.email),
]);

export const authIdentities = pgTable("auth_identities", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 40 }).notNull(),
  providerSubject: varchar("provider_subject", { length: 255 }).notNull(),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex("auth_identities_provider_subject_uq").on(table.provider, table.providerSubject),
  index("auth_identities_user_idx").on(table.userId),
]);

export const professionalProfiles = pgTable("professional_profiles", {
  userId: text("user_id").primaryKey().references(() => userProfiles.id, { onDelete: "cascade" }),
  profession: varchar("profession", { length: 160 }).notNull().default("Optometrista"),
  licenseNumber: varchar("license_number", { length: 160 }),
  specialty: varchar("specialty", { length: 160 }),
  country: varchar("country", { length: 100 }),
  officeName: varchar("office_name", { length: 200 }),
  officeAddress: text("office_address"),
  officePhone: varchar("office_phone", { length: 60 }),
  officeEmail: varchar("office_email", { length: 320 }),
  prescriptionName: varchar("prescription_name", { length: 200 }),
  prescriptionProfessionalName: varchar("prescription_professional_name", { length: 200 }),
  prescriptionLicense: varchar("prescription_license", { length: 160 }),
  prescriptionPhone: varchar("prescription_phone", { length: 60 }),
  prescriptionEmail: varchar("prescription_email", { length: 320 }),
  prescriptionAddress: text("prescription_address"),
  logoUri: text("logo_uri"),
  signatureUri: text("signature_uri"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  createdBy: text("created_by").notNull().references(() => userProfiles.id),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 32 }).notNull().default("professional"),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex("organization_members_org_user_uq").on(table.organizationId, table.userId),
  index("organization_members_user_idx").on(table.userId),
  check("organization_members_role_check", sql`${table.role} in ('super_admin', 'organization_admin', 'professional', 'reception')`),
]);

export const organizationLicenses = pgTable("organization_licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  planId: varchar("plan_id", { length: 40 }).notNull(),
  seatCount: integer("seat_count").notNull().default(1),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: createdAt(),
}, (table) => [
  check("organization_licenses_seats_positive", sql`${table.seatCount} > 0`),
  index("organization_licenses_org_status_idx").on(table.organizationId, table.status),
]);

export const patients = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: text("owner_user_id").notNull().references(() => userProfiles.id),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 160 }).notNull(),
  birthDate: date("birth_date"),
  sex: varchar("sex", { length: 40 }),
  phone: varchar("phone", { length: 60 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  notes: text("notes"),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("patients_owner_name_idx").on(table.ownerUserId, table.lastName, table.firstName),
  index("patients_owner_phone_idx").on(table.ownerUserId, table.phone),
  index("patients_org_name_idx").on(table.organizationId, table.lastName, table.firstName),
]);

export const clinicalHistories = pgTable("clinical_histories", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").notNull().unique().references(() => patients.id, { onDelete: "cascade" }),
  ownerUserId: text("owner_user_id").notNull().references(() => userProfiles.id),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("clinical_histories_owner_idx").on(table.ownerUserId),
]);

export const clinicalConsultations = pgTable("clinical_consultations", {
  id: uuid("id").defaultRandom().primaryKey(),
  historyId: uuid("history_id").notNull().references(() => clinicalHistories.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  professionalId: text("professional_id").notNull().references(() => userProfiles.id),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  consultationDate: date("consultation_date").notNull(),
  consultationTime: varchar("consultation_time", { length: 8 }),
  reason: text("reason"),
  observations: text("observations"),
  clinicalData: jsonb("clinical_data").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: createdAt(),
}, (table) => [
  index("clinical_consultations_patient_date_idx").on(table.patientId, table.consultationDate),
  index("clinical_consultations_professional_date_idx").on(table.professionalId, table.consultationDate),
  index("clinical_consultations_org_date_idx").on(table.organizationId, table.consultationDate),
]);

export const clinicalTestResults = pgTable("clinical_test_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  consultationId: uuid("consultation_id").notNull().references(() => clinicalConsultations.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 100 }).notNull(),
  resultData: jsonb("result_data").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: createdAt(),
}, (table) => [
  index("clinical_test_results_consultation_idx").on(table.consultationId),
]);

export const clinicalDrafts = pgTable("clinical_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id").references(() => patients.id, { onDelete: "set null" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  draftData: jsonb("draft_data").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: updatedAt(),
  createdAt: createdAt(),
}, (table) => [
  uniqueIndex("clinical_drafts_user_uq").on(table.userId),
]);

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  consultationId: uuid("consultation_id").references(() => clinicalConsultations.id, { onDelete: "set null" }),
  professionalId: text("professional_id").notNull().references(() => userProfiles.id),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  issuedAt: date("issued_at").notNull(),
  prescriptionData: jsonb("prescription_data").$type<Record<string, unknown>>().notNull().default({}),
  professionalSnapshot: jsonb("professional_snapshot").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: createdAt(),
}, (table) => [
  index("prescriptions_patient_date_idx").on(table.patientId, table.issuedAt),
  index("prescriptions_professional_idx").on(table.professionalId),
]);

export const plans = pgTable("plans", {
  id: varchar("id", { length: 40 }).primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  description: text("description"),
  priceLabel: varchar("price_label", { length: 120 }).notNull().default("Precio por configurar"),
  limits: jsonb("limits").$type<Record<string, number>>().notNull().default({}),
  active: boolean("active").notNull().default(true),
  updatedAt: updatedAt(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => userProfiles.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  status: varchar("status", { length: 24 }).notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("subscriptions_user_status_idx").on(table.userId, table.status),
  index("subscriptions_org_status_idx").on(table.organizationId, table.status),
  check("subscriptions_owner_check", sql`(${table.userId} is not null) or (${table.organizationId} is not null)`),
]);

export const usageCounters = pgTable("usage_counters", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountKey: varchar("account_key", { length: 180 }).notNull(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  usageMonth: varchar("usage_month", { length: 7 }).notNull(),
  feature: varchar("feature", { length: 40 }).notNull(),
  used: integer("used").notNull().default(0),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("usage_counters_subject_month_feature_uq").on(table.accountKey, table.usageMonth, table.feature),
  check("usage_counters_nonnegative_check", sql`${table.used} >= 0`),
]);

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 32 }).notNull().unique(),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 24 }).notNull().default("normal"),
  status: varchar("status", { length: 24 }).notNull().default("open"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  index("support_tickets_user_created_idx").on(table.userId, table.createdAt),
  index("support_tickets_org_status_idx").on(table.organizationId, table.status),
  check("support_tickets_priority_check", sql`${table.priority} in ('low', 'normal', 'high')`),
  check("support_tickets_status_check", sql`${table.status} in ('open', 'review', 'in_progress', 'resolved', 'closed')`),
]);

export const supportMessages = pgTable("support_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  senderUserId: text("sender_user_id").references(() => userProfiles.id, { onDelete: "set null" }),
  senderRole: varchar("sender_role", { length: 24 }).notNull(),
  message: text("message").notNull(),
  createdAt: createdAt(),
}, (table) => [
  index("support_messages_ticket_created_idx").on(table.ticketId, table.createdAt),
]);

export const organizationSettings = pgTable("organization_settings", {
  organizationId: uuid("organization_id").primaryKey().references(() => organizations.id, { onDelete: "cascade" }),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: updatedAt(),
});
