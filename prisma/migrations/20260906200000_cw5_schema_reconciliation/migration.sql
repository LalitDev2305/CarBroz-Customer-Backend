-- CW5 fresh-database schema reconciliation.
--
-- This migration is derived from Prisma's semantic diff between a brand-new
-- PostgreSQL database produced by the complete checked-in migration history
-- and prisma/schema.prisma.
--
-- The SduiScreen physical-name reconciliation intentionally uses RENAME COLUMN
-- instead of Prisma's generated DROP/ADD sequence so existing versioning data
-- is preserved while the resulting schema remains identical to the datamodel.

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CREATED', 'CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'UPI', 'NETBANKING', 'WALLET', 'CASH_ON_DELIVERY', 'CORPORATE_CREDIT');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('SCHEDULED', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrackingStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'FLAGGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "CorporateAccountStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CorporateMemberRole" AS ENUM ('CORP_ADMIN', 'FLEET_MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "CorporateLedgerEntryType" AS ENUM ('CREDIT_GRANTED', 'BOOKING_DEBIT', 'BOOKING_REFUND_CREDIT', 'PAYMENT_CREDIT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "CorporateInvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');

-- DropIndex before renaming the indexed physical version column.
DROP INDEX "SduiScreen_screenId_targetApp_version_number_key";

-- AlterTable
ALTER TABLE "PartnerProfile" ADD COLUMN     "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "rating_1_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating_2_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating_3_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating_4_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rating_5_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SduiComponentRegistry" ADD COLUMN     "nodeLevel" TEXT NOT NULL DEFAULT 'COMPONENT',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "supportedActions" JSONB,
ADD COLUMN     "supportedProperties" JSONB,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- Preserve existing SDUI versioning data while reconciling physical names.
ALTER TABLE "SduiScreen" RENAME COLUMN "change_description" TO "changeDescription";
ALTER TABLE "SduiScreen" RENAME COLUMN "created_from_version" TO "createdFromVersion";
ALTER TABLE "SduiScreen" RENAME COLUMN "lock_version" TO "lockVersion";
ALTER TABLE "SduiScreen" RENAME COLUMN "published_at" TO "publishedAt";
ALTER TABLE "SduiScreen" RENAME COLUMN "published_by" TO "publishedBy";
ALTER TABLE "SduiScreen" RENAME COLUMN "version_number" TO "versionNumber";

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT,
    "year" INTEGER NOT NULL,
    "registration_number" TEXT NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "color" TEXT,
    "nickname" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "partner_id" INTEGER,
    "vehicle_id" INTEGER NOT NULL,
    "address_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CREATED',
    "slot_start_time" TIMESTAMP(3) NOT NULL,
    "slot_end_time" TIMESTAMP(3) NOT NULL,
    "expiry_at" TIMESTAMP(3),
    "total_price_paise" INTEGER NOT NULL,
    "cancellation_reason" TEXT,
    "snapshots_json" JSONB NOT NULL,
    "status_history_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "corporate_account_id" INTEGER,
    "corporate_fleet_vehicle_id" INTEGER,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "provider_order_id" TEXT,
    "provider_payment_id" TEXT,
    "amount_paise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "method" "PaymentMethod" NOT NULL DEFAULT 'UPI',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" TEXT NOT NULL,
    "attempts_json" JSONB NOT NULL DEFAULT '[]',
    "refunds_json" JSONB NOT NULL DEFAULT '[]',
    "failure_code" TEXT,
    "failure_reason" TEXT,
    "paid_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "lock_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhooks" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload_hash" TEXT NOT NULL,
    "processing_status" TEXT NOT NULL DEFAULT 'PENDING',
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED',
    "amount_paise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "document_json" JSONB NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_payouts" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'SCHEDULED',
    "gross_amount_paise" INTEGER NOT NULL,
    "commission_paise" INTEGER NOT NULL,
    "tds_paise" INTEGER NOT NULL,
    "net_payout_paise" INTEGER NOT NULL,
    "calculation_json" JSONB NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "external_reference" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_sequences" (
    "year" INTEGER NOT NULL,
    "last_seq" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_sequences_pkey" PRIMARY KEY ("year")
);

