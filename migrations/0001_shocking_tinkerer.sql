ALTER TABLE "vendors" ADD COLUMN "total_earnings" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "wallet_balance" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "admin_notes" text;