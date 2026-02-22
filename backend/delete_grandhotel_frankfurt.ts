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
        console.log("Looking up the 'grandhotel' tenant in Frankfurt DB...");
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' }
        });

        if (!tenant) {
            console.error("Error: 'grandhotel' tenant not found in Frankfurt DB.");
            return;
        }

        console.log(`Found tenant with ID: ${tenant.id}. Starting deletion of all menu items...`);

        const deleteResult = await prisma.menuItem.deleteMany({
            where: { tenantId: tenant.id }
        });

        console.log(`Successfully deleted ${deleteResult.count} menu items for 'grandhotel'.`);
    } catch (error) {
        console.error("An error occurred during deletion:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
