CREATE TYPE "public"."portal_role" AS ENUM('ADMIN', 'SUPERADMIN');--> statement-breakpoint
CREATE TABLE "portal_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "portal_role" DEFAULT 'ADMIN' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portal_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "portal_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portal_audit_logs" ADD CONSTRAINT "portal_audit_logs_user_id_portal_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."portal_users"("id") ON DELETE set null ON UPDATE no action;