import { PrismaClient } from '@prisma/client'

const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function test() {
    try {
        const count = await prisma.tenant.count();
        console.log('Connection successful. Tenant count:', count);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
