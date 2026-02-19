import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const tenantSlug = request.headers.get('x-tenant') || 'demo';

        const backendResponse = await fetch(`${BACKEND_URL}/api/facilities`, {
            headers: {
                'x-tenant': tenantSlug,
                'Content-Type': 'application/json'
            }
        });

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: 'Backend error' },
                { status: backendResponse.status }
            );
        }

        const data = await backendResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching facilities:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const tenantSlug = request.headers.get('x-tenant') || 'demo';
        const token = request.headers.get('Authorization') || '';

        const backendResponse = await fetch(`${BACKEND_URL}/api/facilities`, {
            method: 'POST',
            headers: {
                'x-tenant': tenantSlug,
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(body)
        });

        const data = await backendResponse.json();
        return NextResponse.json(data, { status: backendResponse.status });
    } catch (error) {
        console.error('Error creating facility:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
