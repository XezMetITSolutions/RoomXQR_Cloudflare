import { PrismaClient } from '@prisma/client'

const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function listAllHotels() {
    try {
        const hotels = await prisma.hotel.findMany({
            include: {
                tenant: true,
                _count: {
                    select: {
                        rooms: true,
                        menuItems: true,
                        guests: true,
                        orders: true
                    }
                }
            }
        })

        console.log('\n--- AVAILABLE HOTELS ---')
        hotels.forEach(hotel => {
            console.log(`\nHotel: ${hotel.name}`)
            console.log(`Tenant: ${hotel.tenant.name} (${hotel.tenant.slug})`)
            console.log(`Rooms: ${hotel._count.rooms}`)
            console.log(`Menu Items: ${hotel._count.menuItems}`)
            console.log(`Active Guests: ${hotel._count.guests}`)
            console.log(`Total Orders: ${hotel._count.orders}`)
        })
        console.log('\n------------------------')

    } catch (e) {
        console.error('Error fetching hotels:', e)
    } finally {
        await prisma.$disconnect()
    }
}

listAllHotels()
