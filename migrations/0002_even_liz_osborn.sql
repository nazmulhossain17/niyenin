CREATE TABLE "review_helpful" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "review_helpful_user_review_unique" UNIQUE("user_id","review_id")
);
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_order_id_orders_order_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_order_item_id_order_items_order_item_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_moderated_by_user_id_fk";
--> statement-breakpoint
DROP INDEX "review_product_idx";--> statement-breakpoint
DROP INDEX "review_user_idx";--> statement-breakpoint
DROP INDEX "review_approved_idx";--> statement-breakpoint
DROP INDEX "review_rating_idx";--> statement-breakpoint
DROP INDEX "review_unique_idx";--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "title" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "comment" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "images" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "review_helpful" ADD CONSTRAINT "review_helpful_review_id_reviews_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("review_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_helpful" ADD CONSTRAINT "review_helpful_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "review_helpful_review_id_idx" ON "review_helpful" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_helpful_user_id_idx" ON "review_helpful" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_product_id_idx" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "order_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "order_item_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "is_approved";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "moderated_by";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "moderated_at";--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_product_unique" UNIQUE("user_id","product_id");