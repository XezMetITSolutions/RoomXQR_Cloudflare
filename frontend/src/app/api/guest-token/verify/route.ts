import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';

function getTenantSlug(request: Request): string {
  const url = new URL(request.url);
  let tenant = url.searchParams.get('tenant') || request.headers.get('x-tenant') || '';
  if (!tenant) {
    const host = request.headers.get('host') || '';
    const sub = host.split('.')[0];
    if (sub && sub !== 'www' && sub !== 'roomxqr' && sub !== 'roomxqr-backend' && sub !== 'localhost') tenant = sub;
    else tenant = 'demo';
  }
  return tenant;
}

export async function GET(request: Request) {
  try {
    const tenantSlug = getTenantSlug(request);
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const roomId = url.searchParams.get('roomId') || '';
    if (!token || !roomId) {
      return NextResponse.json({});
    }
    const res = await fetch(
      `${BACKEND_URL}/api/guest-token/verify?token=${encodeURIComponent(token)}&roomId=${encodeURIComponent(roomId)}`,
      { headers: { 'x-tenant': tenantSlug } }
    );
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data && typeof data.guestName === 'string' ? { guestName: data.guestName } : {});
  } catch {
    return NextResponse.json({});
  }
}
