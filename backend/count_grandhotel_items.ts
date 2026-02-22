import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' }
        });

        if (!tenant) {
            console.log("Tenant 'grandhotel' not found");
            return;
        }

        const count = await prisma.menuItem.count({
            where: { tenantId: tenant.id }
        });

        console.log(`Current menu item count for 'grandhotel': ${count}`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
