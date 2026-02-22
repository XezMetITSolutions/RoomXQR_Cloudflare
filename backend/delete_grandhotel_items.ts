import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Looking up the 'grandhotel' tenant...");
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' }
        });

        if (!tenant) {
            console.error("Error: 'grandhotel' tenant not found.");
            return;
        }

        console.log(`Found tenant with ID: ${tenant.id}. Starting deletion of all menu items...`);

        const deleteResult = await prisma.menuItem.deleteMany({
            where: { tenantId: tenant.id }
        });

        console.log(`Successfully deleted ${deleteResult.count} menu items for 'grandhotel'.`);
    } catch (error) {
        console.error("An error occurred during deletion:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
