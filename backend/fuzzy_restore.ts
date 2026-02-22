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

    const userUploads = allItems.filter(i => (i.image as string || '').startsWith('data:'));
    const currentMenu = allItems.filter(i => !(i.image as string || '').startsWith('data:'));

    console.log(`User Images Found: ${userUploads.length}`);
    console.log(`Current Menu Items: ${currentMenu.length}`);

    for (const upload of userUploads) {
        // İsme en çok benzeyen ürünü bulalım
        const uploadName = (upload.name || '').toLowerCase().trim();

        let bestMatch = null;
        let highestSimilarity = 0;

        for (const item of currentMenu) {
            const itemName = (item.name || '').toLowerCase().trim();
            if (itemName === uploadName) {
                bestMatch = item;
                break;
            }
            // Basit bir benzerlik kontrolü (içerme)
            if (itemName.includes(uploadName) || uploadName.includes(itemName)) {
                bestMatch = item;
            }
        }

        if (bestMatch) {
            console.log(`RESTORED: "${upload.name}" image applied to "${bestMatch.name}" (ID: ${bestMatch.id})`);
            await prisma.menuItem.update({
                where: { id: bestMatch.id },
                data: { image: upload.image }
            });
        } else {
            console.log(`STILL NO MATCH FOR: ${upload.name}`);
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
