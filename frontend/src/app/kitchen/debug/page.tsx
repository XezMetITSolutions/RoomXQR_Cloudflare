'use client';

import { useState, useEffect } from 'react';

export default function KitchenDebugPage() {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const results: any = {};

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';

            // Get token
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            results.tokenExists = !!token;

            // Get Tenant Slug
            let tenantSlug = 'demo';
            if (typeof window !== 'undefined') {
                const hostname = window.location.hostname;
                const subdomain = hostname.split('.')[0];
                if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
                    tenantSlug = subdomain;
                }
            }
            results.tenantSlug = tenantSlug;

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-tenant': tenantSlug,
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            results.headers = headers;

            // Fetch Menu
            try {
                const menuRes = await fetch(`${API_BASE_URL}/api/menu`, { headers });
                results.menuStatus = menuRes.status;
                if (menuRes.ok) {
                    results.menuData = await menuRes.json();
                } else {
                    results.menuError = await menuRes.text();
                }
            } catch (e: any) {
                results.menuFetchError = e.message;
            }

            // Fetch Orders
            try {
                const ordersRes = await fetch(`${API_BASE_URL}/api/orders`, { headers });
                results.ordersStatus = ordersRes.status;
                if (ordersRes.ok) {
                    results.ordersData = await ordersRes.json();
                } else {
                    results.ordersError = await ordersRes.text();
                }
            } catch (e: any) {
                results.ordersFetchError = e.message;
            }

        } catch (e: any) {
            setError(e.message);
        } finally {
            setData(results);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Kitchen Panel Debug</h1>
            <button
                onClick={fetchData}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
            >
                Refresh Data
            </button>

            {loading && <div className="text-gray-500">Loading...</div>}
            {error && <div className="text-red-500 font-bold">Error: {error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border p-4 rounded bg-gray-50">
                    <h2 className="font-bold mb-2">Context Info</h2>
                    <pre className="whitespace-pre-wrap">{JSON.stringify({
                        tokenExists: data.tokenExists,
                        tenantSlug: data.tenantSlug,
                        headers: data.headers
                    }, null, 2)}</pre>
                </div>

                <div className="border p-4 rounded bg-yellow-50">
                    <h2 className="font-bold mb-2">Menu API Response</h2>
                    <div className="mb-2">Status: {data.menuStatus}</div>
                    <pre className="whitespace-pre-wrap max-h-96 overflow-auto">
                        {JSON.stringify(data.menuData || data.menuError || data.menuFetchError, null, 2)}
                    </pre>
                </div>

                <div className="border p-4 rounded bg-green-50">
                    <h2 className="font-bold mb-2">Orders API Response</h2>
                    <div className="mb-2">Status: {data.ordersStatus}</div>
                    <pre className="whitespace-pre-wrap max-h-96 overflow-auto">
                        {JSON.stringify(data.ordersData || data.ordersError || data.ordersFetchError, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