-- CreateTable
CREATE TABLE "tracking_sessions" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "current_latitude" DOUBLE PRECISION NOT NULL,
    "current_longitude" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "eta_minutes" INTEGER,
    "status" "TrackingStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "booking_id" INTEGER,
    "recipient_id" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "provider_reference" TEXT,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "error_code" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "app_version" TEXT,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "partner_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "moderation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "max_discount_paise" INTEGER,
    "min_booking_amount_paise" INTEGER NOT NULL DEFAULT 0,
    "usage_limit" INTEGER,
    "per_user_limit" INTEGER NOT NULL DEFAULT 1,
    "current_usage_count" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_usages" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "coupon_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "discount_amount_paise" INTEGER NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "actor_id" INTEGER,
    "actor_type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_public_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "correlation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "raised_by_actor_id" INTEGER NOT NULL,
    "raised_by_actor_type" TEXT NOT NULL,
    "dispute_reason" TEXT NOT NULL,
    "description" TEXT,
    "requested_refund_paise" INTEGER NOT NULL DEFAULT 0,
    "refunded_amount_paise" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution_notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_accounts" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "billing_address" JSONB NOT NULL,
    "credit_limit_paise" BIGINT NOT NULL DEFAULT 0,
    "utilised_credit_paise" BIGINT NOT NULL DEFAULT 0,
    "status" "CorporateAccountStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "payment_terms_days" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_members" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "corporate_account_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" "CorporateMemberRole" NOT NULL DEFAULT 'EMPLOYEE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "monthly_cap_paise" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_fleet_vehicles" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "corporate_account_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "department" TEXT,
    "cost_center" TEXT,
    "monthly_cap_paise" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_fleet_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_credit_ledgers" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "corporate_account_id" INTEGER NOT NULL,
    "booking_id" INTEGER,
    "invoice_id" INTEGER,
    "entry_type" "CorporateLedgerEntryType" NOT NULL,
    "amount_paise" BIGINT NOT NULL,
    "balance_after_paise" BIGINT NOT NULL,
    "reference_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_credit_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_invoices" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "corporate_account_id" INTEGER NOT NULL,
    "billing_period_start" TIMESTAMP(3) NOT NULL,
    "billing_period_end" TIMESTAMP(3) NOT NULL,
    "subtotal_paise" BIGINT NOT NULL,
    "cgst_paise" BIGINT NOT NULL,
    "sgst_paise" BIGINT NOT NULL,
    "igst_paise" BIGINT NOT NULL,
    "total_amount_paise" BIGINT NOT NULL,
    "paid_amount_paise" BIGINT NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "CorporateInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_invoice_lines" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "corporate_invoice_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount_paise" BIGINT NOT NULL,
    "tax_rate_basis" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corporate_invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_publicId_key" ON "vehicles"("publicId");
CREATE INDEX "vehicles_customer_id_status_idx" ON "vehicles"("customer_id", "status");
CREATE UNIQUE INDEX "vehicles_customer_id_registration_number_key" ON "vehicles"("customer_id", "registration_number");

CREATE UNIQUE INDEX "bookings_publicId_key" ON "bookings"("publicId");
CREATE INDEX "bookings_customer_id_status_idx" ON "bookings"("customer_id", "status");
CREATE INDEX "bookings_partner_id_status_idx" ON "bookings"("partner_id", "status");
CREATE INDEX "bookings_partner_id_slot_start_time_slot_end_time_idx" ON "bookings"("partner_id", "slot_start_time", "slot_end_time");
CREATE INDEX "bookings_status_expiry_at_idx" ON "bookings"("status", "expiry_at");
CREATE INDEX "bookings_corporate_account_id_idx" ON "bookings"("corporate_account_id");

CREATE UNIQUE INDEX "payments_publicId_key" ON "payments"("publicId");
CREATE UNIQUE INDEX "payments_provider_order_id_key" ON "payments"("provider_order_id");
CREATE UNIQUE INDEX "payments_provider_payment_id_key" ON "payments"("provider_payment_id");
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");
CREATE INDEX "payments_booking_id_status_idx" ON "payments"("booking_id", "status");
CREATE INDEX "payments_customer_id_status_idx" ON "payments"("customer_id", "status");

