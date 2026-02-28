require('dotenv').config();
const jwt = require('jsonwebtoken');

// Fetch with backend API
async function seedAPI() {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

    // We don't have user id, but any string might work if it's not strictly validated for roles,
    // or let's create a token with superadmin role
    const payload = {
        userId: 'cuid-or-uuid',
        email: 'admin@grandhotel.com',
        role: 'ADMIN',
        tenantId: 'grandhotel',
        tenantSlug: 'grandhotel',
        hotelId: 'any',
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

    const REMOTE_API_URL = 'http://localhost:3001/api/announcements';

    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const endDateObj = new Date(now);
    endDateObj.setMonth(endDateObj.getMonth() + 1);
    const endDate = endDateObj.toISOString().split('T')[0];

    const announcements = [
        {
            title: 'Yaza Merhaba: Canlı Müzik Gecesi!',
            content: 'Bu cuma akşamı havuz başında gerçekleşecek olan Canlı Müzik gecemize tüm misafirlerimiz davetlidir. (20:30 - Yemekli)',
            type: 'promotion',
            category: 'hotel',
            isActive: true,
            startDate,
            endDate,
            icon: 'sparkles',
            translations: {
                tr: {
                    title: 'Yaza Merhaba: Canlı Müzik Gecesi!',
                    content: 'Bu cuma akşamı havuz başında gerçekleşecek olan Canlı Müzik gecemize tüm misafirlerimiz davetlidir. (20:30 - Yemekli)'
                },
                en: {
                    title: 'Welcome to Summer: Live Music Night!',
                    content: 'All our guests are invited to our Live Music night by the pool this Friday evening. (20:30 - with dinner)'
                },
                de: {
                    title: 'Willkommen im Sommer: Live-Musik-Nacht!',
                    content: 'Alle unsere Gäste sind diesen Freitagabend zu unserer Live-Musik-Nacht am Pool eingeladen. (20:30 - mit Abendessen)'
                }
            }
        },
        {
            title: 'Oda Temizliği ve Çevre Duyarlılığı',
            content: 'Doğayı koruyalım! Havlularınızı sadece yıkanmasını istiyorsanız yere bırakınız. Oda servisimiz her gün 09:00 - 16:00 arası yapılmaktadır.',
            type: 'info',
            category: 'general',
            isActive: true,
            startDate,
            endDate,
            icon: 'leaf',
            translations: {
                tr: {
                    title: 'Oda Temizliği ve Çevre Duyarlılığı',
                    content: 'Doğayı koruyalım! Havlularınızı sadece yıkanmasını istiyorsanız yere bırakınız. Oda servisimiz her gün 09:00 - 16:00 arası yapılmaktadır.'
                },
                en: {
                    title: 'Room Cleaning and Environmental Awareness',
                    content: "Let's protect nature! Please leave your towels on the floor only if you want them washed. Room service is provided daily from 09:00 to 16:00."
                },
                de: {
                    title: 'Zimmerreinigung und Umweltbewusstsein',
                    content: 'Lassen Sie uns die Natur schützen! Bitte werfen Sie Ihre Handtücher nur auf den Boden, wenn sie gewaschen werden sollen. Die Zimmerreinigung erfolgt täglich von 09:00 bis 16:00.'
                }
            }
        },
        {
            title: 'Şefin Özel Menüsü: Deniz Mahsulleri',
            content: 'Cuma ve Cumartesi günlerine özel hazırlanan, Ege ve Akdeniz esintilerini hissedeceğiniz Deniz Mahsulleri menümüzü denemeyi unutmayın!',
            type: 'advertisement',
            category: 'menu',
            isActive: true,
            startDate,
            endDate,
            icon: 'utensils',
            translations: {
                tr: {
                    title: 'Şefin Özel Menüsü: Deniz Mahsulleri',
                    content: 'Cuma ve Cumartesi günlerine özel hazırlanan, Ege ve Akdeniz esintilerini hissedeceğiniz Deniz Mahsulleri menümüzü denemeyi unutmayın!'
                },
                en: {
                    title: "Chef's Special Menu: Seafood",
                    content: 'Do not forget to try our Seafood menu specially prepared for Friday and Saturday, where you will feel the Aegean and Mediterranean breeze!'
                },
                de: {
                    title: 'Spezialmenü des Küchenchefs: Meeresfrüchte',
                    content: 'Vergessen Sie nicht, unser speziell für Freitag und Samstag zubereitetes Meeresfrüchte-Menü zu probieren, bei dem Sie eine ägäische und mediterrane Brise spüren werden!'
                }
            }
        },
        {
            title: 'Fitness Merkezi Renovasyonu',
            content: 'Fitness merkezimizin bir bölümünde yenileme çalışmaları sebebiyle sabah saat 10:00 ve 12:00 arasında küçük gürültüler olabilir. Anlayışınız için teşekkür ederiz.',
            type: 'warning',
            category: 'hotel',
            isActive: true,
            startDate,
            endDate,
            icon: 'wrench',
            translations: {
                tr: {
                    title: 'Fitness Merkezi Renovasyonu',
                    content: 'Fitness merkezimizin bir bölümünde yenileme çalışmaları sebebiyle sabah saat 10:00 ve 12:00 arasında küçük gürültüler olabilir. Anlayışınız için teşekkür ederiz.'
                },
                en: {
                    title: 'Fitness Center Renovation',
                    content: 'There may be slight noise between 10:00 and 12:00 in the morning due to renovation work in a part of our fitness center. Thank you for your understanding.'
                },
                de: {
                    title: 'Renovierung des Fitnesscenters',
                    content: 'Aufgrund von Renovierungsarbeiten in einem Teil unseres Fitnesscenters kann es morgens zwischen 10:00 und 12:00 Uhr zu leichten Geräuschen kommen. Vielen Dank für Ihr Verständnis.'
                }
            }
        },
        {
            title: 'Havaalanı Transfer Rezervasyonu',
            content: 'Konforlu bir dönüş yolculuğu için uçuşunuzdan en az 24 saat önce resepsiyon veya mobil asistan üzerinden ücretsiz VIP araç veya ücretli taksi rezervasyonunuzu yapabilirsiniz.',
            type: 'info',
            category: 'general',
            isActive: true,
            startDate,
            endDate,
            icon: 'target',
            linkText: 'Transfer İste',
            linkUrl: '/concierge?tab=transfer',
            translations: {
                tr: {
                    title: 'Havaalanı Transfer Rezervasyonu',
                    content: 'Konforlu bir dönüş yolculuğu için uçuşunuzdan en az 24 saat önce resepsiyon veya mobil asistan üzerinden ücretsiz VIP araç veya ücretli taksi rezervasyonunuzu yapabilirsiniz.',
                    linkText: 'Transfer İste'
                },
                en: {
                    title: 'Airport Transfer Reservation',
                    content: 'For a comfortable return journey, you can book your free VIP car or paid taxi at least 24 hours before your flight via reception or the mobile assistant.',
                    linkText: 'Request Transfer'
                },
                de: {
                    title: 'Reservierung des Flughafentransfers',
                    content: 'Für eine komfortable Rückreise können Sie mindestens 24 Stunden vor Ihrem Flug über die Rezeption oder den mobilen Assistenten kostenfrei ein VIP-Fahrzeug oder kostenpflichtig ein Taxi buchen.',
                    linkText: 'Transfer anfragen'
                }
            }
        }
    ];

    for (let ann of announcements) {
        try {
            const res = await fetch(REMOTE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-tenant': 'grandhotel'
                },
                body: JSON.stringify(ann)
            });
            if (!res.ok) {
                throw new Error(`Failed: ${res.status} ${await res.text()}`);
            }
            console.log('Created!', ann.title);
        } catch (err) {
            console.error(err);
        }
    }
}

seedAPI();
