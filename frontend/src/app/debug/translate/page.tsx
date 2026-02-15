'use client';

import { useState } from 'react';
import { translateText } from '@/lib/translateService';

export default function DebugTranslation() {
    const [inputText, setInputText] = useState('');
    const [targetLang, setTargetLang] = useState('en');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugLogs, setDebugLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    const handleTranslate = async () => {
        setLoading(true);
        setError('');
        setTranslatedText('');
        setDebugLogs([]);
        addLog(`Starting translation request...`);
        addLog(`Text: "${inputText}"`);
        addLog(`Target: ${targetLang}`);

        try {
            // 1. Direct API call attempt (to bypass service logic and test route)
            addLog('Testing /api/translate route directly...');
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText,
                    targetLang: targetLang,
                    // sourceLang is omitted to test auto-detection
                })
            });

            const data = await res.json();
            addLog(`API Response Status: ${res.status}`);
            addLog(`API Response Body: ${JSON.stringify(data, null, 2)}`);

            if (!res.ok) {
                throw new Error(data.error || 'API request failed');
            }

            // 2. Service call attempt
            addLog('Testing translateService utility...');
            const serviceResult = await translateText(inputText, targetLang);
            addLog(`Service Result: "${serviceResult}"`);

            setTranslatedText(serviceResult);

        } catch (err: any) {
            console.error(err);
            setError(err.message || String(err));
            addLog(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Translation Debugger</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Text to Translate</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={3}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Merhaba, odaya fazladan havlu istiyorum."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Target Language</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={targetLang}
                        onChange={e => setTargetLang(e.target.value)}
                    >
                        <option value="en">English (EN)</option>
                        <option value="de">German (DE)</option>
                        <option value="ru">Russian (RU)</option>
                        <option value="tr">Turkish (TR)</option>
                        <option value="fr">French (FR)</option>
                    </select>
                </div>

                <button
                    onClick={handleTranslate}
                    disabled={loading || !inputText}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Translation'}
                </button>

                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {translatedText && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <h3 className="font-bold text-green-800">Result:</h3>
                        <p className="text-lg">{translatedText}</p>
                    </div>
                )}

                <div className="mt-8 border-t pt-4">
                    <h3 className="font-bold mb-2">Debug Logs:</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                        {debugLogs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
