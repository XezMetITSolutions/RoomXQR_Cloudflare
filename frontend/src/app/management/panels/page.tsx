"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import {
    LayoutDashboard,
    QrCode,
    Menu,
    Megaphone,
    Info,
    Users,
    Bell,
    BarChart3,
    Settings,
    ChefHat,
    Hotel,
    Globe,
    ExternalLink,
    ShieldCheck,
    User as UserIcon
} from 'lucide-react';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    permissions: string[];
}

export default function PanelsPage() {
    const router = useRouter();
    const { token, user: currentUser } = useAuth();
    const { getTranslation } = useLanguageStore();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';

                let tenantSlug = 'demo';
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    const subdomain = hostname.split('.')[0];
                    if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
                        tenantSlug = subdomain;
                    }
                }

                const response = await fetch(`${API_BASE_URL}/api/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-tenant': tenantSlug
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const usersData = Array.isArray(data) ? data : (data.users || []);
                    setUsers(usersData.map((u: any) => ({
                        ...u,
                        permissions: u.permissions?.map((p: any) => p.pageKey || p) || []
                    })));
                }
            } catch (error) {
                console.error('Users fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchUsers();
    }, [token]);

    const panels = [
        { name: getTranslation('page.panels.kitchen_panel'), route: '/kitchen', key: 'kitchen', icon: ChefHat, color: 'bg-orange-600' },
        { name: getTranslation('page.panels.reception_panel'), route: '/reception', key: 'reception', icon: Hotel, color: 'bg-amber-500' },
    ];

    const getFullUrl = (route: string) => {
        if (typeof window === 'undefined') return route;
        return `${window.location.origin}${route}`;
    };

    const getUsersWithAccess = (panelKey: string) => {
        return users.filter(u =>
            u.role === 'ADMIN' ||
            u.role === 'SUPER_ADMIN' ||
            u.permissions.includes(panelKey)
        );
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{getTranslation('page.paneller.title')}</h1>
                <p className="text-gray-600">{getTranslation('page.paneller.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Misafir Karşılama Arayüzü (Özel Kart) */}
                <div
                    onClick={() => window.open('/guest/101', '_blank')}
                    className="hotel-card p-6 border-l-4 border-indigo-600 bg-indigo-50/30 cursor-pointer hover:bg-indigo-50 transition-colors group"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{getTranslation('page.panels.guest_interface')}</h3>
                                <p className="text-sm text-gray-500">{getTranslation('page.panels.guest_interface_desc')}</p>
                                <div className="mt-1 flex items-center space-x-2 text-indigo-600 font-mono text-xs">
                                    <span>{getFullUrl('/guest/101')}</span>
                                    <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                        <div className="flex -space-x-2 overflow-hidden items-center">
                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                🌍 {getTranslation('page.panels.public')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Panel Listesi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {panels.map((panel) => {
                        const Icon = panel.icon;
                        const accessList = getUsersWithAccess(panel.key);

                        return (
                            <div
                                key={panel.key}
                                onClick={() => router.push(panel.route)}
                                className="hotel-card p-5 hover:border-hotel-gold transition-all group cursor-pointer hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${panel.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-5 h-5 ${panel.color.includes('bg-') ? panel.color.replace('bg-', 'text-') : panel.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{panel.name}</h4>
                                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                                                <span className="font-mono">{panel.route}</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                            <ShieldCheck className="w-3 h-3 mr-1" /> {getTranslation('page.panels.access_holders')}
                                        </span>
                                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {isLoading ? '...' : `${accessList.length} ${getTranslation('room_mgmt.people_count')}`}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {isLoading ? (
                                            <div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div>
                                        ) : accessList.length > 0 ? (
                                            accessList.slice(0, 5).map(u => (
                                                <div key={u.id} className="flex items-center space-x-1 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm" title={`${u.firstName} ${u.lastName} (${u.role})`}>
                                                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <UserIcon className="w-2 h-2 text-blue-600" />
                                                    </div>
                                                    <span className="text-[10px] text-gray-600 font-medium">
                                                        {u.firstName} {u.lastName[0]}.
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">{getTranslation('page.panels.only_admins')}</span>
                                        )}
                                        {accessList.length > 5 && (
                                            <span className="text-[10px] text-gray-400 flex items-center">+{accessList.length - 5} {getTranslation('page.panels.more')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
