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

    console.log(`Total items: ${allItems.length}`);
    allItems.forEach(item => {
        const imageStr = (item.image as string) || '';
        let imgType = 'NONE';
        if (imageStr.startsWith('data:')) imgType = 'BASE64 (Uploaded)';
        else if (imageStr.includes('unsplash')) imgType = 'UNSPLASH';
        else if (imageStr) imgType = 'OTHER/URL';

        console.log(`ID: ${item.id} | Name: ${item.name} | Image Type: ${imgType}`);
        if (imgType === 'BASE64 (Uploaded)') {
            console.log(`   Preview: ${imageStr.substring(0, 50)}...`);
        } else if (imageStr && imgType !== 'UNSPLASH') {
            console.log(`   Internal Path: ${imageStr}`);
        }
    });
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
