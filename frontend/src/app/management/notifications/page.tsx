"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageStore } from '@/store/languageStore';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function NotificationsPage() {
  const { token, user } = useAuth();
  const { currentLanguage, getTranslation } = useLanguageStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Browser tab title'ını ayarla
  useEffect(() => {
    const title = getTranslation('page.notifications.title');
    document.title = `${title} - RoomXQR`;
  }, [currentLanguage, getTranslation]);

  // Bildirimleri API'den yükle
  useEffect(() => {
    const loadNotifications = async () => {
      if (!token || !user) return;
      
      try {
        setIsLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';
        
        // URL'den tenant slug'ını al
        let tenantSlug = 'demo';
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const subdomain = hostname.split('.')[0];
          if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
            tenantSlug = subdomain;
          }
        }

        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-tenant': tenantSlug
          }
        });

        if (response.ok) {
          const data = await response.json();
          const notificationsData = Array.isArray(data) ? data : [];
          
          // API'den gelen veriyi formatla
          const formattedNotifications = notificationsData.map((n: any) => ({
            id: n.id,
            type: n.type || 'info',
            title: n.title || 'Bildirim',
            message: n.message || n.content || '',
            timestamp: new Date(n.createdAt || n.timestamp),
            read: n.read || false,
            priority: n.priority || 'medium'
          }));
          
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error('Bildirimler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [token, user]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: false } : n
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const refreshNotifications = async () => {
    if (!token || !user) return;
    
    try {
      setIsLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr-backend.onrender.com';
      
      // URL'den tenant slug'ını al
      let tenantSlug = 'demo';
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
          tenantSlug = subdomain;
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant': tenantSlug
        }
      });

      if (response.ok) {
        const data = await response.json();
        const notificationsData = Array.isArray(data) ? data : [];
        
        const formattedNotifications = notificationsData.map((n: any) => ({
          id: n.id,
          type: n.type || 'info',
          title: n.title || 'Bildirim',
          message: n.message || n.content || '',
          timestamp: new Date(n.createdAt || n.timestamp),
          read: n.read || false,
          priority: n.priority || 'medium'
        }));
        
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Bildirimler yenilenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'read' && notification.read) || 
      (filter === 'unread' && !notification.read);
    
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getTranslation('page.notifications.title')}</h1>
            <p className="text-gray-600">{getTranslation('page.notifications.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshNotifications}
              disabled={isLoading}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {getTranslation('notifications.refresh')}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-white bg-hotel-gold rounded-lg hover:bg-hotel-navy"
              >
                {getTranslation('notifications.mark_all_read')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="hotel-card p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Bell className="w-8 h-8 text-hotel-gold" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{getTranslation('notifications.total')}</p>
              <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="hotel-card p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{getTranslation('notifications.unread')}</p>
              <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="hotel-card p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{getTranslation('notifications.read')}</p>
              <p className="text-2xl font-semibold text-gray-900">{notifications.length - unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="hotel-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={getTranslation('notifications.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hotel-gold focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filter === 'all' 
                  ? 'bg-hotel-gold text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getTranslation('common.all')}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filter === 'unread' 
                  ? 'bg-hotel-gold text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getTranslation('notifications.unread')} ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                filter === 'read' 
                  ? 'bg-hotel-gold text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getTranslation('notifications.read')}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="hotel-card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {getTranslation('page.notifications.title')} ({filteredNotifications.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">{getTranslation('notifications.not_found')}</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getTranslation('notifications.new')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="mt-3 flex space-x-2">
                      {notification.read ? (
                        <button
                          onClick={() => markAsUnread(notification.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          {getTranslation('notifications.mark_unread')}
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-hotel-gold hover:text-hotel-navy underline"
                        >
                          {getTranslation('notifications.mark_read')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
