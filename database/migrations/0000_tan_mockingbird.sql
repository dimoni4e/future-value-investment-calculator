-- Guard enum creation to allow rerunning migrations if type already exists
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'locale') THEN
		CREATE TYPE "public"."locale" AS ENUM('en', 'pl', 'es');
	END IF;
END $$;--> statement-breakpoint
CREATE TABLE "home_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" "locale" NOT NULL,
	"section" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"locale" "locale" NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"meta_description" varchar(300),
	"meta_keywords" text,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"locale" "locale" NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"initial_amount" numeric(15, 2) NOT NULL,
	"monthly_contribution" numeric(15, 2) NOT NULL,
	"annual_return" numeric(5, 2) NOT NULL,
	"time_horizon" integer NOT NULL,
	"tags" text[],
	"is_predefined" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_by" varchar(100) DEFAULT 'system' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_content_key" ON "home_content" USING btree ("locale","section","key");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_page_locale" ON "pages" USING btree ("slug","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_scenario_locale" ON "scenario" USING btree ("slug","locale");