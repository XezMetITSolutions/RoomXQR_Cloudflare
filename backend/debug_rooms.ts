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
        where: { tenantId: tenant.id },
        select: {
            id: true,
            number: true,
            qrCode: true,
            isActive: true
        }
    });

    console.log(`Found ${rooms.length} rooms.`);

    const room101 = rooms.find(r => r.number === '101' || r.id === '101' || r.id === 'room-101');
    const room1001 = rooms.find(r => r.number === '1001' || r.id === '1001' || r.id === 'room-1001');

    console.log('Room 101 Debug:', JSON.stringify(room101, null, 2));
    console.log('Room 1001 Debug:', JSON.stringify(room1001, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
