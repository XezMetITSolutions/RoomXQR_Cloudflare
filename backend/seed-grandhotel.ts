import { PrismaClient, RoomType, NotificationType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

async function seedGrandhotelData() {
    try {
        console.log('🌱 Grandhotel için veriler yükleniyor...')

        // 1. Grandhotel Tenant'ını bul
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' },
            include: { hotels: true }
        })

        if (!tenant) {
            console.error('❌ "grandhotel" işletmesi bulunamadı. Önce işletmeyi oluşturmalısınız.')
            return
        }

        const hotel = tenant.hotels[0]
        if (!hotel) {
            console.error('❌ "grandhotel" için kayıtlı otel bulunamadı.')
            return
        }

        console.log(`🏨 İşletme: ${tenant.name}, Otel: ${hotel.name}`)

        // 2. Odaları oluştur (Eğer yoksa)
        console.log('🛏️ Odalar kontrol ediliyor...')
        const roomNumbers = ['101', '102', '103', '104', '105']
        for (const num of roomNumbers) {
            await prisma.room.upsert({
                where: { qrCode: `grandhotel-room-${num}` },
                update: {
                    number: num,
                    isActive: true,
                    hotelId: hotel.id,
                    tenantId: tenant.id
                },
                create: {
                    number: num,
                    floor: 1,
                    type: RoomType.DOUBLE,
                    capacity: 2,
                    qrCode: `grandhotel-room-${num}`,
                    hotelId: hotel.id,
                    tenantId: tenant.id
                }
            })
        }

        // 3. Menü Öğelerini oluştur
        console.log('🍴 Menü öğeleri yükleniyor...')
        const menuItems = [
            {
                name: 'Mercimek Çorbası',
                description: 'Kıtır ekmek ve limon ile servis edilir.',
                price: new Decimal(120.00),
                category: 'Çorbalar',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500',
                translations: {
                    de: { name: 'Linsensuppe', description: 'Serviert mit Croutons und Zitrone.' },
                    en: { name: 'Lentil Soup', description: 'Served with croutons and lemon.' }
                }
            },
            {
                name: 'Izgara Köfte',
                description: 'Pirinç pilavı ve közlenmiş biber ile.',
                price: new Decimal(350.00),
                category: 'Ana Yemekler',
                image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=500',
                translations: {
                    de: { name: 'Gegrillte Fleischbällchen', description: 'Mit Reis und gegrillten Paprikas.' },
                    en: { name: 'Grilled Meatballs', description: 'With rice and roasted peppers.' }
                }
            },
            {
                name: 'Pizza Margherita',
                description: 'Taze mozzarella ve fesleğen.',
                price: new Decimal(280.00),
                category: 'Pizzalar',
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?q=80&w=500',
                translations: {
                    de: { name: 'Pizza Margherita', description: 'Frischer Mozzarella und Basilikum.' },
                    en: { name: 'Pizza Margherita', description: 'Fresh mozzarella and basil.' }
                }
            },
            {
                name: 'Coca Cola',
                description: '330ml',
                price: new Decimal(60.00),
                category: 'İçecekler',
                image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500',
                translations: {
                    de: { name: 'Coca Cola', description: '330ml' },
                    en: { name: 'Coca Cola', description: '330ml' }
                }
            },
            {
                name: 'Taze Sıkılmış Portakal Suyu',
                description: 'Günlük taze meyvelerden.',
                price: new Decimal(85.00),
                category: 'İçecekler',
                image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=500',
                translations: {
                    de: { name: 'Frisch gepresster Orangensaft', description: 'Aus täglichen frischen Früchten.' },
                    en: { name: 'Fresh Orange Juice', description: 'From daily fresh fruits.' }
                }
            }
        ]

        for (const item of menuItems) {
            await prisma.menuItem.create({
                data: {
                    ...item,
                    tenantId: tenant.id,
                    hotelId: hotel.id
                }
            })
        }

        // 4. Bilgilendirmeler / Duyurular (Duyuru sayfası için)
        console.log('📢 Duyurular/Bilgiler ekleniyor...')
        const announcements = [
            {
                type: NotificationType.SYSTEM,
                title: 'Wi-Fi Şifresi',
                message: 'Otel genelinde ücretsiz Wi-Fi kullanamı: GrandHotel_Free / Şifre: Welcome2024',
                metadata: {
                    category: 'Hizmet',
                    icon: 'wifi',
                    translations: {
                        de: { title: 'WLAN-Passwort', message: 'Kostenloses WLAN im gesamten Hotel: GrandHotel_Free / Passwort: Welcome2024' },
                        en: { title: 'Wi-Fi Password', message: 'Free Wi-Fi throughout the hotel: GrandHotel_Free / Password: Welcome2024' }
                    }
                }
            },
            {
                type: NotificationType.PROMOTION,
                title: 'Kahvaltı Saatleri',
                message: 'Açık büfe kahvaltımız hafta içi 07:00-10:00, hafta sonu 07:30-11:00 saatleri arasındadır.',
                metadata: {
                    category: 'Restoran',
                    icon: 'utensils',
                    translations: {
                        de: { title: 'Frühstückszeiten', message: 'Unser Frühstücksbuffet ist wochentags von 07:00 bis 10:00 Uhr und am Wochenende von 07:30 bis 11:00 Uhr geöffnet.' },
                        en: { title: 'Breakfast Hours', message: 'Our breakfast buffet is open from 07:00 to 10:00 on weekdays and 07:30 to 11:00 on weekends.' }
                    }
                }
            },
            {
                type: NotificationType.SYSTEM,
                title: 'Spa & Havuz',
                message: 'Spa merkezimiz ve havuzumuz her gün 09:00 - 21:00 saatleri arasında hizmetinizdedir.',
                metadata: {
                    category: 'Aktivite',
                    icon: 'pool',
                    translations: {
                        de: { title: 'Spa & Pool', message: 'Unser Spa-Center und Pool stehen Ihnen täglich von 09:00 bis 21:00 Uhr zur Verfügung.' },
                        en: { title: 'Spa & Pool', message: 'Our spa center and pool are at your service daily from 09:00 to 21:00.' }
                    }
                }
            }
        ]

        for (const ann of announcements) {
            await prisma.notification.create({
                data: {
                    ...ann,
                    tenantId: tenant.id,
                    hotelId: hotel.id,
                    isRead: false
                }
            })
        }

        console.log('✅ Grandhotel demo verileri başarıyla yüklendi.')

    } catch (error) {
        console.error('❌ Hata oluştu:', error)
    } finally {
        await prisma.$disconnect()
    }
}

seedGrandhotelData()
