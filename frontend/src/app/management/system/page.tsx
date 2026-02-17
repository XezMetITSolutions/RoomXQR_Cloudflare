"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Database, RefreshCw, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SystemPage() {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const performMigration = async () => {
        if (!confirm('Are you sure you want to update the database schema? This action cannot be undone.')) return;

        setLoading(true);
        setResult(null);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://roomxqr.onrender.com';
            const base = /\/api\/?$/.test(API_BASE_URL) ? API_BASE_URL.replace(/\/$/, '') : `${API_BASE_URL.replace(/\/$/, '')}/api`;

            const res = await fetch(`${base}/admin/system/migrate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Migration failed');
            }

            setResult(data);
        } catch (err: any) {
            setResult({ success: false, error: err.message, details: err.stack });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="p-8 text-center text-gray-500">Please sign in to access system tools.</div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Sistem Yönetimi</h1>
                <p className="text-gray-500">Veritabanı ve sunucu bakım araçları.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Database className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Veritabanı Şeması Güncelleme</h2>
                            <p className="text-sm text-gray-500">Prisma şemasını veritabanına uygular (`prisma db push`).</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-3">
                        <ShieldAlert className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-yellow-800">Dikkat</h3>
                            <p className="text-xs text-yellow-700 mt-1">
                                Bu işlem veritabanı yapısını günceller. Eğer şema değişiklikleri veri kaybı içeriyorsa (örn. bir sütunu silmek), bu işlem veri kaybına neden olabilir. Lütfen sadece geliştirici onayı ile kullanın.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={performMigration}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Güncelleme Yapılıyor...
                            </>
                        ) : (
                            <>
                                <Database className="w-5 h-5" />
                                Şemayı Güncelle (Migrate)
                            </>
                        )}
                    </button>

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 p-6 rounded-xl border ${result.success
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                {result.success ? (
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="p-2 bg-red-100 rounded-full">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                )}
                                <div>
                                    <h3 className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {result.success ? 'Başarılı' : 'Hata Oluştu'}
                                    </h3>
                                    <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {result.message || (result.success ? 'İşlem tamamlandı' : 'Bilinmeyen bir hata oluştu')}
                                    </p>
                                </div>
                            </div>

                            {(result.output || result.details || result.warnings) && (
                                <div className="space-y-2 mt-4">
                                    {result.output && (
                                        <div className="bg-black/5 p-3 rounded-lg">
                                            <p className="text-xs font-mono font-bold text-gray-500 mb-1">OUTPUT:</p>
                                            <pre className="text-xs font-mono overflow-auto max-h-[200px] whitespace-pre-wrap text-gray-700">
                                                {result.output}
                                            </pre>
                                        </div>
                                    )}
                                    {result.warnings && (
                                        <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-200">
                                            <p className="text-xs font-mono font-bold text-yellow-700 mb-1">WARNINGS:</p>
                                            <pre className="text-xs font-mono overflow-auto max-h-[100px] whitespace-pre-wrap text-yellow-800">
                                                {result.warnings}
                                            </pre>
                                        </div>
                                    )}
                                    {result.details && !result.success && (
                                        <div className="bg-red-500/10 p-3 rounded-lg border border-red-200">
                                            <p className="text-xs font-mono font-bold text-red-700 mb-1">ERROR DETAILS:</p>
                                            <pre className="text-xs font-mono overflow-auto max-h-[100px] whitespace-pre-wrap text-red-800">
                                                {result.details}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
