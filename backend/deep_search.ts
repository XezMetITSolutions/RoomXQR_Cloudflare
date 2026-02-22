import { PrismaClient } from '@prisma/client';

const databaseUrl = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

async function main() {
    console.log('Searching everywhere for any base64 images...');

    const allItems: any[] = await prisma.menuItem.findMany();

    const base64Items = allItems.filter(i => (i.image || '').startsWith('data:image'));

    console.log(`Found ${base64Items.length} items with base64 images.`);

    for (const item of base64Items) {
        console.log(`- NAME: ${item.name} | TENANT: ${item.tenantId} | HOTEL: ${item.hotelId} | SIZE: ${item.image ? item.image.length : 0} bytes`);
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
