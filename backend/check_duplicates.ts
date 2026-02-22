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

    const nameCounts: Record<string, number> = {};
    allItems.forEach(item => {
        const name = item.name || 'Unnamed';
        nameCounts[name] = (nameCounts[name] || 0) + 1;
    });

    const duplicates = Object.keys(nameCounts).filter(name => nameCounts[name] > 1);
    console.log('Duplicate items found:', duplicates);

    if (duplicates.length > 0) {
        const duplicateItems = allItems.filter(item => item.name && duplicates.includes(item.name));
        console.log('Duplicate details:', JSON.stringify(duplicateItems.map(i => ({
            id: i.id,
            name: i.name,
            image: (i.image as string || '').substring(0, 20),
            isBase64: (i.image as string || '').startsWith('data:')
        })), null, 2));
    } else {
        console.log('No duplicate names found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
