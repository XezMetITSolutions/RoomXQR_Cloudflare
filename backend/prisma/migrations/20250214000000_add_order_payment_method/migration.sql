-- AlterTable: Add paymentMethod to orders (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'paymentMethod'
  ) THEN
    ALTER TABLE "orders" ADD COLUMN "paymentMethod" TEXT;
  END IF;
END $$;
