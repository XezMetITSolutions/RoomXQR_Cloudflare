import { PrismaClient } from '@prisma/client';

const dbs = [
    {
        name: 'Frankfurt-Main',
        url: 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database'
    },
    {
        name: 'Oregon-eek6',
        url: 'postgresql://roomxqr:2s0ZdRXelkkxLsSNi9fHyzPNsTUPjQMN@dpg-d38qqfvfte5s73cb4vv0-a.oregon-postgres.render.com/roomxqr_eek6'
    },
    {
        name: 'Oregon-Database',
        url: 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.oregon-postgres.render.com/roomxqr_database'
    }
];

async function scanDb(dbInfo: any) {
    console.log(`Scanning DB: ${dbInfo.name}...`);
    const prisma = new PrismaClient({
        datasources: { db: { url: dbInfo.url } }
    });

    try {
        const items: any[] = await prisma.menuItem.findMany();
        const withImages = items.filter(i => (i.image || '').startsWith('data:image'));
        console.log(`  - Found ${items.length} total items.`);
        console.log(`  - Found ${withImages.length} items with base64 images.`);
        withImages.forEach(i => {
            console.log(`    * [${i.tenantId}] ${i.name} (Size: ${i.image.length})`);
        });
    } catch (err: any) {
        console.log(`  - Error scanning ${dbInfo.name}: ${err.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    for (const db of dbs) {
        await scanDb(db);
        console.log('---');
    }
}

main();
