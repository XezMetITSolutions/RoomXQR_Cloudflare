import { Hono } from 'hono';
import { getPrisma } from '../db';
import { tenantMiddleware, authMiddleware, adminAuthMiddleware } from '../middleware/auth';
import { Bindings, Variables } from '../types';
import bcrypt from 'bcryptjs';

const admin = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get all tenants
admin.get('/tenants', adminAuthMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenants = await prisma.tenant.findMany({
            select: {
                id: true, name: true, slug: true, domain: true,
                isActive: true, settings: true, createdAt: true,
                _count: { select: { users: true, hotels: true, orders: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return c.json({ tenants });
    } catch (error) {
        console.error('Tenants list error:', error);
        return c.json({ message: 'Database error' }, 500);
    }
});

// Create tenant  
admin.post('/tenants', adminAuthMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const body = await c.req.json();
        const { name, slug, domain, ownerName, ownerEmail, ownerPhone, address, city, district, postalCode, adminPassword, adminPasswordConfirm, planId, status } = body;

        if (!name || !slug) return c.json({ message: 'Name ve slug gerekli' }, 400);
        if (!ownerName || !ownerEmail || !ownerPhone) return c.json({ message: 'Sahip bilgileri gerekli' }, 400);
        if (!address || !city || !district) return c.json({ message: 'Adres bilgileri gerekli' }, 400);
        if (!adminPassword || adminPassword !== adminPasswordConfirm) return c.json({ message: 'Şifreler eşleşmiyor' }, 400);

        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

        const existing = await prisma.tenant.findUnique({ where: { slug: cleanSlug } });
        if (existing) return c.json({ message: 'Bu slug zaten kullanılıyor' }, 400);

        const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
        if (existingUser) return c.json({ message: 'Bu email zaten kullanılıyor' }, 400);

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const nameParts = ownerName.split(' ');

        const tenant = await prisma.tenant.create({
            data: {
                name, slug: cleanSlug, domain: domain || null, isActive: status === 'active',
                settings: {
                    theme: { primaryColor: '#0D9488', secondaryColor: '#f3f4f6' },
                    currency: 'TRY', language: 'tr',
                    owner: { name: ownerName, email: ownerEmail, phone: ownerPhone },
                    address: { address, city, district, postalCode: postalCode || null },
                    planId: planId || null, status: status || 'pending',
                },
            },
        });

        const fullAddress = `${address}, ${district}, ${city}${postalCode ? ` ${postalCode}` : ''}`;
        const hotel = await prisma.hotel.create({
            data: { name: `${name} Otel`, address: fullAddress, phone: ownerPhone, email: ownerEmail, tenantId: tenant.id },
        });

        const adminUser = await prisma.user.create({
            data: {
                email: ownerEmail, password: hashedPassword,
                firstName: nameParts[0] || 'Admin', lastName: nameParts.slice(1).join(' ') || 'User',
                role: 'ADMIN', tenantId: tenant.id, hotelId: hotel.id,
            },
        });

        return c.json({
            message: 'İşletme başarıyla oluşturuldu',
            tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
            hotel: { id: hotel.id, name: hotel.name },
            admin: { id: adminUser.id, email: adminUser.email },
        }, 201);
    } catch (error) {
        console.error('Tenant creation error:', error);
        return c.json({ message: 'Veritabanı hatası' }, 500);
    }
});

// Update tenant
admin.put('/tenants/:id', adminAuthMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const id = c.req.param('id');
        const body = await c.req.json();
        const { name, slug, domain, isActive, ownerName, ownerEmail, ownerPhone, address, city, district, postalCode, planId, status } = body;

        const tenant = await prisma.tenant.findUnique({ where: { id } });
        if (!tenant) return c.json({ message: 'Tenant bulunamadı' }, 404);

        const currentSettings = (tenant.settings as any) || {};
        const updatedSettings = { ...currentSettings };
        if (ownerName || ownerEmail || ownerPhone) {
            updatedSettings.owner = { ...(currentSettings.owner || {}), ...(ownerName && { name: ownerName }), ...(ownerEmail && { email: ownerEmail }), ...(ownerPhone && { phone: ownerPhone }) };
        }
        if (address || city || district) {
            updatedSettings.address = { ...(currentSettings.address || {}), ...(address && { address }), ...(city && { city }), ...(district && { district }), ...(postalCode !== undefined && { postalCode }) };
        }
        if (planId !== undefined) updatedSettings.planId = planId || null;
        if (status !== undefined) updatedSettings.status = status || 'pending';

        const updatedTenant = await prisma.tenant.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') }),
                ...(domain !== undefined && { domain: domain || null }),
                ...(isActive !== undefined && { isActive }),
                settings: updatedSettings,
            },
        });

        return c.json({ message: 'İşletme güncellendi', tenant: updatedTenant });
    } catch (error) {
        console.error('Tenant update error:', error);
        return c.json({ message: 'Veritabanı hatası' }, 500);
    }
});

// Delete tenant
admin.delete('/tenants/:id', adminAuthMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const id = c.req.param('id');

        const tenant = await prisma.tenant.findUnique({ where: { id } });
        if (!tenant) return c.json({ message: 'Tenant bulunamadı' }, 404);

        await prisma.tenant.delete({ where: { id } });
        return c.json({ message: 'İşletme silindi' });
    } catch (error) {
        console.error('Tenant delete error:', error);
        return c.json({ message: 'Veritabanı hatası' }, 500);
    }
});

// Get tenant features
admin.get('/tenants/:id/features', adminAuthMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const id = c.req.param('id');
        const features = await prisma.tenantFeature.findMany({ where: { tenantId: id } });
        return c.json({ features });
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

// Upsert tenant feature
admin.post('/tenants/:id/features', adminAuthMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const id = c.req.param('id');
        const { featureKey, enabled, config } = await c.req.json();
        if (!featureKey) return c.json({ message: 'Feature key gerekli' }, 400);

        const feature = await prisma.tenantFeature.upsert({
            where: { tenantId_featureKey: { tenantId: id, featureKey } },
            update: { enabled: enabled ?? false, config: config || null },
            create: { tenantId: id, featureKey, enabled: enabled ?? false, config: config || null },
        });
        return c.json({ message: 'Özellik güncellendi', feature });
    } catch (error) {
        return c.json({ message: 'Database error' }, 500);
    }
});

// Available features list
admin.get('/features/available', adminAuthMiddleware, async (c) => {
    return c.json({
        features: [
            { key: 'qr-menu', name: 'QR Menü', description: 'QR kod ile menü erişimi', category: 'temel' },
            { key: 'multi-language', name: 'Çoklu Dil Desteği', description: 'Birden fazla dil desteği', category: 'temel' },
            { key: 'analytics', name: 'Analitik', description: 'Detaylı analitik raporlar', category: 'gelişmiş' },
            { key: 'custom-branding', name: 'Özel Markalama', description: 'Logo ve tema özelleştirmesi', category: 'gelişmiş' },
            { key: 'api-access', name: 'API Erişimi', description: 'REST API erişimi', category: 'gelişmiş' },
        ],
    });
});

export default admin;