CREATE UNIQUE INDEX "payment_webhooks_publicId_key" ON "payment_webhooks"("publicId");
CREATE INDEX "payment_webhooks_processing_status_received_at_idx" ON "payment_webhooks"("processing_status", "received_at");
CREATE UNIQUE INDEX "payment_webhooks_provider_event_id_key" ON "payment_webhooks"("provider", "event_id");

CREATE UNIQUE INDEX "invoices_publicId_key" ON "invoices"("publicId");
CREATE UNIQUE INDEX "invoices_booking_id_key" ON "invoices"("booking_id");
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

CREATE UNIQUE INDEX "partner_payouts_publicId_key" ON "partner_payouts"("publicId");
CREATE UNIQUE INDEX "partner_payouts_booking_id_key" ON "partner_payouts"("booking_id");
CREATE INDEX "partner_payouts_partner_id_status_idx" ON "partner_payouts"("partner_id", "status");
CREATE INDEX "partner_payouts_status_scheduled_at_idx" ON "partner_payouts"("status", "scheduled_at");

CREATE UNIQUE INDEX "tracking_sessions_publicId_key" ON "tracking_sessions"("publicId");
CREATE UNIQUE INDEX "tracking_sessions_booking_id_key" ON "tracking_sessions"("booking_id");
CREATE INDEX "tracking_sessions_booking_id_status_idx" ON "tracking_sessions"("booking_id", "status");
CREATE INDEX "tracking_sessions_partner_id_status_idx" ON "tracking_sessions"("partner_id", "status");

CREATE UNIQUE INDEX "notification_logs_publicId_key" ON "notification_logs"("publicId");
CREATE INDEX "notification_logs_recipient_id_status_idx" ON "notification_logs"("recipient_id", "status");
CREATE INDEX "notification_logs_channel_status_idx" ON "notification_logs"("channel", "status");

CREATE UNIQUE INDEX "device_tokens_publicId_key" ON "device_tokens"("publicId");
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");
CREATE INDEX "device_tokens_user_id_is_active_idx" ON "device_tokens"("user_id", "is_active");
CREATE UNIQUE INDEX "device_tokens_user_id_device_id_key" ON "device_tokens"("user_id", "device_id");

CREATE UNIQUE INDEX "reviews_publicId_key" ON "reviews"("publicId");
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");
CREATE INDEX "reviews_partner_id_status_idx" ON "reviews"("partner_id", "status");
CREATE INDEX "reviews_partner_id_created_at_idx" ON "reviews"("partner_id", "created_at");
CREATE INDEX "reviews_customer_id_idx" ON "reviews"("customer_id");

CREATE UNIQUE INDEX "coupons_publicId_key" ON "coupons"("publicId");
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE INDEX "coupons_code_is_active_idx" ON "coupons"("code", "is_active");
CREATE INDEX "coupons_is_active_valid_until_idx" ON "coupons"("is_active", "valid_until");

CREATE UNIQUE INDEX "coupon_usages_publicId_key" ON "coupon_usages"("publicId");
CREATE INDEX "coupon_usages_user_id_coupon_id_idx" ON "coupon_usages"("user_id", "coupon_id");
CREATE INDEX "coupon_usages_user_id_used_at_idx" ON "coupon_usages"("user_id", "used_at");
CREATE UNIQUE INDEX "coupon_usages_coupon_id_booking_id_key" ON "coupon_usages"("coupon_id", "booking_id");

