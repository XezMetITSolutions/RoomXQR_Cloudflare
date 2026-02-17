import { PrismaClient } from '@prisma/client'

const DATABASE_URL = "postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: DATABASE_URL,
        },
    },
});

async function fillAllRooms() {
    console.log('🏨 Tüm odalara müşteri ekleniyor...');

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' }
        });

        const hotel = await prisma.hotel.findFirst({
            where: { tenantId: tenant?.id }
        });

        if (!tenant || !hotel) {
            console.error('❌ Grandhotel bilgileri bulunamadı.');
            return;
        }

        // Tüm aktif odaları getir
        const rooms = await prisma.room.findMany({
            where: {
                hotelId: hotel.id,
                isActive: true
            }
        });

        console.log(`Bulunan oda sayısı: ${rooms.length}`);

        const firstNames = ['Ahmet', 'Mehmet', 'Can', 'Selin', 'Zeynep', 'Burak', 'Aslı', 'Murat', 'Deniz', 'Ece', 'Thomas', 'Elena', 'Hans', 'Sophie', 'Mikhail', 'Svetlana', 'Giuseppe', 'Maria', 'Jean', 'Chloe'];
        const lastNames = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Smith', 'Müller', 'Wagner', 'Dubois', 'Ivanov', 'Rossi', 'Garcia', 'Chen', 'Lee', 'Kim'];

        let addedCount = 0;

        for (const room of rooms) {
            // Önce odadaki mevcut aktif misafirleri temizle (isteğe bağlı ama karışıklığı önler)
            await prisma.guest.updateMany({
                where: { roomId: room.id, isActive: true },
                data: { isActive: false, checkOut: new Date() }
            });

            const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

            await prisma.guest.create({
                data: {
                    firstName: fName,
                    lastName: lName,
                    email: `${fName.toLowerCase()}.${lName.toLowerCase()}@example.com`,
                    language: Math.random() > 0.4 ? 'tr' : 'en',
                    checkIn: new Date(),
                    isActive: true,
                    tenantId: tenant.id,
                    hotelId: hotel.id,
                    roomId: room.id,
                    accessToken: Math.random().toString(36).substring(2, 12)
                }
            });

            // Odayı dolu olarak işaretle
            await prisma.room.update({
                where: { id: room.id },
                data: { isOccupied: true }
            });

            addedCount++;
            if (addedCount % 10 === 0) console.log(`${addedCount} oda doldu...`);
        }

        console.log(`✅ İşlem tamamlandı. ${addedCount} odanın tamamına müşteri girişi yapıldı.`);

    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fillAllRooms();
