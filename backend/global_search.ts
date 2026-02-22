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

async function main() {
    const allItems: any[] = await prisma.menuItem.findMany();

    const report = allItems.map(i => ({
        id: i.id,
        tenantId: i.tenantId,
        name: i.name,
        imageType: (i.image && i.image.startsWith('data:')) ? 'BASE64' : (i.image ? 'URL' : 'NONE'),
        imagePreview: i.image ? i.image.substring(0, 50) : 'NONE'
    }));

    fs.writeFileSync('global_report.json', JSON.stringify(report, null, 2));
    console.log('Global report written.');
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
