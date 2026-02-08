'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Hotel, QrCode, Settings, CheckCircle, Star, Shield, Globe, 
  Users, TrendingUp, Heart, MessageCircle, BarChart3, 
  ChevronDown, ChevronUp, Megaphone, Utensils, MessageSquare, 
  Map, Clock, DollarSign, Zap, ArrowRight, CheckCircle2, 
  Share2, Instagram, Facebook, AlertCircle, Bell, 
  Phone, Mail, Headphones, Target, Award, Sparkles
} from 'lucide-react';
import { Language, translations } from '@/lib/homeTranslations';
import HeroBlue from '../hero-blue';

export default function HomePage() {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('de');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [accordionOpen, setAccordionOpen] = useState<{ [key: string]: number | null }>({ 'yillik': null, '6aylik': null, 'sube': null });
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const elements = document.querySelectorAll('[data-scroll]');
    elements.forEach((el) => {
      const id = el.id;
      if (id) {
        setTimeout(() => {
          setVisibleElements(prev => new Set(prev).add(id));
        }, 100);
      }
    });
  }, []);

  const t = translations[currentLanguage];

  // Problem/Çözüm odaklı özellikler
  const problemsAndSolutions = [
    {
      problem: 'Resepsiyon Aşırı Yükleniyor',
      solution: 'QR ile Doğrudan Birim Yönlendirme',
      icon: Users,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      desc: 'Misafir talepleri doğrudan ilgili birime gider. Resepsiyon yükü %60 azalır.'
    },
    {
      problem: 'Personel Verimliliği Ölçülemiyor',
      solution: 'Anlık Performans Takibi',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      desc: 'Her talebin hangi birime gittiği, ne kadar sürede çözüldüğü takip edilir.'
    },
    {
      problem: 'Dil Bariyeri',
      solution: '9 Dil Desteği',
      icon: Globe,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      desc: 'Türkçe, İngilizce, Almanca, Fransızca, Rusça, Arapça, Çince, Japonca, İspanyolca.'
    },
    {
      problem: 'Gelir Artışı Zor',
      solution: 'Upsell & Reklam Fırsatları',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      desc: 'Duyuru ve reklam sistemi ile otel içi harcamaları artırın, ek gelir elde edin.'
    }
  ];

  // Ana özellikler
  const features = [
    { 
      icon: QrCode, 
      title: 'Kişiselleştirilmiş QR Kodlar', 
      description: 'Her oda için özel QR kod. Misafirler odalarındaki QR\'ı okutarak kendilerine özel deneyime ulaşır.', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: Utensils, 
      title: 'RestX Entegre Menü & Sipariş', 
      description: 'QR\'dan menüye erişim, sipariş doğrudan mutfağa düşer. Ortalama süre hesaplanır, odaya servis olur.', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      icon: MessageSquare, 
      title: 'Anlık İstek Yönetimi', 
      description: 'Acil istekler, temizlik, teknik servis - tek tıkla ilgili birime aktarılır.', 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      icon: Map, 
      title: 'Dijital Concierge', 
      description: 'Turistler şehir bilgileri, etkinlikler, turlar hakkında bilgi alır, rezervasyon yapabilir.', 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      icon: Megaphone, 
      title: 'Duyuru & Reklam Sistemi', 
      description: 'Otel içi etkinlikler, promosyonlar, turizm reklamları ile ek gelir kapısı.', 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      icon: MessageCircle, 
      title: 'Geri Bildirim & Yorumlar', 
      description: 'Memnuniyetsizlikler anında yakalanır, memnun misafirler sosyal medyaya yönlendirilir.', 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  // Nasıl çalışır adımları
  const howItWorks = [
    {
      step: '1',
      title: 'Paket Seçin',
      description: 'İhtiyacınıza uygun paketi seçin. Mevcut sisteminizi değiştirmeden entegre oluruz.',
      icon: Settings,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      step: '2',
      title: 'QR Kodlarınızı Alın',
      description: 'Her oda için özel QR kodlarınızı oluşturun. Basılı materyaller hazırlanır.',
      icon: QrCode,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      step: '3',
      title: 'Hizmete Başlayın',
      description: 'Misafirler QR\'ı okutur, tüm hizmetlere erişir. Sistem otomatik çalışır.',
      icon: Zap,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  // Faydalar
  const benefits = [
    {
      icon: DollarSign,
      title: 'Gelir Artışı',
      value: '%40',
      description: 'Upsell fırsatları, reklam gelirleri ve otel içi harcama artışı ile gelirleriniz yükselir.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: Users,
      title: 'Personel Verimliliği',
      value: '%60',
      description: 'Resepsiyon yükü azalır, talepler doğrudan ilgili birime gider. Performans ölçülebilir.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Heart,
      title: 'Müşteri Memnuniyeti',
      value: '7/24',
      description: 'Kendi dilinde, anında hizmet alan misafirler daha mutlu. Geri bildirimler anında toplanır.',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50'
    }
  ];

  // Paketler
  const packages = [
    {
      id: '6aylik',
      name: '6 Aylık Paket',
      price: 'Fiyat Sorunuz',
      description: 'En popüler seçenek! Orta vadeli taahhüt ile ideal fiyat/performans.',
      features: [
        { name: 'Sınırsız QR Kod Üretimi', desc: 'Her oda için özel QR menü sistemi. Sınırsız kod oluşturun.' },
        { name: '9 Dil Desteği', desc: 'Türkçe, İngilizce, Almanca, Fransızca, Rusça, Arapça, Çince, Japonca, İspanyolca.' },
        { name: 'RestX Entegre Menü', desc: 'Oda servisi siparişleri doğrudan mutfağa düşer.' },
        { name: 'Mutfak & Resepsiyon Paneli', desc: 'Siparişleri takip edin, misafir taleplerini yönetin.' },
        { name: 'Duyuru & Reklam Sistemi', desc: 'Otel içi etkinlikler ve turizm reklamları ile ek gelir.' },
        { name: 'Dijital Concierge', desc: 'Turist bilgileri, etkinlikler, turlar için mesajlaşma.' },
        { name: 'Geri Bildirim Sistemi', desc: 'Anlık yorum toplama ve sosyal medya yönlendirme.' },
        { name: 'Detaylı Analitik', desc: 'Satış raporları, performans metrikleri, trend analizi.' },
        { name: '7/24 Müşteri Desteği', desc: 'Canlı destek, WhatsApp ve telefon desteği.' }
      ],
      tag: 'En Popüler',
      color: 'border-amber-300 bg-amber-50',
      popular: false
    },
    {
      id: 'yillik',
      name: '1 Yıllık Paket',
      price: 'Fiyat Sorunuz',
      description: 'Uzun vadeli taahhüt ile maksimum tasarruf! En avantajlı seçenek.',
      features: [
        { name: 'Sınırsız QR Kod Üretimi', desc: 'Her oda için özel QR menü sistemi. Sınırsız kod oluşturun.' },
        { name: '9 Dil Desteği', desc: 'Türkçe, İngilizce, Almanca, Fransızca, Rusça, Arapça, Çince, Japonca, İspanyolca.' },
        { name: 'RestX Entegre Menü', desc: 'Oda servisi siparişleri doğrudan mutfağa düşer.' },
        { name: 'Mutfak & Resepsiyon Paneli', desc: 'Siparişleri takip edin, misafir taleplerini yönetin.' },
        { name: 'Duyuru & Reklam Sistemi', desc: 'Otel içi etkinlikler ve turizm reklamları ile ek gelir.' },
        { name: 'Dijital Concierge', desc: 'Turist bilgileri, etkinlikler, turlar için mesajlaşma.' },
        { name: 'Geri Bildirim Sistemi', desc: 'Anlık yorum toplama ve sosyal medya yönlendirme.' },
        { name: 'Detaylı Analitik', desc: 'Satış raporları, performans metrikleri, trend analizi.' },
        { name: '7/24 Müşteri Desteği', desc: 'Canlı destek, WhatsApp ve telefon desteği.' },
        { name: 'Öncelikli Destek', desc: 'Yıllık paketler için öncelikli teknik destek.' }
      ],
      tag: 'En Avantajlı',
      color: 'border-blue-300 bg-blue-50',
      popular: true
    },
    {
      id: 'sube',
      name: 'Çoklu Şube Paketi',
      price: 'Fiyat Sorunuz',
      description: 'Otel zincirleri için özel! Merkezi yönetim ve kurumsal entegrasyon.',
      features: [
        { name: 'Merkezi Şube Yönetimi', desc: 'Tüm şubelerinizi tek panelden yönetin ve kontrol edin.' },
        { name: 'Şubeler Arası Analiz', desc: 'Tüm şubelerin performansını karşılaştırın ve analiz edin.' },
        { name: 'Kurumsal API Entegrasyonu', desc: 'Mevcut sistemlerinizle (PMS, Muhasebe, CRM) entegrasyon.' },
        { name: 'Sınırsız QR Kod Üretimi', desc: 'Her oda için özel QR menü sistemi. Sınırsız kod oluşturun.' },
        { name: '9 Dil Desteği', desc: 'Türkçe, İngilizce, Almanca, Fransızca, Rusça, Arapça, Çince, Japonca, İspanyolca.' },
        { name: 'Özel Markalama', desc: 'Her şube için özel logo ve tema özelleştirmesi.' },
        { name: 'Dedicated Müşteri Temsilcisi', desc: 'Size özel müşteri temsilcisi ve öncelikli destek.' },
        { name: 'Özel Eğitim Programı', desc: 'Personeliniz için özel eğitim ve onboarding süreci.' }
      ],
      tag: 'Kurumsal',
      color: 'border-purple-300 bg-purple-50',
      popular: false
    }
  ];

  // FAQ
  const faqs = [
    {
      question: 'Mevcut sistemlerimizi değiştirmemiz gerekir mi?',
      answer: 'Hayır! RoomXQR mevcut sistemlerinize entegre olur. Hiçbir sisteminizi değiştirmenize gerek yok. Sadece QR kodları ekleyin, sistem otomatik çalışır.'
    },
    {
      question: 'QR kodlar nasıl çalışır?',
      answer: 'Her oda için özel QR kod oluşturulur. Misafirler telefonlarıyla QR\'ı okutur, kendilerine özel otel sayfasına ulaşır. Menü, hizmet talepleri, concierge - her şey tek yerden erişilebilir.'
    },
    {
      question: 'Dil desteği nasıl çalışır?',
      answer: 'Sistem 9 dilde otomatik çeviri yapar. Misafir kendi dilini seçer, tüm içerik anında çevrilir. Türkçe, İngilizce, Almanca, Fransızca, Rusça, Arapça, Çince, Japonca, İspanyolca desteklenir.'
    },
    {
      question: 'Siparişler nasıl mutfağa ulaşır?',
      answer: 'Misafir QR\'dan menüye erişir, sipariş verir. Sipariş otomatik olarak mutfak paneline düşer. Ortalama hazırlama süresi hesaplanır, odaya servis yapılır. RestXQR sistemi ile tam entegre çalışır.'
    },
    {
      question: 'Gelir artışı nasıl sağlanır?',
      answer: 'Duyuru ve reklam sistemi ile otel içi hizmetleri (spa, restoran, etkinlikler) promosyon edebilirsiniz. Turizm reklamları ile ek gelir elde edebilirsiniz. Upsell fırsatları otomatik sunulur.'
    },
    {
      question: 'Personel verimliliği nasıl ölçülür?',
      answer: 'Her talep hangi birime gittiği, ne kadar sürede çözüldüğü takip edilir. Resepsiyon yükü azalır çünkü talepler doğrudan ilgili birime gider. Detaylı performans raporları ile personel verimliliği ölçülebilir.'
    },
    {
      question: 'Geri bildirimler nasıl toplanır?',
      answer: 'Misafirler QR üzerinden kolayca yorum yapabilir, memnuniyetsizliklerini bildirebilir. Memnun misafirler sosyal medya hesaplarınıza (Instagram, Facebook, Google) yönlendirilir. Organik yorum ve trafik çekersiniz.'
    }
  ];

  const stats = [
    { number: '15+', label: 'Mutlu Otel' },
    { number: '1.5K+', label: 'Günlük Sipariş' },
    { number: '99.9%', label: 'Kesintisiz Hizmet' },
    { number: '24/7', label: 'Destek' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div id="hero">
        <HeroBlue lang="de" />
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="text-3xl md:text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-800 to-slate-900 bg-clip-text text-transparent mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-xs md:text-base text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Problem/Çözüm Section */}
      <div className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-700 text-xs md:text-sm font-medium mb-4 md:mb-6">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Sorunlar & Çözümler
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-3 md:mb-6">
              Otelinizin Karşılaştığı Sorunlar
            </h2>
            <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto">
              RoomXQR ile bu sorunların hepsini çözün
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {problemsAndSolutions.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="group p-6 md:p-8 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-2">
                          ❌ {item.problem}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                        ✅ {item.solution}
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 md:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-20">
            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs md:text-sm font-medium mb-4 md:mb-6">
              <Zap className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Güçlü Özellikler
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-3 md:mb-6">
              {t.features.title}
            </h2>
            <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.features.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 md:p-8 text-center rounded-2xl bg-white border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 md:w-10 md:h-10 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-20">
            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs md:text-sm font-medium mb-4 md:mb-6">
              <Settings className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Basit Süreç
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 md:mb-6 tracking-tight">
              {t.howItWorks.title}
            </h2>
            <p className="text-base md:text-xl text-slate-600">
              {t.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
            {howItWorks.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className="text-center group"
                >
                  <div className={`w-24 h-24 md:w-32 md:h-32 ${step.bgColor} ${step.borderColor} border-2 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <div className={`w-16 h-16 md:w-20 md:h-20 text-white rounded-xl flex items-center justify-center text-3xl md:text-4xl font-black bg-gradient-to-br ${step.color} shadow-xl`}>
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-12 md:py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6">
              <Award className="w-4 h-4 mr-2" />
              Somut Faydalar
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              {t.benefits.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-white mb-4">
                    {benefit.value}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Social Media Integration Section */}
      <div className="py-12 md:py-24 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-20">
            <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-700 text-xs md:text-sm font-medium mb-4 md:mb-6">
              <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Sosyal Medya Entegrasyonu
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-slate-900 mb-3 md:mb-6 tracking-tight">
              {t.social.title}
            </h2>
            <p className="text-sm md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {t.social.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {t.social.step1.title}
                  </h3>
                  <p className="text-base text-slate-600">
                    {t.social.step1.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {t.social.step2.title}
                  </h3>
                  <p className="text-base text-slate-600">
                    {t.social.step2.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {t.social.step3.title}
                  </h3>
                  <p className="text-base text-slate-600">
                    {t.social.step3.desc}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="relative bg-white rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-base text-slate-900">
                        {t.social.survey}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4">
                      {t.social.question}
                    </p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-base text-slate-900">
                        {t.social.socialTitle}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4">
                      {t.social.socialDesc}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <div className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                        Instagram
                      </div>
                      <div className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Facebook
                      </div>
                      <div className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                        Google
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="py-12 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_70%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 md:mb-16">
          <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs md:text-sm font-medium mb-4 md:mb-6">
            <Star className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Fiyatlandırma
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3 md:mb-6 tracking-tight">
            Paketlerimiz
          </h2>
          <p className="text-base md:text-xl text-slate-300">
            İhtiyacınıza uygun paketi seçin, 14 gün ücretsiz deneyin
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative p-6 md:p-10 rounded-2xl md:rounded-3xl bg-white/5 border border-white/20 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-200 ${
                pkg.popular ? 'ring-2 ring-amber-400 scale-105' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="px-8 py-3 rounded-full text-sm font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg">
                    ⭐ En Popüler
                  </div>
                </div>
              )}
              <div className="text-center mb-6 md:mb-10">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  {pkg.id === 'yillik' ? (
                    <div className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-blue-500/20 text-blue-300 text-xs md:text-sm font-semibold">
                      {pkg.tag}
                    </div>
                  ) : pkg.id === '6aylik' ? (
                    <div className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-amber-500/20 text-amber-300 text-xs md:text-sm font-semibold">
                      {pkg.tag}
                    </div>
                  ) : (
                    <div className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-purple-500/20 text-purple-300 text-xs md:text-sm font-semibold">
                      {pkg.tag}
                    </div>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-3">
                  {pkg.name}
                </h3>
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  {pkg.description}
                </p>
                <div className="relative mb-6 md:mb-10">
                  <div className="absolute -inset-2 md:-inset-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent blur-lg"></div>
                  <div className="relative bg-gradient-to-r from-slate-800/80 to-slate-900/80 p-4 md:p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-2">
                      <span className="text-2xl md:text-4xl font-black bg-gradient-to-br from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                        {pkg.price}
                      </span>
                    </div>
                    <div className="mt-3 text-center text-xs text-slate-400">
                      {pkg.id === 'yillik'
                        ? '1 yıllık peşin ödeme'
                        : pkg.id === '6aylik'
                        ? '6 aylık peşin ödeme'
                        : 'Çoklu şube özel fiyat'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-10">
                {pkg.features.map((feature, index) => (
                  <div key={feature.name}>
                    <button
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-left text-slate-200 font-semibold hover:bg-white/10 transition-all duration-150 group"
                      onClick={() =>
                        setAccordionOpen((open) => ({
                          ...open,
                          [pkg.id]: open[pkg.id] === index ? null : index,
                        }))
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span>{feature.name}</span>
                      </div>
                      {accordionOpen[pkg.id] === index ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 transition-transform duration-100" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-100" />
                      )}
                    </button>
                    {accordionOpen[pkg.id] === index && (
                      <div className="px-4 py-3 text-sm text-slate-300 bg-slate-800/80 rounded-b-lg border-t border-slate-600">
                        {feature.desc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/isletme')}
                className={`w-full py-4 md:py-5 rounded-xl font-bold text-base md:text-lg transition-all hover:scale-[1.02] ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600 shadow-xl shadow-amber-500/25'
                    : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700 border border-slate-600'
                }`}
              >
                {pkg.popular ? '🚀 Hemen Başla' : 'Paketi Seç'}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-slate-300">
            <Shield className="w-6 h-6 mr-3 text-amber-400" />
            <span className="font-semibold">
              14 gün ücretsiz deneme • İlk ay iptal hakkı (sadece kurulum ücreti ödenir) • İhtiyacınız kadar oda, o kadar QR kod
            </span>
          </div>
        </div>

        {/* Ödeme Bilgileri */}
        <div className="mt-16 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-blue-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-70"></div>
          <div className="relative p-10 rounded-3xl bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 mr-4">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent">
                Ödeme Bilgileri
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mr-4">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">Kurulum Ücreti</h4>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-300 mb-2">
                    Tek Seferlik Ödeme
                  </div>
                  <p className="text-slate-300 text-sm">Fiyat için iletişime geçiniz</p>
                  <p className="text-slate-400 text-xs mt-2">
                    Sistem kurulumu, QR kodların hazırlanması dahil
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mr-4">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">Eğitim Ücreti</h4>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-green-300 mb-2">
                    Tek Seferlik Ödeme
                  </div>
                  <p className="text-slate-300 text-sm">Fiyat için iletişime geçiniz</p>
                  <p className="text-slate-400 text-xs mt-2">
                    Tüm personel için kapsamlı eğitim
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mr-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">Minimum Ücret</h4>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-purple-300 mb-2">
                    İletişime Geçiniz
                  </div>
                  <p className="text-slate-300 text-sm">Aylık minimum ödeme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4 tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-base md:text-xl text-gray-600">
              Merak ettiğiniz her şey burada
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/80 backdrop-blur-md border border-white shadow-md"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-3 md:pr-4">
                    {faq.question}
                  </h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="mt-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 md:py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05),transparent_70%)]"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs md:text-sm font-medium mb-6 md:mb-8">
            <Zap className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Hemen Başlayın
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-white mb-3 md:mb-6 tracking-tight">
            Otelinizi Dijitalleştirin
          </h2>
          <p className="text-lg md:text-2xl text-slate-300 mb-8 md:mb-12 leading-relaxed">
            Sadece birkaç dakikada modern otel yönetimine geçin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <button
              onClick={() => router.push('/isletme')}
              className="px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl text-base md:text-xl font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-2xl shadow-amber-500/25 hover:from-amber-500 hover:to-yellow-600 transition-all duration-200 hover:scale-105 hover:shadow-3xl"
            >
              🚀 Ücretsiz Denemeye Başla
            </button>
            <button
              onClick={() => router.push('/guest/demo')}
              className="px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl text-base md:text-xl font-bold text-white border-2 border-white/30 hover:bg-white hover:text-slate-900 transition-all duration-200 backdrop-blur-sm hover:scale-105"
            >
              👀 Canlı QR Demo
            </button>
            <button
              onClick={() => router.push('/paneller')}
              className="px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl text-base md:text-xl font-bold text-white border-2 border-white/30 hover:bg-white hover:text-slate-900 transition-all duration-200 backdrop-blur-sm hover:scale-105"
            >
              🧭 Panelleri Görüntüle
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.03),transparent_60%)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <QrCode className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    RoomXQR
                  </span>
                  <span className="text-xs text-slate-400 font-medium">QR Solutions</span>
                </div>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Otel yönetimini dijitalleştiren, misafir deneyimini dönüştüren kapsamlı çözüm.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-amber-400">Ürün</h3>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Özellikler
                  </a>
                </li>
                <li>
                  <a href="#packages" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Paketler
                  </a>
                </li>
                <li>
                  <a href="/paneller" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Demo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-amber-400">Destek</h3>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Yardım Merkezi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Dokümantasyon
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    İletişim
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Durum
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-amber-400">Şirket</h3>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Hakkımızda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Kariyer
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-amber-400 transition-colors flex items-center group">
                    <span className="w-1 h-1 bg-amber-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Basın
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">© 2024 RoomXQR. Tüm hakları saklıdır.</p>
              <div className="flex space-x-8 mt-4 md:mt-0">
                <a href="#" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Gizlilik Politikası
                </a>
                <a href="#" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Kullanım Şartları
                </a>
                <a href="#" className="text-slate-400 hover:text-amber-400 text-sm transition-colors">
                  Çerez Politikası
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
