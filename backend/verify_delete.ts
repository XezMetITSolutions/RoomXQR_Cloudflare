import { PrismaClient } from '@prisma/client';

const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function main() {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' }
        });

        if (!tenant) {
            console.log("Tenant not found");
            return;
        }

        const count = await prisma.menuItem.count({
            where: { tenantId: tenant.id }
        });

        console.log(`FINAL_COUNT: ${count}`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
