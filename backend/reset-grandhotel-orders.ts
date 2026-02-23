import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Using the URL provided by the user
const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function resetOrders() {
    const slug = 'grandhotel'

    try {
        console.log(`🔍 Connecting to database...`)
        console.log(`🔍 Finding tenant with slug: ${slug}`)

        const tenant: any = await prisma.tenant.findUnique({
            where: { slug },
            include: {
                hotels: true,
                rooms: { take: 10 },
                menuItems: { take: 10 },
                guests: { take: 5 }
            }
        })

        if (!tenant || tenant.hotels.length === 0) {
            console.error('❌ Tenant or Hotel not found')
            return
        }

        const hotelId = tenant.hotels[0].id
        const tenantId = tenant.id

        console.log(`🗑️ Deleting all orders for hotel: ${tenant.hotels[0].name} (${hotelId})`)
        const deletedOrders = await prisma.order.deleteMany({
            where: { hotelId }
        })
        console.log(`✅ Deleted ${deletedOrders.count} orders.`)

        console.log('📦 Creating new test orders...')

        const rooms = tenant.rooms || []
        const menuItems = tenant.menuItems || []

        if (rooms.length === 0 || menuItems.length === 0) {
            console.error('❌ No rooms or menu items found to create test orders.')
            return
        }

        // We need guests too because Order requires guestId
        let guests = tenant.guests || []
        if (guests.length === 0) {
            console.log('👤 Creating a dummy guest for testing...')
            const newGuest = await prisma.guest.create({
                data: {
                    firstName: 'Test',
                    lastName: 'Guest',
                    email: 'test@example.com',
                    checkIn: new Date(),
                    tenantId,
                    hotelId,
                    roomId: rooms[0].id,
                    isActive: true
                }
            })
            guests = [newGuest]
        }

        const testOrders = [
            {
                room: rooms[0],
                guest: guests[0],
                items: [menuItems[0], menuItems[1]],
                status: 'PENDING',
                notes: 'Lütfen peçete ekleyin.'
            },
            {
                room: rooms[1] || rooms[0],
                guest: guests[0],
                items: [menuItems[2] || menuItems[0]],
                status: 'PREPARING',
                notes: 'Soğan olmasın lütfen.'
            },
            {
                room: rooms[2] || rooms[0],
                guest: guests[0],
                items: [menuItems[0], menuItems[3] || menuItems[0]],
                status: 'DELIVERED',
                notes: ''
            },
            {
                room: rooms[3] || rooms[0],
                guest: guests[0],
                items: [menuItems[1] || menuItems[0], menuItems[2] || menuItems[0]],
                status: 'READY',
                notes: 'Oda 304'
            }
        ]

        for (const [idx, data] of testOrders.entries()) {
            if (!data.room || !data.guest) continue;

            const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${idx}`

            let total = new Decimal(0);
            for (const item of data.items) {
                if (item) total = total.add((item as any).price);
            }

            await prisma.order.create({
                data: {
                    orderNumber,
                    status: data.status as any,
                    totalAmount: total,
                    notes: data.notes,
                    paymentMethod: 'room_charge',
                    tenantId,
                    hotelId,
                    roomId: (data.room as any).id,
                    guestId: (data.guest as any).id,
                    items: {
                        create: data.items.filter(item => !!item).map(item => ({
                            quantity: 1,
                            price: (item as any).price,
                            menuItemId: (item as any).id
                        }))
                    }
                }
            })
            console.log(`🚀 Created order ${orderNumber} (${data.status})`)
        }

        console.log('✅ All test orders created successfully.')

    } catch (error: any) {
        console.error('❌ Error resetting orders:', error.message || error)
        if (error.message && error.message.includes('Can\'t reach database server')) {
            console.log('\n💡 Hint: The URL with "-a" is often the internal Render URL. If you are connecting from outside Render, try removing the "-a" from the hostname (e.g., dpg-...frankfurt-postgres.render.com).');
        }
    } finally {
        await prisma.$disconnect()
    }
}

resetOrders()
