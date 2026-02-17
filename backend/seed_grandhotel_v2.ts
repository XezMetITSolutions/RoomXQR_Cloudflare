import { PrismaClient, RoomType, UserRole, OrderStatus, RequestType, RequestPriority, RequestStatus, NotificationType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import bcrypt from 'bcryptjs'

// Use the provided database URL
const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function main() {
    console.log('🚀 Seeding Grand Hotel with realistic data...');

    try {
        // 1. Create Tenant
        const tenant = await prisma.tenant.upsert({
            where: { slug: 'grandhotel' },
            update: {
                name: 'Grand Hotel & Spa Resort',
                isActive: true,
                settings: {
                    theme: {
                        primaryColor: '#1a1a1a',
                        secondaryColor: '#d4af37',
                        accentColor: '#c5a028'
                    },
                    currency: 'TRY',
                    languages: ['tr', 'en', 'de', 'ru']
                }
            },
            create: {
                name: 'Grand Hotel & Spa Resort',
                slug: 'grandhotel',
                domain: 'grandhotel.roomxqr.com',
                isActive: true,
                settings: {
                    theme: {
                        primaryColor: '#1a1a1a',
                        secondaryColor: '#d4af37',
                        accentColor: '#c5a028'
                    },
                    currency: 'TRY',
                    languages: ['tr', 'en', 'de', 'ru']
                }
            }
        });

        console.log(`✅ Tenant created/updated: ${tenant.slug}`);

        // 2. Create Hotel
        const hotel = await prisma.hotel.upsert({
            where: { id: 'grand-hotel-primary' },
            update: {
                name: 'Grand Hotel & Spa Resort Istanbul',
                address: 'Cıragan Caddesi No:12, Besiktas, Istanbul',
                phone: '+90 212 333 4455',
                email: 'info@grandhotelistanbul.com',
                website: 'https://grandhotelistanbul.com',
                isActive: true,
            },
            create: {
                id: 'grand-hotel-primary',
                name: 'Grand Hotel & Spa Resort Istanbul',
                address: 'Cıragan Caddesi No:12, Besiktas, Istanbul',
                phone: '+90 212 333 4455',
                email: 'info@grandhotelistanbul.com',
                website: 'https://grandhotelistanbul.com',
                isActive: true,
                tenantId: tenant.id
            }
        });

        console.log(`✅ Hotel created/updated: ${hotel.name}`);

        // 3. Create Users (Staff)
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const roles: UserRole[] = ['ADMIN', 'MANAGER', 'RECEPTION', 'KITCHEN', 'STAFF'];

        for (const role of roles) {
            const email = `${role.toLowerCase()}@grandhotel.com`;
            await prisma.user.upsert({
                where: { email },
                update: { role, isActive: true },
                create: {
                    email,
                    password: hashedPassword,
                    firstName: 'Grand',
                    lastName: role.charAt(0) + role.slice(1).toLowerCase(),
                    role,
                    tenantId: tenant.id,
                    hotelId: hotel.id,
                    isActive: true
                }
            });
            console.log(`👤 User created: ${email}`);
        }

        // 4. Create Rooms
        console.log('🏨 Creating rooms...');
        const roomConfigs = [
            { floor: 1, count: 10, type: RoomType.SINGLE, capacity: 1 },
            { floor: 2, count: 12, type: RoomType.DOUBLE, capacity: 2 },
            { floor: 3, count: 12, type: RoomType.TWIN, capacity: 2 },
            { floor: 4, count: 8, type: RoomType.DOUBLE, capacity: 2 },
            { floor: 5, count: 5, type: RoomType.SUITE, capacity: 4 },
            { floor: 5, count: 3, type: RoomType.FAMILY, capacity: 6 }
        ];

        let createdRoomIds: string[] = [];

        for (const config of roomConfigs) {
            for (let i = 1; i <= config.count; i++) {
                const roomNumber = `${config.floor}${i.toString().padStart(2, '0')}`;
                const room = await prisma.room.upsert({
                    where: { qrCode: `grandhotel-${roomNumber}` },
                    update: {
                        type: config.type,
                        capacity: config.capacity,
                        floor: config.floor,
                        isActive: true
                    },
                    create: {
                        number: roomNumber,
                        floor: config.floor,
                        type: config.type,
                        capacity: config.capacity,
                        qrCode: `grandhotel-${roomNumber}`,
                        tenantId: tenant.id,
                        hotelId: hotel.id,
                        isActive: true
                    }
                });
                createdRoomIds.push(room.id);
            }
        }
        console.log(`✅ ${createdRoomIds.length} rooms created/updated.`);

        // 5. Create Menu Items
        console.log('🍽️ Creating menu items...');
        const menuItems = [
            // Breakfast
            { name: 'Köy Kahvaltısı', category: 'Kahvaltı', price: 340, description: 'Organik ürünlerle donatılmış zengin serpme kahvaltı.', image: 'https://images.unsplash.com/photo-1541519047171-8933b93f18e8' },
            { name: 'Fransız Omleti', category: 'Kahvaltı', price: 180, description: 'Taze otlar ve mantarlı enfes omlet.', image: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d4ec' },

            // Main Courses
            { name: 'Kuzu Pirzola', category: 'Ana Yemek', price: 650, description: 'Kekik soslu kuzu pirzola, köz sebzeler eşliğinde.', image: 'https://images.unsplash.com/photo-1603073163308-9654c3fb70b5' },
            { name: 'Deniz Mahsülleri Risotto', category: 'Ana Yemek', price: 520, description: 'Saffronlu ve deniz mahsüllü risotto.', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371' },
            { name: 'Izgara Somon', category: 'Ana Yemek', price: 480, description: 'Kinoa salatası ve kuşkonmaz ile.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288' },
            { name: 'Adana Kebap', category: 'Ana Yemek', price: 420, description: 'Zırh kıyması, sumaklı soğan ve lavaş ile.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1' },
            { name: 'Etli Ekmek', category: 'Ana Yemek', price: 350, description: 'Konya usulü ince hamur üzerinde zırh kıyması.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },

            // Snacks
            { name: 'Nachos Supreme', category: 'Atıştırmalık', price: 290, description: 'Guacamole, ekşi krema ve jalapeño ile.', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d' },
            { name: 'Trüflü Patates Kızartması', category: 'Atıştırmalık', price: 150, description: 'Permesan ve trüf yağı ile.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877' },

            // Desserts
            { name: 'Antep Fıstıklı Künefe', category: 'Tatlı', price: 220, description: 'Sıcak şerbetli, taze peynirli kadayıf.', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d' },
            { name: 'San Sebastian Cheesecake', category: 'Tatlı', price: 195, description: 'Akışkan kıvamlı, yanık dış yüzeyli.', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad' },

            // Drinks
            { name: 'Taze Sıkılmış Detoks', category: 'İçecek', price: 120, description: 'Elma, kereviz sapı, zencefil.', image: 'https://images.unsplash.com/photo-1610970882799-a4c6f04fbe1f' },
            { name: 'Kızılcık Şerbeti', category: 'İçecek', price: 85, description: 'Geleneksel saray reçetesi ile.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
            { name: 'Artisan Espresso', category: 'Sıcak İçecek', price: 95, description: 'Seçkin çekirdeklerden taze demlenmiş.', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04' }
        ];

        let createdMenuItemIds: string[] = [];
        for (const item of menuItems) {
            const menuItem = await prisma.menuItem.create({
                data: {
                    name: item.name,
                    category: item.category,
                    price: new Decimal(item.price),
                    description: item.description,
                    image: item.image,
                    tenantId: tenant.id,
                    hotelId: hotel.id,
                    isAvailable: true,
                    isActive: true
                }
            });
            createdMenuItemIds.push(menuItem.id);
        }
        console.log(`✅ ${createdMenuItemIds.length} menu items created.`);

        // 6. Create Guests & Orders (Real-time Feel)
        console.log('📝 Creating sample guests and activity...');
        const guestNames = [
            { first: 'Emre', last: 'Can' },
            { first: 'Merve', last: 'Aydın' },
            { first: 'John', last: 'Doe' },
            { first: 'Helga', last: 'Schmidt' },
            { first: 'Dmitry', last: 'Ivanov' }
        ];

        for (let i = 0; i < guestNames.length; i++) {
            const roomId = createdRoomIds[i]; // Put guests in the first 5 rooms
            const name = guestNames[i];

            const guest = await prisma.guest.create({
                data: {
                    firstName: name.first,
                    lastName: name.last,
                    language: i < 2 ? 'tr' : 'en',
                    checkIn: new Date(),
                    isActive: true,
                    tenantId: tenant.id,
                    hotelId: hotel.id,
                    roomId: roomId,
                    accessToken: Math.random().toString(36).substring(7)
                }
            });

            // Mark room as occupied
            await prisma.room.update({
                where: { id: roomId },
                data: { isOccupied: true }
            });

            // Create an order for the guest
            const randomMenuItem = createdMenuItemIds[Math.floor(Math.random() * createdMenuItemIds.length)];
            const menuItem = menuItems.find(m => m.name === menuItems[createdMenuItemIds.indexOf(randomMenuItem)]?.name); // This is just for price

            await prisma.order.create({
                data: {
                    orderNumber: `ORD-${Math.random().toString(10).substring(2, 8)}`,
                    status: OrderStatus.CONFIRMED,
                    totalAmount: new Decimal(250.00), // Simple value for seed
                    paymentMethod: 'room_charge',
                    tenantId: tenant.id,
                    hotelId: hotel.id,
                    roomId: roomId,
                    guestId: guest.id,
                    items: {
                        create: {
                            menuItemId: randomMenuItem,
                            quantity: 1,
                            price: new Decimal(250.00)
                        }
                    }
                }
            });

            // Create a request
            await prisma.guestRequest.create({
                data: {
                    type: RequestType.HOUSEKEEPING,
                    priority: RequestPriority.MEDIUM,
                    status: RequestStatus.PENDING,
                    description: 'Ekstra yastık rica ediyorum.',
                    tenantId: tenant.id,
                    hotelId: hotel.id,
                    roomId: roomId
                }
            });
        }

        console.log('✅ Sample activity created.');
        console.log('✨ Seeding successfully completed for Grand Hotel!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
