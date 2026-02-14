import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();
async function main() {
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'grandhotel' } });
    if (!tenant) { console.log('TENANT NOT FOUND'); return; }
    const count = await prisma.room.count({ where: { tenantId: tenant.id, isActive: true } });
    console.log('ACTIVE ROOMS:', count);
    const sample = await prisma.room.findFirst({ where: { tenantId: tenant.id, isActive: true } });
    console.log('SAMPLE ROOM:', JSON.stringify(sample, null, 2));
}
main().finally(() => prisma.$disconnect());
