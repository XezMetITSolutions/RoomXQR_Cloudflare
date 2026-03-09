import { Hono } from 'hono';
import { getPrisma } from '../db';
import { tenantMiddleware, authMiddleware } from '../middleware/auth';
import { Bindings, Variables } from '../types';

const requests = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get requests
requests.get('/', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const roomId = c.req.query('roomId');

        const where: any = { tenantId };
        if (roomId) {
            const room = await prisma.room.findFirst({
                where: { tenantId, OR: [{ id: roomId }, { number: roomId }, { qrCode: roomId }] },
            });
            if (room) where.roomId = room.id;
        }

        const requestsList = await prisma.guestRequest.findMany({
            where,
            include: { room: true },
            orderBy: { createdAt: 'desc' },
        });

        return c.json(requestsList);
    } catch (error) {
        console.error('Get requests error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Create request
requests.post('/', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { roomId, type, priority, description, notes } = await c.req.json();

        if (!tenantId) return c.json({ message: 'Tenant ID required' }, 400);

        const room = await prisma.room.findFirst({
            where: { tenantId, OR: [{ id: roomId }, { number: roomId }, { qrCode: roomId }] },
        });
        if (!room) return c.json({ message: 'Room not found' }, 404);

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        const request = await prisma.guestRequest.create({
            data: {
                type: type?.toUpperCase() || 'GENERAL',
                priority: priority?.toUpperCase() || 'MEDIUM',
                status: 'PENDING',
                description: description || '',
                notes: notes || null,
                tenantId,
                hotelId: hotel.id,
                roomId: room.id,
            },
            include: { room: true },
        });

        return c.json(request, 201);
    } catch (error) {
        console.error('Create request error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Update request
requests.patch('/:id', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');
        const { status, notes } = await c.req.json();

        const updateData: any = {};
        if (status) updateData.status = status.toUpperCase();
        if (notes !== undefined) updateData.notes = notes;
        if (status === 'COMPLETED' || status === 'completed') {
            updateData.resolvedAt = new Date();
        }

        const result = await prisma.guestRequest.updateMany({
            where: { id, tenantId },
            data: updateData,
        });

        if (result.count === 0) return c.json({ message: 'Request not found' }, 404);

        const updated = await prisma.guestRequest.findUnique({ where: { id }, include: { room: true } });
        return c.json(updated);
    } catch (error) {
        console.error('Update request error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

export default requests;
