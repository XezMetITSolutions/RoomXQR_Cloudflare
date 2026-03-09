import { Hono } from 'hono';
import { getPrisma } from '../db';
import { tenantMiddleware, authMiddleware } from '../middleware/auth';
import { Bindings, Variables } from '../types';
import bcrypt from 'bcryptjs';

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Login
auth.post('/login', tenantMiddleware, async (c) => {
    try {
        const { email, password } = await c.req.json();
        const prisma = getPrisma(c.env.DATABASE_URL);
        const tenantId = c.get('tenantId');

        if (!email || !password) {
            return c.json({ message: 'Email ve şifre gerekli' }, 400);
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                tenant: true,
                hotel: true,
                permissions: true,
            },
        });

        if (!user) {
            return c.json({ message: 'Geçersiz email veya şifre' }, 401);
        }

        // SUPER_ADMIN her tenant'a giriş yapabilir
        if (user.role !== 'SUPER_ADMIN' && tenantId && user.tenantId !== tenantId) {
            return c.json({ message: 'Bu işletmeye erişim yetkiniz yok' }, 403);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return c.json({ message: 'Geçersiz email veya şifre' }, 401);
        }

        if (!user.isActive) {
            return c.json({ message: 'Hesap devre dışı' }, 403);
        }

        // JWT token oluştur (basit yöntem - Workers'da native crypto ile)
        const jwtSecret = c.env.JWT_SECRET || 'roomxqr-secret-key';
        const payload = {
            userId: user.id,
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            hotelId: user.hotelId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 saat
        };

        // Simple JWT creation
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        const body = btoa(JSON.stringify(payload))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        // HMAC-SHA256 signature using Web Crypto API
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(jwtSecret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signatureArrayBuffer = await crypto.subtle.sign(
            'HMAC',
            key,
            encoder.encode(`${header}.${body}`)
        );
        const signature = btoa(String.fromCharCode(...new Uint8Array(signatureArrayBuffer)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        const token = `${header}.${body}.${signature}`;

        // Son giriş zamanını güncelle
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        return c.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tenantId: user.tenantId,
                hotelId: user.hotelId,
                tenant: user.tenant,
                hotel: user.hotel,
                permissions: user.permissions?.map((p: any) => p.pageName) || [],
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ message: 'Giriş hatası' }, 500);
    }
});

// Get current user
auth.get('/me', tenantMiddleware, authMiddleware, async (c) => {
    try {
        const prisma = getPrisma(c.env.DATABASE_URL);
        const userId = c.get('userId');

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                tenant: true,
                hotel: true,
                permissions: true,
            },
        });

        if (!user) {
            return c.json({ message: 'Kullanıcı bulunamadı' }, 404);
        }

        return c.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            tenantId: user.tenantId,
            hotelId: user.hotelId,
            tenant: user.tenant,
            hotel: user.hotel,
            permissions: user.permissions?.map((p: any) => p.pageName) || [],
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return c.json({ message: 'Server error' }, 500);
    }
});

export default auth;
