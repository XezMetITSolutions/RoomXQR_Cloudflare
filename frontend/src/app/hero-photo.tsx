"use client";
import { QrCode, Shield, Star, Smartphone, Globe, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
// Otel/vurgulu görsel - örnek için unsplash kullanılıyor.
// Gerçek projede uygun bir jpg/png assets/public a eklenirse import "../public/otel-bg.jpg" olur

export default function HeroPhoto() {
  const router = useRouter();
  return (
    <div
      className="relative min-h-[600px] flex items-center justify-center px-4 sm:px-8 overflow-hidden"
      style={{
        background: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80) center center/cover no-repeat',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute top-0 left-0 w-full h-56 bg-gradient-to-b from-black/80 to-transparent z-2" />

      {/* Asıl içerik */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center py-24 w-full">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/90 text-white font-bold text-base shadow mb-7 border-2 border-yellow-300">
          <QrCode className="w-5 h-5 text-white" /> Modern Otel Deneyimi
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-7 leading-tight drop-shadow-xl">
          <span className="text-white">Otelinizi </span>
          <span className="text-yellow-300">QR Kodla </span>
          <br />Dijitalleştir
        </h1>
        <p className="text-lg text-white mb-10 max-w-xl mx-auto leading-relaxed font-medium drop-shadow-lg">
          Lüks otel teknolojisinde yeni dönem: QR kodla oda servisi ve menü, dakikalar içinde misafirin elinde. Personel yükünü azaltın, <span className="text-yellow-300 font-bold">gelirinizi artırın</span>.
        </p>
        <div className="flex flex-wrap justify-center gap-5 mb-10 w-full">
          <span className="flex items-center gap-2 bg-white/90 text-blue-800 px-5 py-2 rounded-xl shadow font-semibold text-base">
            <Globe className="w-5 h-5" /> Çoklu Dil
          </span>
          <span className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-5 py-2 rounded-xl shadow font-semibold text-base">
            <Star className="w-5 h-5" /> Yüksek Memnuniyet
          </span>
          <span className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl shadow font-semibold text-base">
            <Zap className="w-5 h-5" /> Hızlı Sipariş
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <button
            onClick={() => router.push("/guest/101")}
            className="px-12 py-5 rounded-2xl text-xl font-extrabold bg-yellow-400 shadow-xl text-slate-900 hover:bg-yellow-300 hover:scale-105 transition-all mt-2 border-2 border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          >
            Canlı QR Demo
          </button>
          <button
            onClick={() => router.push("/management")}
            className="px-12 py-5 rounded-2xl text-xl font-extrabold bg-white text-blue-900 shadow-lg border-2 border-white/80 hover:bg-blue-50 hover:scale-105 flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-700/30"
          >
            <Shield className="w-6 h-6" /> İşletme Paneli
          </button>
        </div>
      </div>
    </div>
  );
}
