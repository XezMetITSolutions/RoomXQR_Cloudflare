import { PrismaClient } from '@prisma/client'

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

        const summary: Record<string, number> = {};
        items.forEach(item => {
            const slug = (item as any).tenant?.slug || 'unknown';
            const tid = item.tenantId || 'unknown';
            const key = `${slug} (${tid})`;
            summary[key] = (summary[key] || 0) + 1;
        });

        console.log("Items per tenant:");
        console.log(JSON.stringify(summary, null, 2));

        // @ts-ignore
        const grandhotelItems = items.filter(i => i.tenant?.slug === 'grandhotel');
        if (grandhotelItems.length > 0) {
            console.log(`Found ${grandhotelItems.length} items for 'grandhotel'. Example: ${grandhotelItems[0].name}`);
        } else {
            console.log("No items found for 'grandhotel' slug.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
