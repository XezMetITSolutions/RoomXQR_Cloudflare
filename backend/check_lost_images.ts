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
    const hotels = await prisma.hotel.findMany({
        where: { tenantId }
    });
    console.log('Hotels found:', JSON.stringify(hotels, null, 2));

    const allItems = await prisma.menuItem.findMany({
        where: { tenantId }
    });
    console.log('Total items in DB for this tenant:', allItems.length);

    // Klasördeki dosyaları kontrol etmek için script (eğer sunucuda olsaydık)
    // Ama şu an sadece DB'deki image yollarına bakabiliriz.
    const uniqueImages = [...new Set(allItems.map(i => i.image))];
    console.log('Unique image paths in DB:', uniqueImages);
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
