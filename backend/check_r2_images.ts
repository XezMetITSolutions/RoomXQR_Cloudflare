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
    const allItems = await prisma.menuItem.findMany();

    const r2Items = allItems.filter(i => (i.image || '').includes('r2.dev') || (i.image || '').includes('cloudflarestorage.com'));
    console.log(`Found ${r2Items.length} items with R2 image URLs.`);

    if (r2Items.length > 0) {
        r2Items.forEach(i => console.log(`- ${i.name}: ${i.image}`));
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
