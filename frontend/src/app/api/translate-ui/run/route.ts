import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPL_API_KEY || process.env.DEEPL_API;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Sunucuda DEEPL_API_KEY veya DEEPL_API tanımlı değil.' },
        { status: 500 }
      );
    }

    const rootDir = path.resolve(process.cwd(), '..');
    const scriptPath = path.join(rootDir, 'scripts', 'translate-ui-with-deepl.js');
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { success: false, message: 'Script bulunamadı: scripts/translate-ui-with-deepl.js' },
        { status: 404 }
      );
    }

    return await new Promise<NextResponse>((resolve) => {
      const child = spawn('node', [scriptPath], {
        cwd: rootDir,
        env: { ...process.env, DEEPL_API_KEY: apiKey, DEEPL_API: apiKey },
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (chunk) => { stdout += chunk.toString(); });
      child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(
            NextResponse.json({
              success: true,
              message: 'Çeviriler oluşturuldu. tr, de, en, ru dosyaları public/locales altına yazıldı.',
              log: stdout.trim() || undefined,
            })
          );
        } else {
          resolve(
            NextResponse.json(
              {
                success: false,
                message: stderr.trim() || stdout.trim() || `Script çıkış kodu: ${code}`,
                log: stdout.trim() || undefined,
              },
              { status: 500 }
            )
          );
        }
      });

      child.on('error', (err) => {
        resolve(
          NextResponse.json(
            { success: false, message: err?.message || 'Script çalıştırılamadı.' },
            { status: 500 }
          )
        );
      });
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
