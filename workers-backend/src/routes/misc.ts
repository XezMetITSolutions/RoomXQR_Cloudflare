import { Hono } from 'hono';
import { getPrisma } from '../db';
import { tenantMiddleware, authMiddleware } from '../middleware/auth';
import { Bindings, Variables } from '../types';

const misc = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Statistics
misc.get('/statistics', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalRequests, pendingRequests, completedToday, totalOrders] = await Promise.all([
            prisma.guestRequest.count({ where: { tenantId } }),
            prisma.guestRequest.count({ where: { tenantId, status: 'PENDING' } }),
            prisma.guestRequest.count({ where: { tenantId, status: 'COMPLETED', resolvedAt: { gte: today } } }),
            prisma.order.count({ where: { tenantId } }),
        ]);

        return c.json({ totalRequests, pendingRequests, completedToday, totalOrders, averageResponseTime: 15 });
    } catch (error) {
        console.error('Statistics error:', error);
        return c.json({ totalRequests: 0, pendingRequests: 0, completedToday: 0, averageResponseTime: 0 }, 500);
    }
});

// Notifications
misc.get('/notifications', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const notifications = await prisma.notification.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return c.json(notifications);
    } catch (error) {
        return c.json([], 500);
    }
});

// Create notification
misc.post('/notifications', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { type, title, message, roomId } = await c.req.json();

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        const notification = await prisma.notification.create({
            data: { type: type || 'SYSTEM', title: title || '', message: message || '', roomId: roomId || null, tenantId, hotelId: hotel.id },
        });
        return c.json(notification, 201);
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

// Announcements
misc.get('/announcements', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const announcements = await prisma.notification.findMany({
            where: { tenantId, type: 'SYSTEM' },
            orderBy: { createdAt: 'desc' },
        });
        return c.json(announcements);
    } catch (error) {
        return c.json([], 500);
    }
});

misc.post('/announcements', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { title, content, type, category, startDate, endDate, isActive, linkUrl, linkText, icon, translations } = await c.req.json();

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        const metadata: any = { category: category || 'general', announcementType: type || 'info', startDate, endDate, isActive, linkUrl, linkText, icon, translations };

        const announcement = await prisma.notification.create({
            data: { type: 'SYSTEM', title: title || '', message: content || '', roomId: null, tenantId, hotelId: hotel.id, metadata },
        });
        return c.json(announcement, 201);
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

// Hotel info
misc.get('/hotel/info', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });
        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });

        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);
        const settings = (hotel.settings as any) || {};

        return c.json({
            name: tenant?.name || '',
            wifi: settings.wifi || { networkName: '', password: '' },
            hours: settings.hours || {},
            dining: settings.dining || {},
            amenities: settings.amenities || [],
            contacts: settings.contacts || {},
            activityImages: settings.activityImages || [],
        });
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

misc.put('/hotel/info', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const body = await c.req.json();

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        const currentSettings = (hotel.settings as any) || {};
        const updatedSettings = { ...currentSettings, ...body };

        await prisma.hotel.update({ where: { id: hotel.id }, data: { settings: updatedSettings } });
        return c.json({ message: 'Hotel info updated', hotelInfo: updatedSettings });
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

// Campaigns
misc.get('/campaigns', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const campaigns = await prisma.campaign.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
        return c.json({ campaigns });
    } catch (error) {
        return c.json({ campaigns: [] }, 500);
    }
});

misc.post('/campaigns', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { title, description, image, isActive, startDate, endDate, type, translations } = await c.req.json();

        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, include: { hotels: true } });
        if (!tenant || !tenant.hotels[0]) return c.json({ message: 'Hotel not found' }, 404);

        const campaign = await prisma.campaign.create({
            data: {
                title, description, image, isActive: isActive ?? true,
                startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null,
                type: type || 'GENERAL', translations: translations || {},
                tenantId, hotelId: tenant.hotels[0].id,
            },
        });
        return c.json({ success: true, campaign });
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

// Facilities
misc.get('/facilities', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const facilities = await prisma.hotelFacility.findMany({ where: { tenantId, isActive: true } });
        return c.json(facilities);
    } catch (error) {
        return c.json([], 500);
    }
});

misc.post('/facilities', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const body = await c.req.json();

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        const facility = await prisma.hotelFacility.create({
            data: { ...body, tenantId, hotelId: hotel.id },
        });
        return c.json(facility, 201);
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

// Demo request (public)
misc.post('/demo-request', async (c) => {
    try {
        const { fullName, email, hotelName } = await c.req.json();
        if (!fullName || !email || !hotelName) {
            return c.json({ success: false, message: 'All fields required' }, 400);
        }
        console.log(`📧 Demo Request: ${fullName}, ${email}, ${hotelName}`);
        return c.json({ success: true, message: 'Demo talebiniz alındı.' });
    } catch (error) {
        return c.json({ success: false, message: 'Error' }, 500);
    }
});

// Users CRUD
misc.get('/users', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const users = await prisma.user.findMany({
            where: { tenantId },
            select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, lastLogin: true, createdAt: true, permissions: true },
        });
        return c.json(users);
    } catch (error) {
        return c.json([], 500);
    }
});

misc.post('/users', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const body = await c.req.json();
        const { email, password, firstName, lastName, role } = body;

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        const hashedPassword = await (await import('bcryptjs')).hash(password, 10);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, firstName, lastName, role: role || 'STAFF', tenantId, hotelId: hotel.id },
        });
        return c.json(user, 201);
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

export default misc;
