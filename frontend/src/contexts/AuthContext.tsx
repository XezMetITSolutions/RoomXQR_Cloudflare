"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  hotel: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (pageName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Sayfa bazlı yetki kontrolü
  const hasPermission = (pageName: string): boolean => {
    return user?.permissions?.includes(pageName) || false;
  };

  // Login fonksiyonu
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // URL'den tenant slug'ını al
      let tenantSlug = ''; // Default slug removed
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
          tenantSlug = subdomain;
        }
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';

      // Timeout ile fetch isteği
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 saniye timeout

      console.log('🔍 Attempting login:', {
        email,
        tenantSlug,
        apiUrl: `${API_BASE_URL}/api/auth/login`
      });

      try {
        // Backend'e login isteği gönder
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant': tenantSlug
          },
          body: JSON.stringify({ email, password }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('📡 Login response status:', response.status, response.statusText);

        if (!response.ok) {
          let errorMessage = 'Geçersiz email veya şifre';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.error('❌ Login error response:', errorData);
          } catch {
            // JSON parse hatası, varsayılan mesajı kullan
            console.error('❌ Login error - could not parse error response');
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ Login response received:', { hasToken: !!data.token, hasUser: !!data.user });

        // Token ve user'ın var olduğunu kontrol et
        if (!data.token || !data.user) {
          console.error('Login response missing token or user:', data);
          throw new Error('Giriş yanıtı eksik veri içeriyor');
        }

        // Token ve kullanıcı bilgilerini kaydet
        const tokenValue = data.token;
        const userValue = data.user;

        // State'i güncelle
        setToken(tokenValue);
        setUser(userValue);

        // LocalStorage'a kaydet
        localStorage.setItem('auth_token', tokenValue);
        localStorage.setItem('user_data', JSON.stringify(userValue));

        console.log('✅ Login successful, token and user saved:', {
          hasToken: !!tokenValue,
          hasUser: !!userValue,
          userEmail: userValue.email
        });

        setIsLoading(false);
        return true;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('❌ Fetch error:', fetchError);

        if (fetchError.name === 'AbortError') {
          throw new Error('Bağlantı zaman aşımına uğradı. Backend yanıt vermiyor. Lütfen tekrar deneyin.');
        }

        if (fetchError.message && fetchError.message.includes('Failed to fetch')) {
          throw new Error('Backend\'e bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        }

        throw fetchError;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw error; // Hata mesajını yukarı fırlat
    }
  };

  // Logout fonksiyonu
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  }, [router]);

  // Sayfa yüklendiğinde token kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user_data');

        if (savedToken && savedUser) {
          // Token'ı doğrula (backend'den mevcut kullanıcı bilgilerini al)
          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
            let tenantSlug = '';
            if (typeof window !== 'undefined') {
              const hostname = window.location.hostname;
              const subdomain = hostname.split('.')[0];
              if (subdomain && subdomain !== 'www' && subdomain !== 'roomxqr' && subdomain !== 'roomxqr-backend') {
                tenantSlug = subdomain;
              }
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${savedToken}`,
                'x-tenant': tenantSlug
              }
            });

            if (response.ok) {
              const userData = await response.json();
              // Backend'den gelen response formatı: { user: {...} }
              const userFromResponse = userData.user || userData;
              setToken(savedToken);
              setUser(userFromResponse || JSON.parse(savedUser));
            } else {
              // Token geçersizse temizle
              logout();
            }
          } catch (error) {
            // Token doğrulama hatası, localStorage'dan yükle
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}