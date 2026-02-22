import { PrismaClient } from '@prisma/client';

const databaseUrl = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

async function main() {
    console.log('--- RECOVERY REPORT ---');
    const items: any[] = await prisma.menuItem.findMany();
    const facilities: any[] = await prisma.hotelFacility.findMany();

    const allImages = [
        ...items.map(i => ({ type: 'MENU', name: i.name, image: i.image, hotelId: i.hotelId })),
        ...facilities.map(f => ({ type: 'FACILITY', name: f.name, image: f.image, hotelId: f.hotelId }))
    ];

    const userUploads = allImages.filter(i => (i.image || '').startsWith('data:image'));

    console.log(`Found ${userUploads.length} user-uploaded (base64) images.`);
    userUploads.forEach((img, idx) => {
        console.log(`${idx + 1}. [${img.type}] ${img.name} (Hotel: ${img.hotelId}) - Size: ${img.image?.length} bytes`);
    });
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
