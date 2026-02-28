require('dotenv').config();
const { Client } = require('pg');

async function seed() {
    const connectionString = process.env.DATABASE_URL + '?sslmode=require';
    const client = new Client({ connectionString });

    try {
        await client.connect();

        const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = $1", ['grandhotel']);
        if (tenantRes.rows.length === 0) throw new Error('Tenant grandhotel not found');
        const tenantId = tenantRes.rows[0].id;

        const hotelRes = await client.query("SELECT id FROM hotels WHERE \"tenantId\" = $1 limit 1", [tenantId]);
        if (hotelRes.rows.length === 0) throw new Error('Hotel not found');
        const hotelId = hotelRes.rows[0].id;

        const now = new Date();
        const startDate = now.toISOString().split('T')[0];

        const endDateObj = new Date(now);
        endDateObj.setMonth(endDateObj.getMonth() + 1);
        const endDate = endDateObj.toISOString().split('T')[0];

        const { v4: uuidv4 } = require('uuid');

        const announcements = [
            {
                type: 'SYSTEM',
                title: 'Akşam Yemeği Büfesine Davetlisiniz!',
                message: 'Açık büfe akşam yemeğimiz 19:00 - 21:30 saatleri arasında restoranda servis edilecektir.',
                tenantId,
                hotelId,
                metadata: {
                    announcementType: 'promotion',
                    category: 'hotel',
                    isActive: true,
                    startDate,
                    endDate,
                    icon: 'utensils',
                    translations: {
                        tr: {
                            title: 'Akşam Yemeği Büfesine Davetlisiniz!',
                            content: 'Açık büfe akşam yemeğimiz 19:00 - 21:30 saatleri arasında restoranda servis edilecektir.'
                        },
                        en: {
                            title: "You're Invited to the Dinner Buffet!",
                            content: 'Our dinner buffet will be served at the restaurant between 19:00 - 21:30.'
                        },
                        de: {
                            title: 'Wir laden Sie zum Abendbuffet ein!',
                            content: 'Unser Abendbuffet wird zwischen 19:00 und 21:30 Uhr im Restaurant serviert.'
                        },
                        ru: {
                            title: 'Приглашаем на ужин шведский стол!',
                            content: 'Наш ужин шведский стол будет сервирован в ресторане с 19:00 до 21:30.'
                        }
                    }
                }
            },
            {
                type: 'SYSTEM',
                title: 'Spa Merkezinde %20 İndirim!',
                message: 'Tüm misafirlerimize özel bu hafta sonu boyunca Spa ve Masaj hizmetlerimizde %20 indirim uygulanmaktadır.',
                tenantId,
                hotelId,
                metadata: {
                    announcementType: 'advertisement',
                    category: 'promotion',
                    isActive: true,
                    startDate,
                    endDate,
                    icon: 'star',
                    linkUrl: '/concierge',
                    linkText: 'Randevu Al',
                    translations: {
                        tr: {
                            title: 'Spa Merkezinde %20 İndirim!',
                            content: 'Tüm misafirlerimize özel bu hafta sonu boyunca Spa ve Masaj hizmetlerimizde %20 indirim uygulanmaktadır.',
                            linkText: 'Randevu Al'
                        },
                        en: {
                            title: '20% Discount at the Spa Center!',
                            content: 'A special 20% discount on Spa and Massage services is available for all our guests this weekend.',
                            linkText: 'Book an Appointment'
                        },
                        de: {
                            title: '20% Rabatt im Spa-Zentrum!',
                            content: 'An diesem Wochenende profitieren alle unsere Gäste von 20 % Rabatt auf Spa- und Massagedienstleistungen.',
                            linkText: 'Termin Buchen'
                        },
                        ru: {
                            title: 'Скидка 20% в Спа-центре!',
                            content: 'В эти выходные для всех наших гостей действует скидка 20% на услуги Спа и массажа.',
                            linkText: 'Записаться'
                        }
                    }
                }
            },
            {
                type: 'SYSTEM',
                title: 'Hoş Geldiniz İkramı: Ücretsiz Kahve',
                message: 'Lobi bardaki Hoş Geldiniz İkramımızdan yararlanmak isterseniz, oda numaranızı söylemeniz yeterlidir (Her gün 15:00 - 17:00 arası).',
                tenantId,
                hotelId,
                metadata: {
                    announcementType: 'promotion',
                    category: 'hotel',
                    isActive: true,
                    startDate,
                    endDate,
                    icon: 'coffee',
                    translations: {
                        tr: {
                            title: 'Hoş Geldiniz İkramı: Ücretsiz Kahve',
                            content: 'Lobi bardaki Hoş Geldiniz İkramımızdan yararlanmak isterseniz, oda numaranızı söylemeniz yeterlidir (Her gün 15:00 - 17:00 arası).'
                        },
                        en: {
                            title: 'Welcome Treat: Free Coffee',
                            content: 'If you would like to enjoy our Welcome Treat at the lobby bar, just mention your room number (Every day between 15:00 - 17:00).'
                        },
                        de: {
                            title: 'Willkommensgeschenk: Kostenloser Kaffee',
                            content: 'Wenn Sie unser Willkommensgeschenk in der Lobbybar genießen möchten, nennen Sie einfach Ihre Zimmernummer (Täglich von 15:00 bis 17:00 Uhr).'
                        },
                        ru: {
                            title: 'Приветственный комплимент: Бесплатный кофе',
                            content: 'Если вы хотите воспользоваться нашим Приветственным Комплиментом в лобби-баре, просто назовите номер комнаты (Ежедневно с 15:00 до 17:00).'
                        }
                    }
                }
            }
        ];

        for (let ann of announcements) {
            await client.query(
                "INSERT INTO notifications (id, type, title, message, \"isRead\", metadata, \"tenantId\", \"hotelId\", \"createdAt\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())",
                [uuidv4(), ann.type, ann.title, ann.message, false, JSON.stringify(ann.metadata), ann.tenantId, ann.hotelId]
            );
            console.log('Created announcement:', ann.title);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

seed();