CREATE UNIQUE INDEX "audit_logs_publicId_key" ON "audit_logs"("publicId");
CREATE INDEX "audit_logs_actor_id_action_idx" ON "audit_logs"("actor_id", "action");
CREATE INDEX "audit_logs_resource_resource_public_id_idx" ON "audit_logs"("resource", "resource_public_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

CREATE UNIQUE INDEX "disputes_publicId_key" ON "disputes"("publicId");
CREATE INDEX "disputes_booking_id_idx" ON "disputes"("booking_id");
CREATE INDEX "disputes_status_idx" ON "disputes"("status");
CREATE INDEX "disputes_raised_by_actor_id_raised_by_actor_type_idx" ON "disputes"("raised_by_actor_id", "raised_by_actor_type");
CREATE INDEX "disputes_created_at_idx" ON "disputes"("created_at");

CREATE UNIQUE INDEX "corporate_accounts_publicId_key" ON "corporate_accounts"("publicId");
CREATE UNIQUE INDEX "corporate_accounts_gstin_key" ON "corporate_accounts"("gstin");
CREATE INDEX "corporate_accounts_status_idx" ON "corporate_accounts"("status");

CREATE UNIQUE INDEX "corporate_members_publicId_key" ON "corporate_members"("publicId");
CREATE INDEX "corporate_members_user_id_idx" ON "corporate_members"("user_id");
CREATE UNIQUE INDEX "corporate_members_corporate_account_id_user_id_key" ON "corporate_members"("corporate_account_id", "user_id");

CREATE UNIQUE INDEX "corporate_fleet_vehicles_publicId_key" ON "corporate_fleet_vehicles"("publicId");
CREATE INDEX "corporate_fleet_vehicles_vehicle_id_idx" ON "corporate_fleet_vehicles"("vehicle_id");
CREATE UNIQUE INDEX "corporate_fleet_vehicles_corporate_account_id_vehicle_id_key" ON "corporate_fleet_vehicles"("corporate_account_id", "vehicle_id");

CREATE UNIQUE INDEX "corporate_credit_ledgers_publicId_key" ON "corporate_credit_ledgers"("publicId");
CREATE INDEX "corporate_credit_ledgers_corporate_account_id_created_at_idx" ON "corporate_credit_ledgers"("corporate_account_id", "created_at");

CREATE UNIQUE INDEX "corporate_invoices_publicId_key" ON "corporate_invoices"("publicId");
CREATE UNIQUE INDEX "corporate_invoices_invoice_number_key" ON "corporate_invoices"("invoice_number");
CREATE INDEX "corporate_invoices_corporate_account_id_status_idx" ON "corporate_invoices"("corporate_account_id", "status");

CREATE UNIQUE INDEX "corporate_invoice_lines_publicId_key" ON "corporate_invoice_lines"("publicId");
CREATE UNIQUE INDEX "corporate_invoice_lines_booking_id_key" ON "corporate_invoice_lines"("booking_id");

CREATE UNIQUE INDEX "SduiScreen_screenId_targetApp_versionNumber_key" ON "SduiScreen"("screenId", "targetApp", "versionNumber");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "CustomerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_corporate_account_id_fkey" FOREIGN KEY ("corporate_account_id") REFERENCES "corporate_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_corporate_fleet_vehicle_id_fkey" FOREIGN KEY ("corporate_fleet_vehicle_id") REFERENCES "corporate_fleet_vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "partner_payouts" ADD CONSTRAINT "partner_payouts_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "partner_payouts" ADD CONSTRAINT "partner_payouts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tracking_sessions" ADD CONSTRAINT "tracking_sessions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tracking_sessions" ADD CONSTRAINT "tracking_sessions_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tracking_sessions" ADD CONSTRAINT "tracking_sessions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "disputes" ADD CONSTRAINT "disputes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "corporate_members" ADD CONSTRAINT "corporate_members_corporate_account_id_fkey" FOREIGN KEY ("corporate_account_id") REFERENCES "corporate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corporate_members" ADD CONSTRAINT "corporate_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "corporate_fleet_vehicles" ADD CONSTRAINT "corporate_fleet_vehicles_corporate_account_id_fkey" FOREIGN KEY ("corporate_account_id") REFERENCES "corporate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corporate_fleet_vehicles" ADD CONSTRAINT "corporate_fleet_vehicles_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "corporate_credit_ledgers" ADD CONSTRAINT "corporate_credit_ledgers_corporate_account_id_fkey" FOREIGN KEY ("corporate_account_id") REFERENCES "corporate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corporate_credit_ledgers" ADD CONSTRAINT "corporate_credit_ledgers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "corporate_credit_ledgers" ADD CONSTRAINT "corporate_credit_ledgers_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "corporate_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "corporate_invoices" ADD CONSTRAINT "corporate_invoices_corporate_account_id_fkey" FOREIGN KEY ("corporate_account_id") REFERENCES "corporate_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "corporate_invoice_lines" ADD CONSTRAINT "corporate_invoice_lines_corporate_invoice_id_fkey" FOREIGN KEY ("corporate_invoice_id") REFERENCES "corporate_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corporate_invoice_lines" ADD CONSTRAINT "corporate_invoice_lines_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
