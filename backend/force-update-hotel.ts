import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAllGrandhotelHotels() {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' },
            include: { hotels: true }
        })

        if (!tenant) {
            console.log('Tenant NOT FOUND')
            return
        }

        console.log(`Found tenant: ${tenant.name} (${tenant.id}) with ${tenant.hotels.length} hotels.`)

        const settings = {
            wifi: {
                networkName: 'Grandhotel_Istanbul_Guest',
                password: 'welcome-2026',
                speed: '100 Mbps',
                supportPhone: '+90 212 555 1010'
            },
            hours: {
                reception: '7/24 Açık',
                restaurant: '07:00 - 23:00',
                bar: '12:00 - 02:00',
                spa: '09:00 - 21:00'
            },
            dining: {
                breakfast: '07:00 - 10:30',
                lunch: '12:30 - 14:30',
                dinner: '19:00 - 22:30',
                roomService: '7/24 Mevcut',
                towelChange: 'Günde Bir Kez',
                techSupport: '09:00 - 18:00'
            },
            amenities: [
                'Ücretsiz Wi-Fi',
                'Spa ve Wellness Merkezi',
                'Kapalı Yüzme Havuzu',
                '7/24 Oda Servisi',
                'Vale Park Hizmeti',
                'Fitness Merkezi',
                'Türk Hamamı',
                'Havalimanı Transferi'
            ],
            contacts: {
                reception: '0',
                security: '911',
                concierge: '112'
            },
            description: "İstanbul'un kalbinde tarihi atmosferi ve modern lüksü bir araya getiren Grandhotel Istanbul, misafirlerine Boğaz manzaralı eşsiz bir konaklama sunar."
        }

        for (const hotel of tenant.hotels) {
            console.log(`Updating hotel: ${hotel.id}...`)
            await prisma.hotel.update({
                where: { id: hotel.id },
                data: {
                    name: 'Grandhotel Istanbul',
                    address: 'Gümüşsuyu Mah. İnönü Cad. No:8, Beyoğlu, İstanbul',
                    settings: settings as any
                }
            })
        }

        // Also ensure tenant name is correct
        await prisma.tenant.update({
            where: { id: tenant.id },
            data: { name: 'Grandhotel Istanbul' }
        })

        console.log('✅ All hotels and tenant updated successfully.')

    } catch (e) {
        console.error('Error during update:', e)
    } finally {
        await prisma.$disconnect()
    }
}

updateAllGrandhotelHotels()
