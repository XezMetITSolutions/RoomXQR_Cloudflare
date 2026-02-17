import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Demo seeding removed as per request


  // System Admin Tenant ve User oluştur
  console.log('🛡️  System Admin oluşturuluyor...');
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

  const superAdminPassword = await bcrypt.hash('01528797Mb##', 10);
  await prisma.user.upsert({
    where: { email: 'roomxqr-admin@roomxqr.com' },
    update: {
      password: superAdminPassword,
      role: 'SUPER_ADMIN' as const,
      tenantId: systemTenant.id,
      hotelId: systemHotel.id
    },
    create: {
      email: 'roomxqr-admin@roomxqr.com',
      password: superAdminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: 'SUPER_ADMIN' as const,
      tenantId: systemTenant.id,
      hotelId: systemHotel.id,
      isActive: true
    }
  });
  console.log('✅ Super Admin created: roomxqr-admin@roomxqr.com');

  // Second Super Admin for office@xezmet.at
  await prisma.user.upsert({
    where: { email: 'office@xezmet.at' },
    update: {
      password: superAdminPassword,
      role: 'SUPER_ADMIN' as const,
      tenantId: systemTenant.id,
      hotelId: systemHotel.id
    },
    create: {
      email: 'office@xezmet.at',
      password: superAdminPassword,
      firstName: 'Xezal',
      lastName: 'Admin',
      role: 'SUPER_ADMIN' as const,
      tenantId: systemTenant.id,
      hotelId: systemHotel.id,
      isActive: true
    }
  });
  console.log('✅ Super Admin created: office@xezmet.at');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
