import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function create10Orders() {
    const slug = 'grandhotel'

    try {
        console.log(`🔍 Connecting to database...`)

        const tenant: any = await prisma.tenant.findUnique({
            where: { slug },
            include: {
                hotels: true,
                rooms: { take: 20 },
                menuItems: { take: 15 },
                guests: { take: 10 }
            }
        })

        if (!tenant || tenant.hotels.length === 0) {
            console.error('❌ Tenant or Hotel not found')
            return
        }

        const hotelId = tenant.hotels[0].id
        const tenantId = tenant.id
        const rooms = tenant.rooms || []
        const menuItems = tenant.menuItems || []
        let guests = tenant.guests || []

        if (rooms.length === 0 || menuItems.length === 0) {
            console.error('❌ No rooms or menu items found.')
            return
        }

        // Ensure we have enough guests or rooms to spread the orders
        if (guests.length === 0) {
            console.log('👤 Creating a dummy guest...')
            const newGuest = await prisma.guest.create({
                data: {
                    firstName: 'Demo',
                    lastName: 'User',
                    email: 'demo@roomxqr.com',
                    checkIn: new Date(),
                    tenantId,
                    hotelId,
                    roomId: rooms[0].id,
                    isActive: true
                }
            })
            guests = [newGuest]
        }

        const statuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
        const notes = [
            'Please hurry, I am very hungry.',
            'No onions please.',
            'Extra napkins.',
            'Leave it at the door.',
            'Room charge.',
            'Sparkling water instead of still.',
            'Is it possible to add extra sauce?',
            '',
            'Allergies: Nuts',
            'VIP Guest'
        ]

        console.log('📦 Creating 10 test orders...')

        for (let i = 0; i < 10; i++) {
            const room = rooms[i % rooms.length]
            const guest = guests[i % guests.length] || guests[0]

            // Randomly select 1-3 items
            const itemCount = Math.floor(Math.random() * 3) + 1
            const selectedItems = []
            for (let j = 0; j < itemCount; j++) {
                selectedItems.push(menuItems[Math.floor(Math.random() * menuItems.length)])
            }

            const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 8999)}-${i + 1}`
            const status = statuses[i % statuses.length]
            const note = notes[i % notes.length]

            let total = new Decimal(0);
            for (const item of selectedItems) {
                if (item) total = total.add((item as any).price || 0);
            }

            await prisma.order.create({
                data: {
                    orderNumber,
                    status: status as any,
                    totalAmount: total,
                    notes: note,
                    paymentMethod: 'room_charge',
                    tenantId,
                    hotelId,
                    roomId: (room as any).id,
                    guestId: (guest as any).id,
                    items: {
                        create: selectedItems.filter(item => !!item).map(item => ({
                            quantity: 1,
                            price: (item as any).price || 0,
                            menuItemId: (item as any).id
                        }))
                    }
                }
            })
            console.log(`🚀 Created order ${orderNumber} for Room ${(room as any).number} [Status: ${status}]`)
        }

        console.log('✅ 10 test orders created successfully.')

    } catch (error: any) {
        console.error('❌ Error creating orders:', error.message || error)
    } finally {
        await prisma.$disconnect()
    }
}

create10Orders()
