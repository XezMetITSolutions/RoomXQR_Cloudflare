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
        console.log("Checking all menu items and their tenants...");
        const items = await prisma.menuItem.findMany({
            include: {
                tenant: true
            }
        });

        console.log(`Total menu items in DB: ${items.length}`);

        const summary = {};
        items.forEach(item => {
            const slug = item.tenant ? item.tenant.slug : 'unknown';
            const tid = item.tenantId || 'unknown';
            const key = `${slug} (${tid})`;
            summary[key] = (summary[key] || 0) + 1;
        });

        console.log("Items per tenant:");
        console.log(JSON.stringify(summary, null, 2));

        const grandhotelItems = items.filter(i => i.tenant && i.tenant.slug === 'grandhotel');
        console.log(`Found ${grandhotelItems.length} items for 'grandhotel' slug.`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
