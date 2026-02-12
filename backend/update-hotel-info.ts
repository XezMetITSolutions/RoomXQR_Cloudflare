import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateHotelInfo() {
    try {
        console.log('🏨 Grandhotel otel bilgileri güncelleniyor...')

        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' },
            include: { hotels: true }
        })

        if (!tenant) {
            console.error('❌ Grandhotel tenantı bulunamadı.')
            return
        }

        if (!tenant.hotels || tenant.hotels.length === 0) {
            console.error('❌ Grandhotel bağlı otel bulunamadı.')
            return
        }

        // @ts-ignore
        const hotelId = tenant.hotels[0].id

        await (prisma.hotel as any).update({
            where: { id: hotelId },
            data: {
                name: 'Grandhotel Vienna & Spa',
                address: 'Kärntner Ring 9, 1010 Wien, Österreich',
                phone: '+43 1 515 880',
                email: 'info@grandhotel-vienna.com',
                website: 'https://grandhotel.roomxqr.com',
                logo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=500',
                settings: {
                    description: 'Viyana\'nın kalbinde, lüks ve konforun buluştuğu tarihi bir mekan. Misafirlerimize unutulmaz bir konaklama deneyimi sunuyoruz.',
                    socialMedia: {
                        instagram: '@grandhotelvienna',
                        facebook: 'GrandhotelVienna'
                    },
                    amenities: [
                        'Ücretsiz Wi-Fi',
                        'Spa ve Wellness Merkezi',
                        'Kapalı Yüzme Havuzu',
                        '7/24 Oda Servisi',
                        'Vale Park Hizmeti',
                        'Fitness Merkezi'
                    ],
                    checkInTime: '14:00',
                    checkOutTime: '12:00'
                }
            }
        })

        console.log('✅ Grandhotel otel bilgileri başarıyla güncellendi.')

    } catch (error) {
        console.error('❌ Hata oluştu:', error)
    } finally {
        await prisma.$disconnect()
    }
}

updateHotelInfo()
