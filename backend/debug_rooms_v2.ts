import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const tenantSlug = process.argv[2] || 'grandhotel';
    console.log(`Checking rooms for tenant: ${tenantSlug}`);

    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug }
    });

    if (!tenant) {
        console.error('Tenant not found');
        return;
    }

    const rooms = await prisma.room.findMany({
        where: { tenantId: tenant.id, isActive: true },
        select: {
            id: true,
            number: true,
            qrCode: true,
            floor: true,
            isActive: true
        }
    });

    console.log(`Found ${rooms.length} active rooms.`);
    if (rooms.length > 0) {
        console.table(rooms.slice(0, 5));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
