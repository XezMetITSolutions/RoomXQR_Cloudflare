import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugGrandhotel() {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' },
            include: { hotels: true }
        })

        if (!tenant) {
            console.log('Tenant NOT FOUND')
            return
        }

        console.log('Tenant Info:', {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug
        })

        if (!tenant.hotels || tenant.hotels.length === 0) {
            console.log('No hotels found for this tenant')
            return
        }

        const hotel = (tenant as any).hotels[0]
        console.log('Hotel Info:', {
            id: hotel.id,
            name: hotel.name,
            address: hotel.address,
            settings: hotel.settings
        })

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

debugGrandhotel()
