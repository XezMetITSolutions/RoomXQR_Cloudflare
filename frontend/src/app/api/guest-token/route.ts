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
    const { roomId, guestName, checkIn, checkOut } = body;

    if (!roomId || !guestName) {
      return NextResponse.json({ message: 'roomId ve guestName gerekli.' }, { status: 400 });
    }

    // Split name
    const nameParts = String(guestName).trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Format roomId (ensure it starts with room-)
    const formattedRoomId = String(roomId).startsWith('room-') ? roomId : `room-${roomId}`;

    // Call checkin endpoint
    const res = await fetch(`${BACKEND_URL}/api/guests/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant': tenantSlug },
      body: JSON.stringify({
        roomId: formattedRoomId,
        firstName,
        lastName,
        checkIn, // checkin endpoint might ignore this if it handles dates differently, but sending it anyway
        language: 'tr' // Default
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // If room not found with room- prefix, try without
      if (res.status === 404 && formattedRoomId !== roomId) {
        const retryRes = await fetch(`${BACKEND_URL}/api/guests/checkin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-tenant': tenantSlug },
          body: JSON.stringify({
            roomId: roomId,
            firstName,
            lastName,
            language: 'tr'
          }),
        });
        const retryData = await retryRes.json().catch(() => ({}));
        if (retryRes.ok) {
          // Checkin successful, return token structure if needed or just success
          return NextResponse.json({
            token: retryData.token || 'mock-token',
            guest: retryData.guest
          });
        }
      }

      return NextResponse.json(data || { message: 'Check-in yapılamadı.' }, { status: res.status });
    }

    return NextResponse.json({
      token: data.token || 'mock-token',
      guest: data.guest
    });
  } catch (error) {
    console.error('Guest token error:', error);
    return NextResponse.json({ message: 'Sunucu hatası.' }, { status: 500 });
  }
}
