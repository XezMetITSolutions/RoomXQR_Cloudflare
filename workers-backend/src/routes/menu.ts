import { Hono } from 'hono';
import { getPrisma } from '../db';
import { tenantMiddleware, authMiddleware } from '../middleware/auth';
import { Bindings, Variables } from '../types';

const menu = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get menu items
menu.get('/', tenantMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        if (!tenantId) {
            return c.json({ message: 'Tenant ID required' }, 400);
        }

        const menuItems = await prisma.menuItem.findMany({
            where: { tenantId, isActive: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });

        return c.json(menuItems);
    } catch (error) {
        console.error('Get menu error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Create menu item
menu.post('/', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { name, description, price, category, image, allergens, calories, isAvailable, translations } = await c.req.json();

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        const createData: any = {
            name,
            description: description || '',
            price: parseFloat(price) || 0,
            category: category || 'Diğer',
            image: image || '',
            allergens: allergens || [],
            calories: calories ? parseInt(calories) : null,
            isAvailable: isAvailable !== false,
            isActive: true,
            tenantId,
            hotelId: hotel.id,
        };

        if (translations !== undefined) createData.translations = translations;

        const menuItem = await prisma.menuItem.create({ data: createData });
        return c.json(menuItem, 201);
    } catch (error) {
        console.error('Menu create error:', error);
        return c.json({ message: 'Database error', error: error instanceof Error ? error.message : String(error) }, 500);
    }
});

// Update menu item
menu.put('/:id', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');
        const { name, description, price, category, image, allergens, calories, isAvailable, translations } = await c.req.json();

        const updateData: any = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category) updateData.category = category;
        if (image !== undefined) updateData.image = image;
        if (allergens !== undefined) updateData.allergens = allergens;
        if (calories !== undefined) updateData.calories = calories ? parseInt(calories) : null;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (translations !== undefined) updateData.translations = translations;

        const result = await prisma.menuItem.updateMany({
            where: { id, tenantId },
            data: updateData,
        });

        if (result.count === 0) return c.json({ message: 'Menu item not found' }, 404);

        const updatedItem = await prisma.menuItem.findUnique({ where: { id } });
        return c.json(updatedItem);
    } catch (error) {
        console.error('Menu update error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Delete menu item
menu.delete('/:id', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const id = c.req.param('id');

        const result = await prisma.menuItem.deleteMany({ where: { id, tenantId } });
        if (result.count === 0) return c.json({ message: 'Menu item not found' }, 404);
        return c.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Menu delete error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Delete all menu items for tenant
menu.delete('/', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        const result = await prisma.menuItem.deleteMany({ where: { tenantId } });
        return c.json({ message: 'Tüm menu itemlar silindi', deletedCount: result.count });
    } catch (error) {
        console.error('Menu delete all error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Save menu items (bulk)
menu.post('/save', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');
        const { items } = await c.req.json();

        if (!Array.isArray(items) || items.length === 0) {
            return c.json({ message: 'Items array required' }, 400);
        }

        const hotel = await prisma.hotel.findFirst({ where: { tenantId } });
        if (!hotel) return c.json({ message: 'Hotel not found' }, 404);

        const createdItems = [];
        for (const item of items) {
            try {
                const createData: any = {
                    name: item.name,
                    description: item.description || '',
                    price: parseFloat(item.price) || 0,
                    category: item.category || 'Diğer',
                    image: item.image || '',
                    allergens: item.allergens || [],
                    calories: item.calories ? parseInt(item.calories) : null,
                    isAvailable: item.available !== undefined ? item.available : (item.isAvailable !== false),
                    isActive: true,
                    tenantId,
                    hotelId: hotel.id,
                };
                if (item.translations !== undefined) createData.translations = item.translations;

                const menuItem = await prisma.menuItem.create({ data: createData });
                createdItems.push(menuItem);
            } catch (e) {
                console.error(`Error saving menu item:`, e);
            }
        }

        return c.json({ success: true, count: createdItems.length, items: createdItems }, 201);
    } catch (error) {
        console.error('Menu save error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

export default menu;
