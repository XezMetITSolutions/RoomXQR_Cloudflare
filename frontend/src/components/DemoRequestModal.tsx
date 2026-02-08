"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUser, FaEnvelope, FaHotel, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import { useLanguageStore } from '@/store/languageStore';

interface DemoRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DemoRequestModal({ isOpen, onClose }: DemoRequestModalProps) {
    const { getTranslation: t } = useLanguageStore();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
                >
                    {/* Header Image/Pattern */}
                    <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 relative flex items-center justify-center">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all"
                        >
                            <FaTimes />
                        </button>
                        <h2 className="text-3xl font-black text-white tracking-tight">DEMO REQUEST</h2>
                    </div>

                    <div className="p-8 md:p-12">
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4 text-center mb-8">
                                    <p className="text-slate-500 font-medium">
                                        Please fill out the form below and our team will contact you shortly to schedule a live demo.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Full Name</label>
                                        <div className="relative group">
                                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="John Doe"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                                        <div className="relative group">
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                required
                                                type="email"
                                                placeholder="john@example.com"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Hotel / Business Name</label>
                                    <div className="relative group">
                                        <FaHotel className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Royal Grand Hotel"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95'
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <FaPaperPlane /> SEND REQUEST
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 text-center space-y-6"
                            >
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">
                                    <FaCheckCircle />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900">Thank You!</h3>
                                    <p className="text-slate-500 font-medium">
                                        Your request has been received. Our team will contact you within 24 hours.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                                >
                                    CLOSE
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
