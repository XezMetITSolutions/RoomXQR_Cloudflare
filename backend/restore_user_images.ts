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
    console.log('Restoring user uploaded images...');

    const allItems: any[] = await prisma.menuItem.findMany({
        where: { tenantId }
    });

    // Base64 (user upload) olanları bul
    const userUploads = allItems.filter(i => i.image && i.image.startsWith('data:'));

    for (const upload of userUploads) {
        // Aynı isimde başka bir kayıt (muhtemelen benim eklediğim Unsplash'lı olan) var mı?
        const targetItem = allItems.find(i =>
            i.name === upload.name &&
            i.id !== upload.id &&
            i.image && i.image.includes('unsplash')
        );

        if (targetItem) {
            console.log(`Matching found for "${upload.name}". Restoring user image to main item ID: ${targetItem.id}`);
            await prisma.menuItem.update({
                where: { id: targetItem.id },
                data: { image: upload.image }
            });

            // Eski/Duplicate kaydı temizle (isteğe bağlı, ama karmaşayı önler)
            // await prisma.menuItem.delete({ where: { id: upload.id } });
        } else {
            console.log(`No match for ${upload.name}, but keeping the image on its original ID: ${upload.id}`);
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
