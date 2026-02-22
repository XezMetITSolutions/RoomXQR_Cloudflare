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

    const base64Items = allItems.filter(i => (i.image as string || '').startsWith('data:'));

    console.log(`TOTAL BASE64 ITEMS FOUND: ${base64Items.length}`);
    base64Items.forEach(item => {
        console.log(`- [${item.tenantId}] ${item.name} (Hotel: ${item.hotelId})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
