import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from the current directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function main() {
    const dbUrl = process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'sslmode=require';
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: dbUrl
            }
        }
    });

    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected!');

        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' }
        });

        if (!tenant) {
            console.error('Tenant "grandhotel" not found.');
            return;
        }

        console.log(`Found tenant: ${tenant.name} (${tenant.id})`);

        const deleteResult = await prisma.menuItem.deleteMany({
            where: { tenantId: tenant.id }
        });

        console.log(`Successfully deleted ${deleteResult.count} menu items.`);

    } catch (error) {
        console.error('Operation failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
