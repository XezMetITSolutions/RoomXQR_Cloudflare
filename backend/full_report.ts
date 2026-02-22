import { PrismaClient } from '@prisma/client';
import fs from 'fs';

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

    const report = allItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        imageType: (item.image as string || '').startsWith('data:') ? 'BASE64' :
            ((item.image as string || '').includes('unsplash') ? 'UNSPLASH' : 'OTHER'),
        imagePreview: (item.image as string || '').substring(0, 50)
    }));

    fs.writeFileSync('item_report.json', JSON.stringify(report, null, 2));
    console.log('Report written to item_report.json');
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
