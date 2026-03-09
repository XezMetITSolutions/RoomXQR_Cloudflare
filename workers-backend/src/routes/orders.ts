import { Hono } from 'hono';
import { getPrisma } from '../db';
import { tenantMiddleware, authMiddleware, adminAuthMiddleware } from '../middleware/auth';
import { Bindings, Variables } from '../types';

const orders = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get orders
orders.get('/', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        const ordersList = await prisma.order.findMany({
            where: { tenantId },
            include: {
                room: true,
                guest: true,
                items: { include: { menuItem: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return c.json(ordersList);
    } catch (error) {
        console.error('Get orders error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Create order
orders.post('/', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { roomId, items, notes, paymentMethod } = await c.req.json();

        if (!tenantId) return c.json({ message: 'Tenant ID required' }, 400);
        if (!roomId || !items || !Array.isArray(items)) {
            return c.json({ message: 'roomId and items required' }, 400);
        }

        // Find room
        const room = await prisma.room.findFirst({
            where: {
                tenantId,
                OR: [{ id: roomId }, { number: roomId }, { qrCode: roomId }],
            },
        });
        if (!room) return c.json({ message: 'Room not found' }, 404);

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        // Find active guest
        let guest = await prisma.guest.findFirst({
            where: { roomId: room.id, isActive: true },
        });

        if (!guest) {
            guest = await prisma.guest.create({
                data: {
                    firstName: 'Misafir',
                    lastName: room.number,
                    checkIn: new Date(),
                    isActive: true,
                    tenantId,
                    hotelId: hotel.id,
                    roomId: room.id,
                },
            });
        }

        // Calculate total
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += (item.price || 0) * (item.quantity || 1);
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                status: 'PENDING',
                totalAmount,
                notes: notes || null,
                paymentMethod: paymentMethod || null,
                tenantId,
                hotelId: hotel.id,
                roomId: room.id,
                guestId: guest.id,
                items: {
                    create: items.map((item: any) => ({
                        quantity: item.quantity || 1,
                        price: item.price || 0,
                        notes: item.notes || null,
                        menuItemId: item.menuItemId,
                    })),
                },
            },
            include: {
                items: { include: { menuItem: true } },
                room: true,
                guest: true,
            },
        });

        return c.json(order, 201);
    } catch (error) {
        console.error('Create order error:', error);
        return c.json({ message: 'Database error', error: error instanceof Error ? error.message : String(error) }, 500);
    }
});

// Update order
orders.put('/:id', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');
        const { status, notes } = await c.req.json();

        const updateData: any = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const result = await prisma.order.updateMany({
            where: { id, tenantId },
            data: updateData,
        });

        if (result.count === 0) return c.json({ message: 'Order not found' }, 404);

        const updatedOrder = await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { menuItem: true } }, room: true, guest: true },
        });

        return c.json(updatedOrder);
    } catch (error) {
        console.error('Update order error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

export default orders;
