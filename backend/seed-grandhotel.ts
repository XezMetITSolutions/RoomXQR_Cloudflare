import { PrismaClient, RoomType, NotificationType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

async function seedGrandhotelData() {
    try {
        console.log('🌱 Grandhotel için zenginleştirilmiş menü yükleniyor...')

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
        const tenantId = tenant.id

        // Eski ürünleri temizle
        await prisma.menuItem.deleteMany({ where: { tenantId: tenantId } })

        const menuItems = [
            // KAHVALTI
            {
                name: 'Geleneksel Türk Kahvaltısı',
                description: 'Peynir çeşitleri, zeytin, bal-kaymak, reçel, domates, salatalık, haşlanmış yumurta ve sınırsız çay.',
                price: new Decimal(450.00),
                category: 'Kahvaltı',
                image: 'https://images.unsplash.com/photo-1541519047171-8933b93f18e8?q=80&w=500',
                translations: {
                    de: { name: 'Traditionelles Türkisches Frühstück', description: 'Käsesorten, Oliven, Honig-Sahne, Marmelade, Tomaten, Gurken, gekochtes Ei und unbegrenzter Tee.' },
                    en: { name: 'Traditional Turkish Breakfast', description: 'Cheese varieties, olives, honey-cream, jam, tomatoes, cucumbers, boiled egg and unlimited tea.' }
                }
            },
            {
                name: 'Yaban Mersinli Pankek',
                description: 'Akçaağaç şurubu ve taze meyveler ile.',
                price: new Decimal(280.00),
                category: 'Kahvaltı',
                image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=500',
                translations: {
                    de: { name: 'Heidelbeer-Pfannkuchen', description: 'Mit Ahornsirup und frischen Früchten.' },
                    en: { name: 'Blueberry Pancakes', description: 'With maple syrup and fresh fruits.' }
                }
            },
            {
                name: 'Avokadolu Poşe Yumurta',
                description: 'Ekşi mayalı ekmek üzerinde, avokado ezmesi ve hafif baharatlı sos ile.',
                price: new Decimal(320.00),
                category: 'Kahvaltı',
                image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500',
                translations: {
                    de: { name: 'Avocado-Pochiertes Ei', description: 'Auf Sauerteigbrot mit Avocadopüree und leicht scharfer Sauce.' },
                    en: { name: 'Avocado Poached Egg', description: 'On sourdough bread with mashed avocado and slightly spicy sauce.' }
                }
            },

            // ANA YEMEKLER & ATIŞTIRMALIKLAR
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
                name: 'Mercimek Çorbası',
                description: 'Klasik süzme mercimek çorbası, kıtır ekmek ve limon ile.',
                price: new Decimal(150.00),
                category: 'Çorbalar',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500',
                translations: {
                    de: { name: 'Linsensuppe', description: 'Klassische Linsensuppe mit Croutons und Zitrone.' },
                    en: { name: 'Lentil Soup', description: 'Classic lentil soup with croutons and lemon.' }
                }
            },

            // ÇOCUK MENÜSÜ
            {
                name: 'Parmak Tavuk (Chicken Fingers)',
                description: 'Çıtır tavuk dilimleri ve patates kızartması.',
                price: new Decimal(240.00),
                category: 'Çocuk Menüsü',
                image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=500',
                translations: {
                    de: { name: 'Hähnchen-Finger (Chicken Fingers)', description: 'Knusprige Hähnchenstreifen und Pommes Frites.' },
                    en: { name: 'Chicken Fingers', description: 'Crispy chicken strips and French fries.' }
                }
            },

            // TATLILAR
            {
                name: 'Çikolatalı Sufle',
                description: 'Sıcak çikolatalı sufle, vanilyalı dondurma ile.',
                price: new Decimal(190.00),
                category: 'Tatlılar',
                image: 'https://images.unsplash.com/photo-1624353365286-3f8d62ffff51?q=80&w=500',
                translations: {
                    de: { name: 'Schokoladensoufflé', description: 'Heißes Schokoladensoufflé mit Vanilleeis.' },
                    en: { name: 'Chocolate Soufflé', description: 'Hot chocolate soufflé with vanilla ice cream.' }
                }
            },
            {
                name: 'Tiramisu',
                description: 'Orijinal İtalyan tarifiyle.',
                price: new Decimal(240.00),
                category: 'Tatlılar',
                image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=500',
                translations: {
                    de: { name: 'Tiramisu', description: 'Nach original italienischem Rezept.' },
                    en: { name: 'Tiramisu', description: 'With original Italian recipe.' }
                }
            },

            // İÇECEKLER
            {
                name: 'Ev Yapımı Buzlu Çay (Şeftali)',
                description: 'Taze şeftali ve nane aromalı.',
                price: new Decimal(95.00),
                category: 'İçecekler',
                image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?q=80&w=500',
                translations: {
                    de: { name: 'Hausgemachter Eistee (Pfirsich)', description: 'Mit frischem Pfirsich- und Minzaroma.' },
                    en: { name: 'Homemade Ice Tea (Peach)', description: 'With fresh peach and mint flavor.' }
                }
            },
            {
                name: 'Cappuccino',
                description: 'Bol süt köpüklü klasik İtalyan kahvesi.',
                price: new Decimal(120.00),
                category: 'Sıcak İçecekler',
                image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=500',
                translations: {
                    de: { name: 'Cappuccino', description: 'Klassischer italienischer Kaffee mit viel Milchschaum.' },
                    en: { name: 'Cappuccino', description: 'Classic Italian coffee with plenty of milk foam.' }
                }
            },
            {
                name: 'Yeşil Detoks Suyu',
                description: 'Elma, salatalık, ıspanak ve taze zencefil.',
                price: new Decimal(140.00),
                category: 'İçecekler',
                image: 'https://images.unsplash.com/photo-1610970882799-a4c6f04fbe1f?q=80&w=500',
                translations: {
                    de: { name: 'Grüner Detox-Saft', description: 'Apfel, Gurke, Spinat und frischer Ingwer.' },
                    en: { name: 'Green Detox Juice', description: 'Apple, cucumber, spinach and fresh ginger.' }
                }
            }
        ]

        for (const item of menuItems) {
            await prisma.menuItem.create({
                data: {
                    ...item,
                    tenantId: tenantId,
                    hotelId: hotelId,
                    translations: item.translations as any
                }
            })
        }

        console.log('✅ Menü zenginleştirildi ve tüm görseller güncellendi.')

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

seedGrandhotelData()
