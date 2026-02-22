const { PrismaClient } = require('@prisma/client');

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
        console.log("Listing all tenants...");
        const tenants = await prisma.tenant.findMany({
            include: {
                _count: {
                    select: {
                        menuItems: true,
                        hotels: true
                    }
                }
            }
        });

        console.log("Tenants Summary:");
        tenants.forEach(t => {
            console.log(`- ${t.name} (slug: ${t.slug}, id: ${t.id})`);
            console.log(`  Menu Items: ${t._count.menuItems}`);
            console.log(`  Hotels: ${t._count.hotels}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
