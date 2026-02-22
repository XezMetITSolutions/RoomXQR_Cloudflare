import { PrismaClient } from '@prisma/client';

const databaseUrl = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

const tenantId = 'cmlj93fuw0000fw4ldipx34qf';

async function main() {
    const allItems = await prisma.menuItem.findMany({
        where: { tenantId }
    });

    console.log(`Report for Tenant: ${tenantId}`);
    console.log(`Total items found: ${allItems.length}`);

    const groupedByName: Record<string, any[]> = {};
    allItems.forEach(item => {
        if (!groupedByName[item.name]) groupedByName[item.name] = [];
        groupedByName[item.name].push(item);
    });

    Object.keys(groupedByName).forEach(name => {
        const items = groupedByName[name];
        console.log(`\nProduct: "${name}" (${items.length} records)`);
        items.forEach(i => {
            const imgStatus = (i.image || '').startsWith('data:image') ? 'BASE64 (User)' :
                (i.image || '').includes('unsplash') ? 'UNSPLASH (Assistant)' : 'NONE';
            console.log(`  - Hotel: ${i.hotelId} | ID: ${i.id} | Image: ${imgStatus}`);
        });
    });
}

main();
