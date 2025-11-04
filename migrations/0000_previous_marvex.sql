CREATE TABLE "auth_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'User' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_users_username_unique" UNIQUE("username"),
	CONSTRAINT "auth_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "call_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" text NOT NULL,
	"call_agent_name" text NOT NULL,
	"date_time" timestamp DEFAULT now() NOT NULL,
	"call_status" text NOT NULL,
	"phone_number" text NOT NULL,
	"duration" text,
	"remarks" text,
	"call_type" text
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_name" text NOT NULL,
	"ftd" text NOT NULL,
	"deposit" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"brand_name" text NOT NULL,
	"ftd_count" integer DEFAULT 0,
	"deposit_count" integer DEFAULT 0,
	"total_calls" integer DEFAULT 0,
	"successful_calls" integer DEFAULT 0,
	"unsuccessful_calls" integer DEFAULT 0,
	"failed_calls" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "google_sheets_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spreadsheet_id" text,
	"spreadsheet_url" text,
	"access_token" text,
	"refresh_token" text,
	"token_expiry" timestamp,
	"is_connected" integer DEFAULT 0,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"department" text,
	"brand" text,
	"country" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"join_date" timestamp,
	"photo_url" text,
	"date_of_birth" text,
	"available_leave" integer,
	CONSTRAINT "staff_employee_id_unique" UNIQUE("employee_id"),
	CONSTRAINT "staff_email_unique" UNIQUE("email")
);
