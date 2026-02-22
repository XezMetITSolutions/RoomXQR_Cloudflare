import { PrismaClient } from '@prisma/client'

const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function listTenants() {
    try {
        const tenants = await prisma.tenant.findMany();
        console.log('Tenants:', tenants.map(t => t.slug));
    } catch (e) {
        console.error('Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

listTenants();
