-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('SHIPPING', 'BILLING', 'BOTH');

-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('INITIATED', 'DETAILS_PROVIDED', 'PHONE_VERIFIED', 'CONFIRMED', 'EXPIRED', 'ABANDONED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_address_id" UUID;

-- AlterTable
ALTER TABLE "otp_challenges" ADD COLUMN     "checkout_session_id" UUID;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "is_test_mode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mock_status" TEXT;

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price_paise" BIGINT NOT NULL DEFAULT 50000,
    "total_amount_paise" BIGINT NOT NULL DEFAULT 50000,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'INITIATED',
    "purpose" "OrderPurpose" NOT NULL DEFAULT 'INITIAL_REGISTRATION',
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "customer_email" TEXT,
    "shipping_address" JSONB,
    "referral_code" TEXT,
    "sponsor_network_id" UUID,
    "intended_parent_id" UUID,
    "intended_slot" INTEGER,
    "phone_verified_at" TIMESTAMPTZ,
    "order_id" UUID,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "type" "AddressType" NOT NULL DEFAULT 'SHIPPING',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_order_id_key" ON "checkout_sessions"("order_id");

-- CreateIndex
CREATE INDEX "checkout_sessions_customer_phone_idx" ON "checkout_sessions"("customer_phone");

-- CreateIndex
CREATE INDEX "checkout_sessions_status_expires_at_idx" ON "checkout_sessions"("status", "expires_at");

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE INDEX "addresses_postal_code_idx" ON "addresses"("postal_code");

-- CreateIndex
CREATE INDEX "orders_shipping_address_id_idx" ON "orders"("shipping_address_id");

-- CreateIndex
CREATE INDEX "otp_challenges_checkout_session_id_idx" ON "otp_challenges"("checkout_session_id");

-- AddForeignKey
ALTER TABLE "otp_challenges" ADD CONSTRAINT "otp_challenges_checkout_session_id_fkey" FOREIGN KEY ("checkout_session_id") REFERENCES "checkout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
