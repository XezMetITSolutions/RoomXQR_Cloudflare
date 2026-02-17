'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import { ApiService } from '@/services/api';
import { ArrowLeft, Bell } from 'lucide-react';

export default function ManagementRequestsPage() {
  const { token, user } = useAuth();
  const { getTranslation } = useLanguageStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token || !user) return;
      try {
        setIsLoading(true);
        const data = await ApiService.getGuestRequests(token);
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token, user]);

  const getPriorityColor = (priority: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'urgent' || p === 'high') return 'bg-red-100 text-red-800';
    if (p === 'medium') return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'in_progress') return 'bg-blue-100 text-blue-800';
    if (s === 'pending') return 'bg-amber-100 text-amber-800';
    if (s === 'cancelled') return 'bg-gray-100 text-gray-600';
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
            <Bell className="w-7 h-7 text-hotel-gold" />
            {getTranslation('dashboard.view_all_requests')}
          </h1>
        </div>
      </div>

      <div className="hotel-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{getTranslation('dashboard.no_requests')}</div>
        ) : (
          <div className="divide-y divide-gray-200 overflow-x-auto">
            {requests.map((req: any) => {
              const room = req.room?.number || (req.roomId || '').replace(/^room-/, '') || '—';
              const time = req.createdAt ? new Date(req.createdAt).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
              return (
                <div key={req.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900">{getTranslation('dashboard.room')} {room}</span>
                    <p className="text-sm text-gray-600 mt-1">{req.type || req.description || '—'}</p>
                    <p className="text-xs text-gray-500 mt-1">{time}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(req.priority)}`}>
                      {req.priority || 'Medium'}
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                      {req.status || 'Pending'}
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
