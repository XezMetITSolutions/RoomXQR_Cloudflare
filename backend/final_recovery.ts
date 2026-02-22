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
    console.log('Final image recovery and cleanup...');

    const allItems: any[] = await prisma.menuItem.findMany({
        where: { tenantId }
    });

    // Resimli olanlar
    const withImages = allItems.filter(i => (i.image as string || '').startsWith('data:'));
    // Resimsiz (Unsplash'lı benim yeniler)
    const unsplashItems = allItems.filter(i => (i.image as string || '').includes('unsplash'));

    for (const itemWithImg of withImages) {
        const name = (itemWithImg.name || '').toLowerCase().trim();
        // Bu isme sahip bir Unsplash'lı kopya var mı?
        const duplicate = unsplashItems.find(i => (i.name || '').toLowerCase().trim() === name);

        if (duplicate) {
            console.log(`Found duplicate for "${itemWithImg.name}". Swapping image to active record and deleting shadow.`);
            // Resmi aktif kayda aktar
            await prisma.menuItem.update({
                where: { id: duplicate.id },
                data: { image: itemWithImg.image }
            });
            // Eski kaydı sil
            await prisma.menuItem.delete({
                where: { id: itemWithImg.id }
            });
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
