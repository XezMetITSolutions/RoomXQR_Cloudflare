import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
const API_BASE = /\/api\/?$/.test(BACKEND_URL) ? BACKEND_URL.replace(/\/$/, '') : `${BACKEND_URL.replace(/\/$/, '')}/api`;

function getTenantSlug(request: NextRequest): string {
  const host = request.headers.get('host') || '';
  const sub = host.split('.')[0];
  if (sub && sub !== 'www' && sub !== 'roomxqr' && sub !== 'roomxqr-backend' && sub !== 'localhost') return sub;
  return 'demo';
}

export async function GET(request: NextRequest, { params }: { params: { number: string } }) {
  try {
    const tenantSlug = getTenantSlug(request);
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';
    const url = `${API_BASE}/rooms/${params.number}/active-guest${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const res = await fetch(url, { headers: { 'x-tenant': tenantSlug } });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ guestName: null, hotelName: null });
  }
}
