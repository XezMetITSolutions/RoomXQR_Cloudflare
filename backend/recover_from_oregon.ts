import { PrismaClient } from '@prisma/client';

// Oregon Connection String
const databaseUrl = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d38qqfvfte5s73cb4vv0-a.oregon-postgres.render.com/roomxqr_database';

// Timeout ayarlarıyla Prisma
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
    // @ts-ignore
    log: ['query', 'error'],
});

async function main() {
    console.log('Connecting to Oregon DB for image recovery...');
    const items: any[] = await prisma.menuItem.findMany({
        where: { tenantId: 'cmlj93fuw0000fw4ldipx34qf' }
    });

    const originalUploads = items.filter(i => (i.image || '').startsWith('data:image'));
    console.log(`FOUND ${originalUploads.length} ORIGINAL IMAGES IN OREGON!`);

    if (originalUploads.length > 0) {
        const fs = require('fs');
        fs.writeFileSync('oregon_recovered.json', JSON.stringify(originalUploads, null, 2));
        console.log('Images saved to oregon_recovered.json. Ready to transfer!');
    }
}

main()
    .catch((e) => {
        console.error('Connection failed:', e.message);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
