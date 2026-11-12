CREATE TYPE "portal_role" AS ENUM ('ADMIN', 'SUPERADMIN');

CREATE TABLE IF NOT EXISTS "portal_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "password_hash" text NOT NULL,
  "role" "portal_role" NOT NULL DEFAULT 'ADMIN',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "portal_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid REFERENCES "portal_users"("id") ON DELETE SET NULL,
  "action" text NOT NULL,
  "resource_type" text NOT NULL,
  "resource_id" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "audit_logs_user_idx" ON "portal_audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_resource_idx" ON "portal_audit_logs" ("resource_type", "resource_id");
