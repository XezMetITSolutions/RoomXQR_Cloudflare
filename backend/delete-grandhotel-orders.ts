import { PrismaClient } from '@prisma/client'

const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL
        }
    }
})

async function deleteOrders() {
    const slug = 'grandhotel'
    console.log(`🔍 Connecting to database...`)

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug }
        })

        if (!tenant) {
            console.error(`❌ Tenant with slug '${slug}' not found.`)
            return
        }

        console.log(`✅ Found tenant: ${tenant.name} (${tenant.id})`)

        // Find hotelId - assuming there's at least one hotel for this tenant
        const hotel = await (prisma as any).hotel.findFirst({
            where: { tenantId: tenant.id }
        })

        if (!hotel) {
            console.error(`❌ No hotel found for tenant '${slug}'`)
            return
        }

        console.log(`🗑️ Deleting all orders for hotel: ${hotel.name}...`)

        const deleted = await (prisma as any).order.deleteMany({
            where: { hotelId: hotel.id }
        })

        console.log(`✨ Successfully deleted ${deleted.count} orders.`)

    } catch (error: any) {
        console.error(`❌ Error deleting orders:`, error.message || error)
    } finally {
        await prisma.$disconnect()
    }
}

deleteOrders()
