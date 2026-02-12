import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateHotelInfoIstanbul() {
    try {
        console.log('🏨 Grandhotel Istanbul otel bilgileri güncelleniyor...')

        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' },
            include: { hotels: true }
        })

        if (!tenant || !tenant.hotels || tenant.hotels.length === 0) {
            console.error('❌ Grandhotel veya bağlı otel bulunamadı.')
            return
        }

        // @ts-ignore
        const hotelId = tenant.hotels[0].id

        const istanbulSettings = {
            wifi: {
                networkName: 'Grandhotel_Istanbul_Guest',
                password: 'istanbul-welcome-2025',
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
            description: 'İstanbul\'un kalbinde tarihi atmosferi ve modern lüksü bir araya getiren Grandhotel Istanbul, misafirlerine Boğaz manzaralı eşsiz bir konaklama sunar.'
        }

        await (prisma.hotel as any).update({
            where: { id: hotelId },
            data: {
                name: 'Grandhotel Istanbul',
                address: 'Gümüşsuyu, İnönü Cd. No:8, 34437 Beyoğlu/İstanbul',
                phone: '+90 212 334 44 44',
                email: 'istanbul@grandhotel.com',
                website: 'https://grandhotel.roomxqr.com',
                logo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=500',
                settings: istanbulSettings
            }
        })

        await prisma.tenant.update({
            where: { slug: 'grandhotel' },
            data: { name: 'Grandhotel Istanbul' }
        })

        console.log('✅ Grandhotel Istanbul bilgileri başarıyla güncellendi.')

    } catch (error) {
        console.error('❌ Hata oluştu:', error)
    } finally {
        await prisma.$disconnect()
    }
}

updateHotelInfoIstanbul()
