import { PrismaClient } from '@prisma/client'

const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
})

async function deleteAllOrders() {
    console.log(`🔍 Connecting to database...`)

    try {
        console.log(`🗑️ Deleting ALL orders in the entire database...`)

        const deleted = await (prisma as any).order.deleteMany({})

        console.log(`✨ Successfully deleted ${deleted.count} orders globally.`)

    } catch (error: any) {
        console.error(`❌ Error deleting orders:`, error.message || error)
    } finally {
        await prisma.$disconnect()
    }
}

deleteAllOrders()
