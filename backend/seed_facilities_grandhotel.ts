import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://USER:PASSWORD@HOST/DB';
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

async function main() {
    console.log('Veritabanına bağlanılıyor...');

    // Grandhotel tenant'ını bul
    const tenant = await prisma.tenant.findUnique({
        where: { slug: 'grandhotel' }
    });

    if (!tenant) {
        console.error('Grandhotel tenant bulunamadı!');
        return;
    }

    // Grandhotel otelini bul
    const hotel = await prisma.hotel.findFirst({
        where: { tenantId: tenant.id }
    });

    if (!hotel) {
        console.error('Grandhotel oteli bulunamadı!');
        return;
    }

    console.log(`Tenant: ${tenant.name}, Hotel: ${hotel.name}`);

    // Mevcut faciliteleri temizle (isteğe bağlı, temizlemek iyi olabilir temiz bir başlangıç için)
    const deleteRes = await prisma.hotelFacility.deleteMany({
        where: { hotelId: hotel.id }
    });
    console.log(`${deleteRes.count} eski olanak silindi.`);

    const facilitiesData = [
        {
            name: 'Spa & Wellness Merkezi',
            description: 'Günün stresinden uzaklaşmak ve yenilenmek için ultra lüks spa merkezimiz hizmetinizdedir. Jakuzi, sauna, buhar odası ve profesyonel terapistler eşliğinde özel masaj seansları...',
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
            location: 'Kat -1',
            openingHours: '08:00 - 22:00',
            reservationInfo: 'Masaj terapileri için en az 4 saat önceden rezervasyon gereklidir.',
            contactInfo: 'Dahili: 5001',
            translations: {
                en: {
                    name: 'Spa & Wellness Center',
                    description: 'Step away from the stress of the day and rejuvenate in our ultra-luxury spa center. Jacuzzi, sauna, steam room, and private massage sessions with professional therapists...'
                },
                de: {
                    name: 'Spa & Wellnesszentrum',
                    description: 'Entfliehen Sie dem Alltagsstress und verjüngen Sie sich in unserem luxuriösen Spa-Center. Whirlpool, Sauna, Dampfbad und private Massagen mit professionellen Therapeuten...'
                },
                ru: {
                    name: 'Спа и оздоровительный центр',
                    description: 'Избавьтесь от дневного стресса и восстановите силы в нашем роскошном спа-центре. Джакузи, сауна, паровая баня и частные сеансы массажа с профессиональными терапевтами...'
                }
            }
        },
        {
            name: 'Fitness Center',
            description: 'Son teknoloji kardiyo ekipmanları, serbest ağırlıklar ve egzersiz makineleri ile donatılmış fitness merkezimizde formunuzu koruyun. Kişisel antrenör desteği mevcuttur.',
            image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
            location: 'Kat -1',
            openingHours: '06:00 - 23:00',
            reservationInfo: 'Rezervasyon gerekmemektedir.',
            contactInfo: 'Dahili: 5002',
            translations: {
                en: {
                    name: 'Fitness Center',
                    description: 'Keep in shape at our fitness center equipped with the latest cardio equipment, free weights, and exercise machines. Personal trainer support is available.'
                },
                de: {
                    name: 'Fitnesscenter',
                    description: 'Bleiben Sie in Form in unserem Fitnesscenter, das mit modernsten Kardiogeräten, Hanteln und Trainingsgeräten ausgestattet ist. Personal-Trainer-Unterstützung ist verfügbar.'
                },
                ru: {
                    name: 'Фитнес-центр',
                    description: 'Поддерживайте форму в нашем фитнес-центре, оснащенном новейшими кардиотренажерами, свободными весами и тренажерами. Доступна поддержка личного тренера.'
                }
            }
        },
        {
            name: 'Açık & Kapalı Yüzme Havuzu',
            description: 'Yaz aylarında açık, kış aylarında ise ısıtmalı kapalı yüzme havuzumuzun keyfini çıkarın. Havuz kenarında dinlenme alanları ve vitamin bar bulunmaktadır.',
            image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
            location: 'Zemin Kat',
            openingHours: '07:00 - 21:00',
            reservationInfo: 'Otel misafirleri için ücretsizdir, rezervasyon gerekmez.',
            contactInfo: 'Dahili: 5003',
            translations: {
                en: {
                    name: 'Indoor & Outdoor Swimming Pool',
                    description: 'Enjoy our outdoor pool in the summer and heated indoor pool in the winter. Relaxation areas and a vitamin bar are available poolside.'
                },
                de: {
                    name: 'Innen- & Außenpool',
                    description: 'Genießen Sie unseren Außenpool im Sommer und den beheizten Innenpool im Winter. Ruhebereiche und eine Vitaminbar am Pool sind vorhanden.'
                },
                ru: {
                    name: 'Крытый и открытый бассейн',
                    description: 'Наслаждайтесь нашим открытым бассейном летом и подогреваемым крытым бассейном зимой. Зоны отдыха и витаминный бар доступны у бассейна.'
                }
            }
        },
        {
            name: 'Panoramik Restoran',
            description: 'Dünya mutfaklarından en seçkin lezzetler, ödüllü şeflerimiz tarafından hazırlanarak şehrin eşsiz panoramik manzarası eşliğinde sunulmaktadır.',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
            location: 'Teras Katı',
            openingHours: '19:00 - 23:30',
            reservationInfo: 'Akşam yemeği için önceden rezervasyon yaptırmanız önerilir.',
            contactInfo: 'Dahili: 5005',
            translations: {
                en: {
                    name: 'Panoramic Restaurant',
                    description: 'The most exquisite flavors from world cuisines, prepared by our award-winning chefs, are served accompanied by a unique panoramic view of the city.'
                },
                de: {
                    name: 'Panoramarestaurant',
                    description: 'Erlesenste Aromen der Weltküche, zubereitet von unseren preisgekrönten Köchen, serviert mit einem einzigartigen Panoramablick auf die Stadt.'
                },
                ru: {
                    name: 'Панорамный ресторан',
                    description: 'Самые изысканные вкусы мировой кухни, приготовленные нашими отмеченными наградами шеф-поварами, подаются с уникальным панорамным видом на город.'
                }
            }
        },
        {
            name: 'Grand Lobby Bar',
            description: 'Günün yorgunluğunu atmak için mükemmel bir atmosfer. Özel kokteyller, zengin şarap menüsü, premium viskiler ve hafif atıştırmalıklar sunulmaktadır.',
            image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80',
            location: 'Lobi',
            openingHours: '10:00 - 02:00',
            reservationInfo: '',
            contactInfo: 'Dahili: 5006',
            translations: {
                en: {
                    name: 'Grand Lobby Bar',
                    description: 'The perfect atmosphere to unwind. Offering signature cocktails, an extensive wine list, premium whiskeys, and light snacks.'
                },
                de: {
                    name: 'Grand Lobby Bar',
                    description: 'Die perfekte Atmosphäre zum Entspannen. Mit speziellen Cocktails, einer umfangreichen Weinkarte, erstklassigen Whiskys und leichten Snacks.'
                },
                ru: {
                    name: 'Гранд-лобби бар',
                    description: 'Идеальная атмосфера для отдыха. Предлагаются фирменные коктейли, обширная винная карта, премиальные виски и легкие закуски.'
                }
            }
        },
        {
            name: 'Konferans ve Toplantı Salonu',
            description: 'Modern iş toplantılarınız, seminerleriniz veya özel davetleriniz için tasarlanmış yüksek teknoloji donanımlı ve modüler toplantı odaları.',
            image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1325&q=80',
            location: 'Kat 1',
            openingHours: '08:00 - 18:00',
            reservationInfo: 'Talepleriniz için lütfen etkinlik departmanımız ile iletişime geçin.',
            contactInfo: 'Dahili: 5008',
            translations: {
                en: {
                    name: 'Conference & Meeting Rooms',
                    description: 'High-tech equipped and modular meeting rooms designed for modern business meetings, seminars, or private events.'
                },
                de: {
                    name: 'Konferenz- & Tagungsräume',
                    description: 'Hochtechnologisch ausgestattete und modulare Tagungsräume für moderne Geschäftstreffen, Seminare oder private Veranstaltungen.'
                },
                ru: {
                    name: 'Конференц-залы',
                    description: 'Высокотехнологичные и модульные конференц-залы, предназначенные для современных деловых встреч, семинаров или частных мероприятий.'
                }
            }
        },
        {
            name: 'Kids Club',
            description: 'Uzman eğitmenlerimiz gözetiminde, çocuklarınızın eğitici aktiviteler ve oyunlarla eğlenceli vakit geçirebilecekleri güvenli çocuk kulübü.',
            image: 'https://images.unsplash.com/photo-1545625076-1e64560a6237?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
            location: 'Kat 2',
            openingHours: '09:00 - 18:00',
            reservationInfo: '3-12 yaş arası çocuklar için uygundur.',
            contactInfo: 'Dahili: 5010',
            translations: {
                en: {
                    name: 'Kids Club',
                    description: 'A safe children\'s club where your children can spend a fun time with educational activities and games under the supervision of our expert trainers.'
                },
                de: {
                    name: 'Kinderclub',
                    description: 'Ein sicherer Kinderclub, in dem Ihre Kinder unter der Aufsicht unserer erfahrenen Trainer mit lehrreichen Aktivitäten und Spielen eine unterhaltsame Zeit verbringen können.'
                },
                ru: {
                    name: 'Детский клуб',
                    description: 'Безопасный детский клуб, где ваши дети могут весело провести время за развивающими занятиями и играми под присмотром опытных инструкторов.'
                }
            }
        },
        {
            name: 'Güzellik ve Kuaför Salonu',
            description: 'Profesyonel stilistlerimiz ve güzellik uzmanlarımız tarafından sunulan birinci sınıf saç tasarımı, manikür, pedikür ve cilt bakım hizmetleri.',
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80',
            location: 'Kat -1',
            openingHours: '09:00 - 20:00',
            reservationInfo: 'Randevu alınması tavsiye edilir.',
            contactInfo: 'Dahili: 5012',
            translations: {
                en: {
                    name: 'Beauty & Hair Salon',
                    description: 'First-class hair styling, manicure, pedicure, and skin care services provided by our professional stylists and beauty experts.'
                },
                de: {
                    name: 'Schönheits- & Friseursalon',
                    description: 'Erstklassige Haarstyling-, Maniküre-, Pediküre- und Hautpflegedienste, die von unseren professionellen Stylisten und Schönheitsberatern angeboten werden.'
                },
                ru: {
                    name: 'Салон красоты',
                    description: 'Первоклассные услуги по уходу за волосами, маникюру, педикюру и уходу за кожей от наших профессиональных стилистов и косметологов.'
                }
            }
        }
    ];

    for (const facility of facilitiesData) {
        await prisma.hotelFacility.create({
            data: {
                name: facility.name,
                description: facility.description,
                image: facility.image,
                location: facility.location,
                openingHours: facility.openingHours,
                reservationInfo: facility.reservationInfo,
                contactInfo: facility.contactInfo,
                translations: facility.translations,
                isActive: true,
                tenantId: tenant.id,
                hotelId: hotel.id
            }
        });
        console.log(`Olanak eklendi: ${facility.name}`);
    }

    console.log('Tüm olanaklar başarıyla eklendi!');
}

main()
    .catch((e) => {
        console.error('Hata:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
