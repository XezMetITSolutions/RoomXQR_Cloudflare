import { PrismaClient } from '@prisma/client';

// Oregon Database URL
const databaseUrl = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d38qqfvfte5s73cb4vv0-a.oregon-postgres.render.com/roomxqr_database';

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

    console.log(`Oregon DB - Total items: ${allItems.length}`);
    allItems.forEach(item => {
        const imageStr = (item.image as string) || '';
        let imgType = 'NONE';
        if (imageStr.startsWith('data:')) imgType = 'BASE64 (Uploaded)';
        else if (imageStr.includes('unsplash')) imgType = 'UNSPLASH';
        else if (imageStr) imgType = 'OTHER/URL';

        console.log(`ID: ${item.id} | Name: ${item.name} | Image Type: ${imgType}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
