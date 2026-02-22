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
const hotelId = 'cmlj93fv30002fw4l44jtefeh';

async function main() {
    console.log('Checking current items for Grandhotel in Frankfurt database...');

    const count = await prisma.menuItem.count({
        where: { tenantId }
    });

    const items = await prisma.menuItem.findMany({
        where: { tenantId },
        take: 5
    });

    console.log(`Total items found: ${count}`);
    console.log('Sample items:', JSON.stringify(items, null, 2));

    // Also check if there are other tenants that might be conflicting or if the slug is correct
    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
    });
    console.log('Current tenant slug:', tenant?.slug);
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
