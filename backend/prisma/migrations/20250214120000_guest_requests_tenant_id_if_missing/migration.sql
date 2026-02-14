-- Ensure guest_requests has tenantId (idempotent: only if column is missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'guest_requests' AND column_name = 'tenantId'
  ) THEN
    ALTER TABLE "public"."guest_requests" ADD COLUMN "tenantId" TEXT;
    UPDATE "public"."guest_requests" gr
    SET "tenantId" = (SELECT t.id FROM "public"."tenants" t LIMIT 1)
    WHERE gr."tenantId" IS NULL;
    ALTER TABLE "public"."guest_requests" ALTER COLUMN "tenantId" SET NOT NULL;
    ALTER TABLE "public"."guest_requests"
      ADD CONSTRAINT "guest_requests_tenantId_fkey"
      FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
