import { Context, Next } from 'hono';
import { getPrisma } from '../db';
import { Bindings, Variables } from '../types';

type HonoContext = Context<{ Bindings: Bindings; Variables: Variables }>;

// Tenant middleware - x-tenant header'ından tenant slug'ı alır
export async function tenantMiddleware(c: HonoContext, next: Next) {
    const tenantSlug = c.req.header('x-tenant') || c.req.header('X-Tenant') || '';

    if (!tenantSlug) {
        // Tenant slug yoksa devam et ama boş bırak
        c.set('tenantSlug', '');
        c.set('tenantId', '');
        return next();
    }

    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });

        if (!tenant) {
            return c.json({ message: 'Tenant not found' }, 404);
        }

        if (!tenant.isActive) {
            return c.json({ message: 'Tenant is not active' }, 403);
        }

        c.set('tenantId', tenant.id);
        c.set('tenantSlug', tenantSlug);
    } catch (error) {
        console.error('Tenant middleware error:', error);
        c.set('tenantSlug', tenantSlug);
        c.set('tenantId', '');
    }

    return next();
}

// Auth middleware - JWT token doğrulama
export async function authMiddleware(c: HonoContext, next: Next) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Token required' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        // Cloudflare Workers'da jsonwebtoken yerine Web Crypto API kullanılabilir
        // Ancak uyumluluk için basit JWT verification
        const jwtSecret = c.env.JWT_SECRET || 'roomxqr-secret-key';

        // Simple JWT decode (Workers'da native crypto ile)
        const parts = token.split('.');
        if (parts.length !== 3) {
            return c.json({ message: 'Invalid token format' }, 401);
        }

        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        // Token expiry check
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return c.json({ message: 'Token expired' }, 401);
        }

        c.set('userId', payload.userId || payload.id || '');
        c.set('userRole', payload.role || '');
        c.set('userEmail', payload.email || '');

        // tenantId'yi payload'dan da alabilir
        if (payload.tenantId && !c.get('tenantId')) {
            c.set('tenantId', payload.tenantId);
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return c.json({ message: 'Invalid token' }, 401);
    }

    return next();
}

// Admin auth middleware
export async function adminAuthMiddleware(c: HonoContext, next: Next) {
    // Önce normal auth middleware'i çalıştır
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ message: 'Admin token required' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return c.json({ message: 'Invalid token format' }, 401);
        }

        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return c.json({ message: 'Token expired' }, 401);
        }

        if (payload.role !== 'SUPER_ADMIN') {
            return c.json({ message: 'Super admin access required' }, 403);
        }

        c.set('userId', payload.userId || payload.id || '');
        c.set('userRole', payload.role || '');
        c.set('userEmail', payload.email || '');

        if (payload.tenantId) {
            c.set('tenantId', payload.tenantId);
        }
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return c.json({ message: 'Invalid admin token' }, 401);
    }

    return next();
}
