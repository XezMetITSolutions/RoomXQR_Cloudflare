import { PrismaClient, RoomType, NotificationType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

async function seedGrandhotelData() {
    try {
        console.log('🌱 Grandhotel için veriler güncelleniyor...')

        // 1. Grandhotel Tenant'ını bul
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' },
            include: { hotels: true }
        })

        if (!tenant) {
            console.error('❌ "grandhotel" işletmesi bulunamadı.')
            return
        }

        const hotel = tenant.hotels[0]
        if (!hotel) {
            console.error('❌ "grandhotel" için kayıtlı otel bulunamadı.')
            return
        }

        // Önce eski verileri temizle (Sadece grandhotel'e ait olanları)
        await prisma.menuItem.deleteMany({ where: { tenantId: tenant.id } })
        await prisma.notification.deleteMany({ where: { tenantId: tenant.id, type: NotificationType.SYSTEM } })

        console.log(`🏨 İşletme: ${tenant.name}, Otel: ${hotel.name}`)

        // 2. Menü Öğelerini oluştur (Oda servisine uygun, genişletilmiş liste)
        console.log('🍴 Menü öğeleri yükleniyor...')
        const menuItems = [
            // Klasik Oda Servisi
            {
                name: 'Grand Club Sandwich',
                description: 'Izgara tavuk, dana jambon, yumurta, marul, domates ve mayonez. Yanında patates kızartması ile.',
                price: new Decimal(380.00),
                category: 'Atıştırmalıklar',
                image: 'https://images.unsplash.com/photo-1567234665766-cd1461d0a5be?q=80&w=500',
                translations: {
                    de: { name: 'Grand Club Sandwich', description: 'Gegrilltes Hähnchen, Rinderschinken, Ei, Salat, Tomaten und Mayonnaise. Serviert mit Pommes.' },
                    en: { name: 'Grand Club Sandwich', description: 'Grilled chicken, beef ham, egg, lettuce, tomato and mayo. Served with French fries.' }
                }
            },
            {
                name: 'Cheeseburger & Fries',
                description: '200gr ev yapımı burger köftesi, cheddar peyniri, karamelize soğan. Patates kızartması eşliğinde.',
                price: new Decimal(420.00),
                category: 'Atıştırmalıklar',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500',
                translations: {
                    de: { name: 'Cheeseburger & Pommes', description: '200g hausgemachtes Burger-Patty, Cheddar-Käse, karamellisierte Zwiebeln. Begleitet von Pommes Frites.' },
                    en: { name: 'Cheeseburger & Fries', description: '200gr homemade burger patty, cheddar cheese, caramelized onions. Accompanied by French fries.' }
                }
            },
            {
                name: 'Sezar Salata (Tavuklu)',
                description: 'Izgara tavuk dilimleri, marul, kruton ve özel Sezar sos.',
                price: new Decimal(310.00),
                category: 'Salatalar',
                image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=500',
                translations: {
                    de: { name: 'Caesar Salad (mit Hähnchen)', description: 'Gegrillte Hähnchenstreifen, Kopfsalat, Croutons und spezielles Caesar-Dressing.' },
                    en: { name: 'Caesar Salad (with Chicken)', description: 'Grilled chicken strips, lettuce, croutons and special Caesar sauce.' }
                }
            },
            // Pratik Ana Yemekler
            {
                name: 'Penne Arrabbiata',
                description: 'Acılı domates sosu, siyah zeytin ve taze fesleğen ile.',
                price: new Decimal(290.00),
                category: 'Makarnalar',
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500',
                translations: {
                    de: { name: 'Penne Arrabbiata', description: 'Mit scharfer Tomatensauce, schwarzen Oliven und frischem Basilikum.' },
                    en: { name: 'Penne Arrabbiata', description: 'With spicy tomato sauce, black olives and fresh basil.' }
                }
            },
            {
                name: 'Sebzeli Noodle',
                description: 'Mevsim sebzeleri ve soya sosu ile wokta pişirilmiş.',
                price: new Decimal(340.00),
                category: 'Uzak Doğu',
                image: 'https://images.unsplash.com/photo-1585032295557-68b61c42e47e?q=80&w=500',
                translations: {
                    de: { name: 'Gemüse-Nudeln', description: 'Im Wok zubereitet mit Saisongemüse und Sojasauce.' },
                    en: { name: 'Vegetable Noodles', description: 'Wok-cooked with seasonal vegetables and soy sauce.' }
                }
            },
            // Tatlılar
            {
                name: 'Meyve Tabağı',
                description: 'Mevsim meyvelerinden oluşan ferahlatıcı tabak.',
                price: new Decimal(220.00),
                category: 'Tatlılar',
                image: 'https://images.unsplash.com/photo-1528498033373-3c6c08e93d79?q=80&w=500',
                translations: {
                    de: { name: 'Obstplatte', description: 'Erfrischende Platte mit Früchten der Saison.' },
                    en: { name: 'Fruit Platter', description: 'Refreshing plate made of seasonal fruits.' }
                }
            },
            {
                name: 'Tiramisu',
                description: 'Orijinal İtalyan tarifiyle, taze mascarpone ile.',
                price: new Decimal(240.00),
                category: 'Tatlılar',
                image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=500',
                translations: {
                    de: { name: 'Tiramisu', description: 'Nach original italienischem Rezept, mit frischem Mascarpone.' },
                    en: { name: 'Tiramisu', description: 'With original Italian recipe, fresh mascarpone.' }
                }
            },
            // İçecekler (Coca Cola kalktı, daha sağlıklı seçenekler eklendi)
            {
                name: 'Maden Suyu (250ml)',
                description: 'Doğal mineralli su.',
                price: new Decimal(45.00),
                category: 'İçecekler',
                image: 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?q=80&w=500',
                translations: {
                    de: { name: 'Mineralwasser (250ml)', description: 'Natürliches Mineralwasser.' },
                    en: { name: 'Mineral Water (250ml)', description: 'Natural mineral water.' }
                }
            },
            {
                name: 'Ev Yapımı Limonata',
                description: 'Taze nane yaprakları ile.',
                price: new Decimal(90.00),
                category: 'İçecekler',
                image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=500',
                translations: {
                    de: { name: 'Hausgemachte Limonade', description: 'Mit frischen Minzblättern.' },
                    en: { name: 'Homemade Lemonade', description: 'With fresh mint leaves.' }
                }
            },
            {
                name: 'Filtre Kahve',
                description: 'Taze çekilmiş çekirdeklerden.',
                price: new Decimal(110.00),
                category: ' Sıcak İçecekler',
                image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?q=80&w=500',
                translations: {
                    de: { name: 'Filterkaffee', description: 'Aus frisch gemahlenen Bohnen.' },
                    en: { name: 'Filter Coffee', description: 'From freshly ground beans.' }
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

        console.log('✅ Grandhotel ürünleri güncellendi (Coca Cola kaldırıldı, oda servisi seçenekleri eklendi).')

    } catch (error) {
        console.error('❌ Hata oluştu:', error)
    } finally {
        await prisma.$disconnect()
    }
}

seedGrandhotelData()
