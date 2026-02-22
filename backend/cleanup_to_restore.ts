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
    console.log('Cleaning up Unsplash duplicates to bring back user images...');

    const allItems: any[] = await prisma.menuItem.findMany({
        where: { tenantId }
    });

    // Unsplash olanları ve resimsizleri sil (benim sonradan eklediklerim)
    const toDelete = allItems.filter(i =>
        i.image && i.image.includes('unsplash')
    );

    console.log(`Deleting ${toDelete.length} Unsplash items to reveal user uploads...`);

    for (const item of toDelete) {
        await prisma.menuItem.delete({
            where: { id: item.id }
        });
    }

    console.log('Cleanup complete. Your uploaded images should now be visible in the management panel.');
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
