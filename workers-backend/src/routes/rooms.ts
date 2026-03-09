import { Hono } from 'hono';
import { getPrisma } from '../db';
import { tenantMiddleware, authMiddleware } from '../middleware/auth';
import { Bindings, Variables } from '../types';

const rooms = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get all rooms
rooms.get('/', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        if (!tenantId) {
            return c.json({ message: 'Tenant ID required' }, 400);
        }

        const roomsList = await prisma.room.findMany({
            where: { tenantId, isActive: true },
            include: {
                guests: {
                    where: { isActive: true },
                    orderBy: { checkIn: 'desc' },
                    take: 1,
                },
            },
            orderBy: [{ floor: 'asc' }, { number: 'asc' }],
        });

        return c.json(roomsList);
    } catch (error) {
        console.error('Get rooms error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Bulk create rooms
rooms.post('/bulk', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { rooms: roomsData } = await c.req.json();

        if (!tenantId) {
            return c.json({ message: 'Tenant ID required' }, 400);
        }

        const hotel = await prisma.hotel.findFirst({
            where: { tenantId },
        });

        if (!hotel) {
            return c.json({ message: 'Hotel not found' }, 404);
        }

        const createdRooms = [];
        for (const room of roomsData) {
            try {
                const qrCode = room.qrCode || `room-${room.number}-${Date.now()}`;
                const existingRoom = await prisma.room.findUnique({
                    where: { qrCode },
                });

                if (!existingRoom) {
                    const newRoom = await prisma.room.create({
                        data: {
                            number: String(room.number),
                            floor: parseInt(room.floor) || 1,
                            type: room.type || 'SINGLE',
                            capacity: room.capacity || 2,
                            qrCode,
                            tenantId,
                            hotelId: hotel.id,
                        },
                    });
                    createdRooms.push(newRoom);
                }
            } catch (roomError) {
                console.error(`Error creating room ${room.number}:`, roomError);
            }
        }

        return c.json({ success: true, rooms: createdRooms, count: createdRooms.length }, 201);
    } catch (error) {
        console.error('Bulk create rooms error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Delete room
rooms.post('/delete', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { id } = await c.req.json();

        const result = await prisma.room.deleteMany({
            where: { id, tenantId },
        });

        if (result.count === 0) {
            return c.json({ message: 'Room not found' }, 404);
        }

        return c.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Delete room error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Bulk delete rooms
rooms.post('/bulk-delete', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { ids } = await c.req.json();

        const result = await prisma.room.deleteMany({
            where: { id: { in: ids }, tenantId },
        });

        return c.json({ message: `${result.count} rooms deleted`, deletedCount: result.count });
    } catch (error) {
        console.error('Bulk delete rooms error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Delete all rooms
rooms.post('/delete-all', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        const result = await prisma.room.deleteMany({
            where: { tenantId },
        });

        return c.json({ message: `All rooms deleted (${result.count})`, deletedCount: result.count });
    } catch (error) {
        console.error('Delete all rooms error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Guest links
rooms.get('/guest-links', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        const roomsList = await prisma.room.findMany({
            where: { tenantId, isActive: true },
            include: {
                guests: {
                    where: { isActive: true },
                    orderBy: { checkIn: 'desc' },
                    take: 1,
                },
            },
            orderBy: [{ floor: 'asc' }, { number: 'asc' }],
        });

        const links = roomsList.map((room: any) => ({
            roomId: room.id,
            roomNumber: room.number,
            qrCode: room.qrCode,
            guestName: room.guests?.[0] ? `${room.guests[0].firstName} ${room.guests[0].lastName}` : null,
            hasGuest: room.guests?.length > 0,
        }));

        return c.json(links);
    } catch (error) {
        console.error('Get guest links error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Get active guest for room
rooms.get('/:number/active-guest', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const roomNumber = c.req.param('number');

        const room = await prisma.room.findFirst({
            where: {
                tenantId,
                OR: [
                    { number: roomNumber },
                    { qrCode: roomNumber },
                    { id: roomNumber },
                ],
            },
            include: {
                guests: {
                    where: { isActive: true },
                    orderBy: { checkIn: 'desc' },
                    take: 1,
                },
            },
        });

        if (!room) {
            return c.json({ message: 'Room not found' }, 404);
        }

        const activeGuest = room.guests?.[0] || null;
        return c.json({
            room: {
                id: room.id,
                number: room.number,
                floor: room.floor,
                type: room.type,
                qrCode: room.qrCode,
            },
            guest: activeGuest,
        });
    } catch (error) {
        console.error('Get active guest error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

export default rooms;
