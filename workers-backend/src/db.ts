import { PrismaClient } from '@prisma/client';

// Cloudflare Workers'da PrismaClient global olarak tutulabilir
// Hyperdrive bağlantısı ile çalışır
let prisma: PrismaClient;

export function getPrisma(databaseUrl: string): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
        });
    }
    return prisma;
}

export type { PrismaClient };
