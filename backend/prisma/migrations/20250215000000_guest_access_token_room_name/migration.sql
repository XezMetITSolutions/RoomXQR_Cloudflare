-- Room: optional display name
ALTER TABLE "public"."rooms" ADD COLUMN IF NOT EXISTS "name" TEXT;

-- Guest: access token for QR/link (invalidated on checkout)
ALTER TABLE "public"."guests" ADD COLUMN IF NOT EXISTS "accessToken" TEXT;
