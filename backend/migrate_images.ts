import { PrismaClient } from '@prisma/client';
import fs from 'fs';

// Frankfurt DB (Where the images are)
const frankfurtUrl = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database';

// Oregon DB (Where the site likely is)
const oregonUrl = 'postgresql://roomxqr:2s0ZdRXelkkxLsSNi9fHyzPNsTUPjQMN@dpg-d38qqfvfte5s73cb4vv0-a.oregon-postgres.render.com/roomxqr_eek6';

async function main() {
    const frankfurtPrisma = new PrismaClient({ datasources: { db: { url: frankfurtUrl } } });

    console.log('Fetching images from Frankfurt...');
    const items = await frankfurtPrisma.menuItem.findMany({
        where: { tenantId: 'cmlj93fuw0000fw4ldipx34qf' }
    });

    const imagesToMigrate = items.filter(i => (i.image as string || '').startsWith('data:image')).map(i => ({
        name: i.name,
        image: i.image
    }));

    console.log(`Found ${imagesToMigrate.length} images to migrate.`);
    await frankfurtPrisma.$disconnect();

    if (imagesToMigrate.length === 0) return;

    // Try to write to Oregon
    console.log('Connecting to Oregon...');
    const oregonPrisma = new PrismaClient({ datasources: { db: { url: oregonUrl } } });

    try {
        const oregonItems = await oregonPrisma.menuItem.findMany({
            where: { tenantId: 'cmlj93fuw0000fw4ldipx34qf' }
        });

        for (const imgData of imagesToMigrate) {
            // Oregon'da bu isimde ürün var mı?
            const target = oregonItems.find(i => i.name.toLowerCase().trim() === imgData.name.toLowerCase().trim());

            if (target) {
                console.log(`Migrating image for ${imgData.name} to Oregon ID: ${target.id}`);
                await oregonPrisma.menuItem.update({
                    where: { id: target.id },
                    data: { image: imgData.image }
                });
            }
        }
        console.log('Migration to Oregon complete!');
    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        await oregonPrisma.$disconnect();
    }
}

main();
