CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"provider" varchar(40) NOT NULL,
	"provider_subject" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical_consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"history_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"professional_id" text NOT NULL,
	"organization_id" uuid,
	"consultation_date" date NOT NULL,
	"consultation_time" varchar(8),
	"reason" text,
	"observations" text,
	"clinical_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"owner_user_id" text NOT NULL,
	"organization_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinical_histories_patient_id_unique" UNIQUE("patient_id")
);
--> statement-breakpoint
CREATE TABLE "clinical_test_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"category" varchar(100) NOT NULL,
	"result_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"plan_id" varchar(40) NOT NULL,
	"seat_count" integer DEFAULT 1 NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_licenses_seats_positive" CHECK ("organization_licenses"."seat_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" varchar(32) DEFAULT 'professional' NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_role_check" CHECK ("organization_members"."role" in ('super_admin', 'organization_admin', 'professional', 'reception'))
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"organization_id" uuid PRIMARY KEY NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_by" text NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" text NOT NULL,
	"organization_id" uuid,
	"first_name" varchar(120) NOT NULL,
	"last_name" varchar(160) NOT NULL,
	"birth_date" date,
	"sex" varchar(40),
	"phone" varchar(60),
	"email" varchar(320),
	"address" text,
	"notes" text,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar(40) PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" text,
	"price_label" varchar(120) DEFAULT 'Precio por configurar' NOT NULL,
	"limits" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"consultation_id" uuid,
	"professional_id" text NOT NULL,
	"organization_id" uuid,
	"issued_at" date NOT NULL,
	"prescription_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"professional_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professional_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"profession" varchar(160) DEFAULT 'Optometrista' NOT NULL,
	"license_number" varchar(160),
	"specialty" varchar(160),
	"country" varchar(100),
	"office_name" varchar(200),
	"office_address" text,
	"office_phone" varchar(60),
	"office_email" varchar(320),
	"prescription_name" varchar(200),
	"prescription_professional_name" varchar(200),
	"prescription_license" varchar(160),
	"prescription_phone" varchar(60),
	"prescription_email" varchar(320),
	"prescription_address" text,
	"logo_uri" text,
	"signature_uri" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"organization_id" uuid,
	"plan_id" varchar NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_owner_check" CHECK (("subscriptions"."user_id" is not null) or ("subscriptions"."organization_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sender_user_id" text,
	"sender_role" varchar(24) NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" varchar(32) NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" uuid,
	"category" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"priority" varchar(24) DEFAULT 'normal' NOT NULL,
	"status" varchar(24) DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number"),
	CONSTRAINT "support_tickets_priority_check" CHECK ("support_tickets"."priority" in ('low', 'normal', 'high')),
	CONSTRAINT "support_tickets_status_check" CHECK ("support_tickets"."status" in ('open', 'review', 'in_progress', 'resolved', 'closed'))
);
--> statement-breakpoint
CREATE TABLE "usage_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" uuid,
	"usage_month" varchar(7) NOT NULL,
	"feature" varchar(40) NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usage_counters_nonnegative_check" CHECK ("usage_counters"."used" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(320),
	"first_name" varchar(120) DEFAULT '' NOT NULL,
	"last_name" varchar(120) DEFAULT '' NOT NULL,
	"status" varchar(24) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_consultations" ADD CONSTRAINT "clinical_consultations_history_id_clinical_histories_id_fk" FOREIGN KEY ("history_id") REFERENCES "public"."clinical_histories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_consultations" ADD CONSTRAINT "clinical_consultations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_consultations" ADD CONSTRAINT "clinical_consultations_professional_id_user_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_consultations" ADD CONSTRAINT "clinical_consultations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_histories" ADD CONSTRAINT "clinical_histories_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_histories" ADD CONSTRAINT "clinical_histories_owner_user_id_user_profiles_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_histories" ADD CONSTRAINT "clinical_histories_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_test_results" ADD CONSTRAINT "clinical_test_results_consultation_id_clinical_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."clinical_consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_licenses" ADD CONSTRAINT "organization_licenses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_owner_user_id_user_profiles_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_consultation_id_clinical_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."clinical_consultations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_professional_id_user_profiles_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."user_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_user_id_user_profiles_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_provider_subject_uq" ON "auth_identities" USING btree ("provider","provider_subject");--> statement-breakpoint
CREATE INDEX "auth_identities_user_idx" ON "auth_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "clinical_consultations_patient_date_idx" ON "clinical_consultations" USING btree ("patient_id","consultation_date");--> statement-breakpoint
CREATE INDEX "clinical_consultations_professional_date_idx" ON "clinical_consultations" USING btree ("professional_id","consultation_date");--> statement-breakpoint
CREATE INDEX "clinical_consultations_org_date_idx" ON "clinical_consultations" USING btree ("organization_id","consultation_date");--> statement-breakpoint
CREATE INDEX "clinical_histories_owner_idx" ON "clinical_histories" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "clinical_test_results_consultation_idx" ON "clinical_test_results" USING btree ("consultation_id");--> statement-breakpoint
CREATE INDEX "organization_licenses_org_status_idx" ON "organization_licenses" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_org_user_uq" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "patients_owner_name_idx" ON "patients" USING btree ("owner_user_id","last_name","first_name");--> statement-breakpoint
CREATE INDEX "patients_owner_phone_idx" ON "patients" USING btree ("owner_user_id","phone");--> statement-breakpoint
CREATE INDEX "patients_org_name_idx" ON "patients" USING btree ("organization_id","last_name","first_name");--> statement-breakpoint
CREATE INDEX "prescriptions_patient_date_idx" ON "prescriptions" USING btree ("patient_id","issued_at");--> statement-breakpoint
CREATE INDEX "prescriptions_professional_idx" ON "prescriptions" USING btree ("professional_id");--> statement-breakpoint
CREATE INDEX "subscriptions_user_status_idx" ON "subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "subscriptions_org_status_idx" ON "subscriptions" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "support_messages_ticket_created_idx" ON "support_messages" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE INDEX "support_tickets_user_created_idx" ON "support_tickets" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "support_tickets_org_status_idx" ON "support_tickets" USING btree ("organization_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_counters_subject_month_feature_uq" ON "usage_counters" USING btree ("user_id","organization_id","usage_month","feature");--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_email_uq" ON "user_profiles" USING btree ("email");