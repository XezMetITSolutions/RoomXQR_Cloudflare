
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL || 'office@xezmet.at';
    const password = process.env.ADMIN_PASSWORD || '01528797Mb##';

    console.log(`🛡️  Creating superadmin: ${email}...`);

    const systemTenant = await prisma.tenant.upsert({
        where: { slug: 'system-admin' },
        update: {},
        create: {
            name: 'System Admin',
            slug: 'system-admin',
            domain: 'roomxqr.com',
            isActive: true,
            settings: {}
        }
    });

    const systemHotel = await prisma.hotel.upsert({
        where: { id: 'system-hotel' },
        update: {},
        create: {
            id: 'system-hotel',
            name: 'System Admin Hotel',
            address: 'System',
            phone: '0000000000',
            email: 'admin@roomxqr.com',
            tenantId: systemTenant.id,
            isActive: true
        }
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            tenantId: systemTenant.id,
            hotelId: systemHotel.id,
            isActive: true
        },
        create: {
            email,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'SUPER_ADMIN',
            tenantId: systemTenant.id,
            hotelId: systemHotel.id,
            isActive: true
        }
    });

    console.log(`✅ Super Admin created successfully: ${user.email}`);
}

main()
    .catch((e) => {
        console.error('❌ Failed to create superadmin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
