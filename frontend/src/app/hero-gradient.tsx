"use client";

import { QrCode, Shield, Star, Smartphone, Globe, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroGradient() {
  const router = useRouter();
  return (
    <div className="relative min-h-[680px] bg-gradient-to-br from-indigo-700 via-pink-500 to-yellow-400 py-28 px-4 sm:px-8 overflow-hidden text-center flex items-center justify-center">
      {/* Brush/Glow dekoratif efekti */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-amber-300/70 rounded-full blur-3xl rotate-12 z-0"/>
      <div className="absolute -bottom-24 right-0 w-[300px] h-[180px] bg-blue-500/40 rounded-full blur-2xl rotate-12 z-0"/>
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 font-bold text-pink-600 text-base shadow-lg mb-8 border-2 border-pink-300">
          <QrCode className="w-5 h-5" /> QR ile Geleceğe
        </span>
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight drop-shadow-lg">
          <span className="text-white">Otelinizi</span>{' '}
          <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">QR Kodla</span>
          <br />
          <span className="bg-gradient-to-l from-white via-yellow-200 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">Dijitalleştir</span>
        </h1>
        <p className="text-xl text-white mb-10 max-w-xl mx-auto leading-relaxed font-semibold drop-shadow">
          QR kod teknolojisiyle misafirlerinize hızlı hizmet, size ise %40’a varan gelir artışı ve inovatif otel deneyimi!
        </p>
        {/* Avantaj badge'leri */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 w-full">
          <span className="flex items-center gap-2 bg-white/90 text-indigo-700 px-6 py-2 rounded-full shadow font-bold text-base border-2 border-indigo-300">
            <Globe className="w-5 h-5" /> 9 Dil Desteği
          </span>
          <span className="flex items-center gap-2 bg-white/90 text-pink-600 px-6 py-2 rounded-full shadow font-bold text-base border-2 border-pink-200">
            <Zap className="w-5 h-5" /> Anında Dijital Menü
          </span>
          <span className="flex items-center gap-2 bg-white/90 text-amber-700 px-6 py-2 rounded-full shadow font-bold text-base border-2 border-amber-200">
            <Star className="w-5 h-5" /> Yüksek Memnuniyet
          </span>
        </div>
        {/* Büyük CTA */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-2 w-full">
          <button
            onClick={() => router.push("/guest/101")}
            className="px-14 py-5 rounded-2xl text-2xl font-black text-white bg-gradient-to-r from-pink-500 via-yellow-400 to-orange-400 shadow-xl hover:from-yellow-400 hover:to-pink-500 hover:scale-105 transition-all border-4 border-white focus:outline-none focus:ring-2 focus:ring-pink-400/40"
          >
            🚀 Canlı QR Demo
          </button>
          <button
            onClick={() => router.push("/management")}
            className="px-12 py-5 rounded-2xl text-2xl font-black bg-white text-indigo-800 shadow-lg border-4 border-indigo-300 hover:bg-indigo-100 hover:scale-105 flex items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          >
            <Shield className="w-7 h-7" /> İşletme Paneli
          </button>
        </div>
      </div>
    </div>
  );
}
