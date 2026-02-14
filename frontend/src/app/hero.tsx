"use client";

import { QrCode, Shield, Star, Smartphone, Globe, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50 to-sky-100 py-28 px-4 sm:px-8 overflow-hidden text-center">
      {/* Soft glow efekt */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[820px] h-[520px] rounded-full bg-amber-300/10 blur-3xl pointer-events-none z-0"></div>
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        {/* Badge ve küçük QR icon */}
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 border border-yellow-500 text-yellow-700 font-bold text-base shadow mb-7">
          <QrCode className="w-5 h-5" /> Oda QR Teknolojisi
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-7 leading-tight">
          <span className="text-blue-800">Otelinizi </span>
          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">QR Kodla</span> <br />
          <span className="text-yellow-500 drop-shadow font-extrabold">Dijitalleştir</span>
        </h1>
        <p className="text-lg text-sky-900 mb-10 max-w-xl mx-auto leading-relaxed font-medium">
          Misafirleriniz telefonlarıyla odalardaki QR kodu okutsun, menüye ve tüm hizmetlere anında ulaşsın. Hem personel yükü azalsın, hem <span className="text-yellow-500 font-bold">%40 gelir artışı</span> yaşayın.
        </p>

        {/* Avantaj badge'leri daha belirgin ve dolu */}
        <div className="flex flex-wrap justify-center gap-5 mb-12 w-full">
          <span className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl shadow font-semibold text-base">
            <Globe className="w-5 h-5" /> 9 Dil Desteği
          </span>
          <span className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl shadow font-semibold text-base">
            <Star className="w-5 h-5" /> %100 Misafir Memnuniyeti
          </span>
          <span className="flex items-center gap-2 bg-yellow-400 text-blue-900 px-5 py-2 rounded-xl shadow font-semibold text-base">
            <Zap className="w-5 h-5" /> Anında Menü
          </span>
        </div>

        {/* Büyük CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2 w-full">
          <button
            onClick={() => router.push("/guest/101")}
            className="px-12 py-5 rounded-2xl text-xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg text-blue-900 hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 transition-all border-2 border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          >
            Canlı QR Demo
          </button>
          <button
            onClick={() => router.push("/management")}
            className="px-12 py-5 rounded-2xl text-xl font-extrabold bg-blue-700 text-white shadow-lg hover:bg-blue-800 border-2 border-blue-800 hover:scale-105 flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-700/30"
          >
            <Shield className="w-6 h-6" /> İşletme Paneli
          </button>
        </div>
      </div>
    </div>
  );
}