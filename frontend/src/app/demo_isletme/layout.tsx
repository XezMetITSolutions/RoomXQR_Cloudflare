"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
// Demo için özel auth - demo token kullan
import { 
  LayoutDashboard, 
  Menu, 
  Megaphone, 
  Users, 
  Settings, 
  BarChart3, 
  Bell,
  LogOut,
  Hotel,
  ChevronLeft,
  ChevronRight,
  QrCode,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/demo_isletme', icon: LayoutDashboard, key: 'dashboard', color: 'text-blue-600' },
  { name: 'QR Kod Oluşturucu', href: '/demo_isletme/qr-kod', icon: QrCode, key: 'qr-kod', color: 'text-emerald-600' },
  { name: 'Menü Yönetimi', href: '/demo_isletme/menu', icon: Menu, key: 'menu', color: 'text-purple-600' },
  { name: 'Duyurular', href: '/demo_isletme/announcements', icon: Megaphone, key: 'announcements', color: 'text-orange-600' },
  { name: 'Kullanıcılar', href: '/demo_isletme/users', icon: Users, key: 'users', color: 'text-green-600' },
  { name: 'Bildirimler', href: '/demo_isletme/notifications', icon: Bell, key: 'notifications', color: 'text-pink-600' },
  { name: 'Analitik', href: '/demo_isletme/analytics', icon: BarChart3, key: 'analytics', color: 'text-indigo-600' },
  { name: 'Ayarlar', href: '/demo_isletme/settings', icon: Settings, key: 'settings', color: 'text-gray-600' },
];

export default function DemoAdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Demo kullanıcı bilgilerini yükle
  useEffect(() => {
    const demoUserData = localStorage.getItem('demo_user_data');
    const demoToken = localStorage.getItem('demo_auth_token');
    
    if (demoUserData && demoToken) {
      try {
        setUser(JSON.parse(demoUserData));
      } catch (error) {
        console.error('Demo user data parse error:', error);
      }
    }
    
    setIsLoading(false);
  }, []);

  // Auth kontrolü
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/demo_login');
    }
  }, [user, isLoading, router]);

  // Loading durumu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotel-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı yoksa hiçbir şey gösterme
  if (!user) {
    return null;
  }

  // Demo için tüm menü öğelerini göster
  const filteredNavigation = navigation;

  const handleLogout = () => {
    localStorage.removeItem('demo_auth_token');
    localStorage.removeItem('demo_user_data');
    router.push('/demo_login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
            {/* Mobile Header */}
            <div className="flex-shrink-0 flex items-center px-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Hotel className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">İşletme Paneli</h1>
                  <p className="text-sm text-gray-500">Yönetim Sistemi</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="px-3 space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isItemActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                      isItemActive
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 shadow-sm border border-yellow-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isItemActive 
                        ? 'bg-yellow-500 shadow-sm' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isItemActive ? 'text-white' : `${item.color} group-hover:scale-110`
                      }`} />
                    </div>
                    <span className="ml-4 truncate">{item.name}</span>
                    {isItemActive && (
                      <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Mobile Footer */}
          <div className="flex-shrink-0 border-t border-gray-100 p-4">
            <button
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              className="w-full group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 hover:bg-red-50 hover:text-red-700"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-red-100 transition-all duration-200">
                <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-500" />
              </div>
              <span className="ml-4 truncate">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar - Fixed position */}
      <div className={`hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:left-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col w-full h-full bg-white border-r border-gray-200 shadow-lg">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Hotel className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">İşletme Paneli</h1>
                    <p className="text-xs text-gray-500">Yönetim Sistemi</p>
                  </div>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="w-full flex justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Hotel className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
              <nav className="flex-1 px-3 space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                  const isItemActive = pathname === item.href;
                return (
                    <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                        className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isItemActive
                            ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-900 shadow-sm border border-yellow-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isItemActive 
                            ? 'bg-yellow-500 shadow-sm' 
                            : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            isItemActive ? 'text-white' : `${item.color} group-hover:scale-110`
                          }`} />
                        </div>
                        {!sidebarCollapsed && (
                          <span className="ml-3 truncate">{item.name}</span>
                        )}
                        {isItemActive && !sidebarCollapsed && (
                          <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                      </Link>
                      
                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      )}
                    </div>
                );
              })}
            </nav>
          </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 p-3">
              <div className="relative group">
            <button
              onClick={handleLogout}
                  className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-red-50 hover:text-red-700 ${
                    sidebarCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-red-100 transition-all duration-200">
                    <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-500" />
                  </div>
                  {!sidebarCollapsed && (
                    <span className="ml-3 truncate">Çıkış Yap</span>
                  )}
                </button>
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Çıkış Yap
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Mobile top bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
          <button
            type="button"
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-sm">
                <Hotel className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">İşletme Paneli</span>
            </div>
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:block sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button
                type="button"
                onClick={() => router.push('/management/notifications')}
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile */}
              <div className="flex items-center gap-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <span className="hidden lg:block text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
