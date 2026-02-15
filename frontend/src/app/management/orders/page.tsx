'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function ManagementOrdersPage() {
  const { token, user } = useAuth();
  const { getTranslation } = useLanguageStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token || !user) return;
      try {
        setIsLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
        const base = /\/api\/?$/.test(API_BASE_URL) ? API_BASE_URL.replace(/\/$/, '') : `${API_BASE_URL.replace(/\/$/, '')}/api`;
        let tenantSlug = 'demo';
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const sub = hostname.split('.')[0];
          if (sub && sub !== 'www' && sub !== 'roomxqr' && sub !== 'roomxqr-backend') tenantSlug = sub;
        }
        const res = await fetch(`${base}/orders?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}`, 'x-tenant': tenantSlug },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : (data.orders || []));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token, user]);

  const getStatusColor = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') return 'bg-green-100 text-green-800';
    if (s === 'READY') return 'bg-blue-100 text-blue-800';
    if (s === 'PREPARING' || s === 'CONFIRMED') return 'bg-amber-100 text-amber-800';
    if (s === 'CANCELLED') return 'bg-gray-100 text-gray-600';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/management" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-hotel-gold" />
            {getTranslation('dashboard.view_all_orders')}
          </h1>
        </div>
      </div>

      <div className="hotel-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{getTranslation('dashboard.no_orders')}</div>
        ) : (
          <div className="divide-y divide-gray-200 overflow-x-auto">
            {orders.map((order: any) => {
              const room = (order.roomId || '').replace(/^room[-\s]?/i, '') || '—';
              const itemsText = order.items?.map((i: any) => `${i.quantity}x ${i.menuItem?.name || i.name || 'Ürün'}`).join(', ') || '—';
              const status = order.status || 'PENDING';
              const amount = `₺${(parseFloat(order.totalAmount) || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              return (
                <div key={order.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900">{getTranslation('analytics.room')} {room}</span>
                    <p className="text-sm text-gray-600 mt-1 truncate">{itemsText}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">{amount}</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
