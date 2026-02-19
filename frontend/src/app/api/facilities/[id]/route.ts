import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const tenantSlug = request.headers.get('x-tenant') || 'demo';
        const token = request.headers.get('Authorization') || '';

        const backendResponse = await fetch(`${BACKEND_URL}/api/facilities/${params.id}`, {
            method: 'PUT',
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
        console.error('Error updating facility:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const tenantSlug = request.headers.get('x-tenant') || 'demo';
        const token = request.headers.get('Authorization') || '';

        const backendResponse = await fetch(`${BACKEND_URL}/api/facilities/${params.id}`, {
            method: 'DELETE',
            headers: {
                'x-tenant': tenantSlug,
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        const data = await backendResponse.json();
        return NextResponse.json(data, { status: backendResponse.status });
    } catch (error) {
        console.error('Error deleting facility:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
