DROP INDEX "usage_counters_subject_month_feature_uq";--> statement-breakpoint
ALTER TABLE "usage_counters" ADD COLUMN "account_key" varchar(180) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "usage_counters_subject_month_feature_uq" ON "usage_counters" USING btree ("account_key","usage_month","feature");