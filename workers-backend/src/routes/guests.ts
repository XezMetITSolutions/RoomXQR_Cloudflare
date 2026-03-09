import { Hono } from 'hono';
import { getPrisma } from '../db';
import { tenantMiddleware, authMiddleware } from '../middleware/auth';
import { Bindings, Variables } from '../types';

const guests = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get all guests
guests.get('/', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        const guestsList = await prisma.guest.findMany({
            where: { tenantId },
            include: { room: true },
            orderBy: { checkIn: 'desc' },
        });

        return c.json(guestsList);
    } catch (error) {
        console.error('Get guests error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Check-in guest
guests.post('/checkin', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { roomId, firstName, lastName, email, phone, language, checkIn, checkOut } = await c.req.json();

        if (!tenantId) return c.json({ message: 'Tenant ID required' }, 400);
        if (!roomId || !firstName || !lastName) {
            return c.json({ message: 'roomId, firstName, lastName required' }, 400);
        }

        // Odayı bul
        const room = await prisma.room.findFirst({
            where: {
                tenantId,
                OR: [
                    { id: roomId },
                    { number: roomId },
                    { qrCode: roomId },
                ],
            },
        });

        if (!room) return c.json({ message: 'Room not found' }, 404);

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        // Mevcut aktif misafiri deaktive et
        await prisma.guest.updateMany({
            where: { roomId: room.id, isActive: true },
            data: { isActive: false, checkOut: new Date() },
        });

        // Access token oluştur
        const accessToken = crypto.randomUUID();

        // Yeni misafir oluştur
        const guest = await prisma.guest.create({
            data: {
                firstName,
                lastName,
                email: email || null,
                phone: phone || null,
                language: language || 'tr',
                accessToken,
                checkIn: checkIn ? new Date(checkIn) : new Date(),
                checkOut: checkOut ? new Date(checkOut) : null,
                isActive: true,
                tenantId,
                hotelId: hotel.id,
                roomId: room.id,
            },
        });

        // Odayı occupied yap
        await prisma.room.update({
            where: { id: room.id },
            data: { isOccupied: true },
        });

        return c.json({ success: true, guest, accessToken });
    } catch (error) {
        console.error('Check-in error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Check-out guest
guests.post('/checkout', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { roomId } = await c.req.json();

        const room = await prisma.room.findFirst({
            where: {
                tenantId,
                OR: [
                    { id: roomId },
                    { number: roomId },
                    { qrCode: roomId },
                ],
            },
        });

        if (!room) return c.json({ message: 'Room not found' }, 404);

        // Aktif misafiri checkout et
        await prisma.guest.updateMany({
            where: { roomId: room.id, isActive: true },
            data: { isActive: false, checkOut: new Date(), accessToken: null },
        });

        // Odayı vacant yap
        await prisma.room.update({
            where: { id: room.id },
            data: { isOccupied: false },
        });

        return c.json({ success: true, message: 'Checkout successful' });
    } catch (error) {
        console.error('Checkout error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Update guest
guests.patch('/update', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { roomId, firstName, lastName, checkIn, checkOut } = await c.req.json();

        const room = await prisma.room.findFirst({
            where: {
                tenantId,
                OR: [{ id: roomId }, { number: roomId }, { qrCode: roomId }],
            },
        });

        if (!room) return c.json({ message: 'Room not found' }, 404);

        const updateData: any = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (checkIn !== undefined) updateData.checkIn = new Date(checkIn);
        if (checkOut !== undefined) updateData.checkOut = new Date(checkOut);

        const result = await prisma.guest.updateMany({
            where: { roomId: room.id, isActive: true },
            data: updateData,
        });

        if (result.count === 0) return c.json({ message: 'Active guest not found' }, 404);
        return c.json({ success: true, message: 'Guest updated' });
    } catch (error) {
        console.error('Update guest error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Guest token
guests.post('/token', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { accessToken } = await c.req.json();

        const guest = await prisma.guest.findFirst({
            where: { accessToken, isActive: true, tenantId },
            include: { room: true },
        });

        if (!guest) return c.json({ message: 'Invalid token' }, 404);

        return c.json({
            guest: {
                id: guest.id,
                firstName: guest.firstName,
                lastName: guest.lastName,
                roomNumber: guest.room.number,
                roomId: guest.roomId,
                language: guest.language,
                checkIn: guest.checkIn,
                checkOut: guest.checkOut,
            },
        });
    } catch (error) {
        console.error('Guest token error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

export default guests;
