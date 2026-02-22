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
    const allItems: any[] = await prisma.menuItem.findMany({
        where: { tenantId }
    });

    const userUploads = allItems.filter(i => i.image && i.image.startsWith('data:'));

    for (const upload of userUploads) {
        // İsme göre en yakın ürünü bul (küçük/büyük harf duyarsız)
        const target = allItems.find(i =>
            i.id !== upload.id &&
            i.name.toLowerCase().trim() === upload.name.toLowerCase().trim() &&
            i.image.includes('unsplash')
        );

        if (target) {
            console.log(`Restoring: ${upload.name} -> Target ID: ${target.id}`);
            await prisma.menuItem.update({
                where: { id: target.id },
                data: { image: upload.image }
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
