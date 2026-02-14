"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Hotel, Eye, EyeOff, AlertCircle, Globe, ChevronDown } from 'lucide-react';
import { useLanguageStore, languages } from '@/store/languageStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const { login, user } = useAuth();
  const router = useRouter();
  const { currentLanguage, setLanguage, getTranslation, getCurrentLanguage, getSupportedLanguages } = useLanguageStore();

  const [supportedLanguages, setSupportedLanguages] = useState(getSupportedLanguages());

  // Ayarlar güncellendiğinde dilleri yenile
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setSupportedLanguages(getSupportedLanguages());
    };
    window.addEventListener('settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings-updated', handleSettingsUpdate);
  }, [getSupportedLanguages]);

  useEffect(() => {
    // localStorage'da varsa otomatik doldur
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Browser tab title'ını ayarla
  useEffect(() => {
    const title = getTranslation('login.title');
    document.title = `${title} - RoomXQR`;
  }, [currentLanguage, getTranslation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      console.log('🚀 Starting login process...');
      const success = await login(email, password);
      console.log('✅ Login function returned:', success);

      if (success) {
        // State'in güncellenmesi için kısa bir süre bekle
        await new Promise(resolve => setTimeout(resolve, 500));

        // Token'ın localStorage'da olduğunu kontrol et
        const savedToken = localStorage.getItem('auth_token');
        const savedUserData = localStorage.getItem('user_data');

        console.log('🔍 Login check:', {
          hasToken: !!savedToken,
          hasUserData: !!savedUserData,
          tokenLength: savedToken?.length,
          userDataLength: savedUserData?.length
        });

        if (savedToken && savedUserData) {
          try {
            const userData = JSON.parse(savedUserData);
            const userRole = userData.role;
            const userPermissions = userData.permissions || [];

            console.log('✅ Login successful, user data:', {
              role: userRole,
              permissions: userPermissions,
              fullUserData: userData
            });

            // Kullanıcının role'üne veya permissions'ına göre yönlendir
            let redirectPath = '/management'; // Varsayılan

            // Role'e göre yönlendirme (büyük/küçük harf duyarsız)
            const roleUpper = (userRole || '').toUpperCase();

            if (roleUpper === 'RECEPTION' || userPermissions.includes('reception')) {
              redirectPath = '/reception';
              console.log('📍 Redirecting to RECEPTION panel');
            } else if (roleUpper === 'KITCHEN' || userPermissions.includes('kitchen')) {
              redirectPath = '/kitchen';
              console.log('📍 Redirecting to KITCHEN panel');
            } else if (roleUpper === 'STAFF' || roleUpper === 'WAITER' || userPermissions.includes('staff') || userPermissions.includes('waiter')) {
              redirectPath = '/reception';
              console.log('📍 Redirecting STAFF/WAITER to RECEPTION panel');
            } else if (roleUpper === 'ADMIN' || roleUpper === 'MANAGER' || userPermissions.includes('dashboard')) {
              redirectPath = '/management';
              console.log('📍 Redirecting ADMIN/MANAGER to İŞLETME panel');
            } else {
              console.log('⚠️ Unknown role, defaulting to /management:', roleUpper);
              redirectPath = '/management';
            }

            console.log('🔄 Final redirect path:', redirectPath);
            setIsLoading(false); // Yönlendirmeden önce loading'i kapat

            // Yönlendirmeyi yap
            window.location.href = redirectPath; // router.push yerine window.location.href kullan
          } catch (error) {
            console.error('❌ Error parsing user data:', error);
            console.error('Raw user data:', savedUserData);
            setIsLoading(false);
            // Hata durumunda varsayılan yönlendirme
            window.location.href = '/management';
          }
        } else {
          console.error('❌ Login successful but token/user not saved', {
            savedToken: savedToken ? 'exists' : 'missing',
            savedUserData: savedUserData ? 'exists' : 'missing'
          });
          setIsLoading(false);
          setError(getTranslation('login.error_session'));
        }
      } else {
        setIsLoading(false);
        setError(getTranslation('login.error_invalid'));
      }
    } catch (err: any) {
      console.error('Login error in handleSubmit:', err);
      setIsLoading(false);
      setError(err?.message || getTranslation('login.error_general'));
    }
  };

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setShowLanguageSelector(false);
      }
    };

    if (showLanguageSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageSelector]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Dil Seçici - Sağ Üst Köşe */}
      <div className="absolute top-4 right-4 language-selector">
        <div className="relative">
          <button
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {getCurrentLanguage().flag}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {/* Dil Seçenekleri Dropdown */}
          {showLanguageSelector && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguageSelector(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 ${currentLanguage === lang.code
                      ? 'bg-hotel-gold bg-opacity-10'
                      : 'hover:bg-gray-50'
                    }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="font-medium text-gray-900">{lang.name}</div>
                    <div className="text-xs text-gray-500">{lang.nativeName}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Hotel className="h-12 w-12 text-hotel-gold" />
            <span className="text-2xl font-bold text-gray-900">RoomXQR</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {getTranslation('login.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {getTranslation('login.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {getTranslation('login.email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-hotel-gold focus:border-hotel-gold sm:text-sm"
                  placeholder={getTranslation('login.email_placeholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {getTranslation('login.password')}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-hotel-gold focus:border-hotel-gold sm:text-sm"
                  placeholder={getTranslation('login.password_placeholder')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-hotel-gold focus:ring-hotel-gold border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {getTranslation('login.remember')}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-hotel-gold hover:text-hotel-navy">
                  {getTranslation('login.forgot')}
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-hotel-gold hover:bg-hotel-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-gold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {getTranslation('login.submitting')}
                  </div>
                ) : (
                  getTranslation('login.submit')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
