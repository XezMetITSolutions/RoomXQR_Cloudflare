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

export async function POST(request: Request) {
  try {
    const tenantSlug = getTenantSlug(request);
    const body = await request.json().catch(() => ({}));
    const { roomId, guestName } = body;
    if (!roomId || !guestName) {
      return NextResponse.json({ message: 'roomId ve guestName gerekli.' }, { status: 400 });
    }
    const res = await fetch(`${BACKEND_URL}/api/guest-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant': tenantSlug },
      body: JSON.stringify({ roomId: String(roomId).trim(), guestName: String(guestName).trim() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data || { message: 'Token oluşturulamadı.' }, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Sunucu hatası.' }, { status: 500 });
  }
}
