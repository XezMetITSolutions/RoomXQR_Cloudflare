import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Bindings, Variables } from './types';

// Route imports
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import menuRoutes from './routes/menu';
import guestRoutes from './routes/guests';
import orderRoutes from './routes/orders';
import requestRoutes from './routes/requests';
import adminRoutes from './routes/admin';
import miscRoutes from './routes/misc';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ====== MIDDLEWARE ======

// Logger
app.use('*', logger());

// CORS - Tüm roomxqr domain'lerini ve geliştirme ortamlarını izin ver
app.use('*', cors({
    origin: (origin) => {
        if (!origin) return '*';
        const normalizedOrigin = origin.replace(/\/$/, '');
        const allowedDomains = [
            'roomxqr.com', 'roomxr.com', 'onrender.com',
            'netlify.app', 'vercel.app', 'pages.dev',
            'workers.dev', 'localhost',
        ];
        for (const domain of allowedDomains) {
            if (normalizedOrigin.includes(domain)) return origin;
        }
        return undefined;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-tenant', 'X-Tenant', 'x-seed-secret', 'X-Seed-Secret'],
    exposeHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
    maxAge: 86400,
}));

// ====== ROOT ROUTES ======

app.get('/', (c) => {
    return c.json({
        message: 'RoomXQR Backend API (Cloudflare Workers)',
        version: '2.0.0',
        status: 'running',
        runtime: 'Cloudflare Workers',
        endpoints: {
            health: '/health',
            api: '/api',
            auth: '/api/auth',
            menu: '/api/menu',
            rooms: '/api/rooms',
            guests: '/api/guests',
            requests: '/api/requests',
            orders: '/api/orders',
        },
        timestamp: new Date().toISOString(),
    });
});

app.get('/health', async (c) => {
    try {
        const { getPrisma } = await import('./db');
        const prisma = getPrisma(c.env.DATABASE_URL);
        await prisma.$queryRaw`SELECT 1`;
        return c.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Connected',
            runtime: 'Cloudflare Workers',
            environment: c.env.ENVIRONMENT || 'production',
        });
    } catch (error) {
        return c.json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'Disconnected',
            runtime: 'Cloudflare Workers',
            error: error instanceof Error ? error.message : 'Unknown error',
        }, 503);
    }
});

// ====== API ROUTES ======

// Auth
app.route('/api/auth', authRoutes);

// Rooms
app.route('/api/rooms', roomRoutes);

// Menu
app.route('/api/menu', menuRoutes);

// Guests
app.route('/api/guests', guestRoutes);
app.post('/api/guest-token', async (c) => {
    // Proxy to guests/token
    const body = await c.req.json();
    const url = new URL(c.req.url);
    url.pathname = '/api/guests/token';
    return guestRoutes.fetch(new Request(url.toString(), { method: 'POST', headers: c.req.raw.headers, body: JSON.stringify(body) }), c.env);
});

// Orders
app.route('/api/orders', orderRoutes);

// Requests
app.route('/api/requests', requestRoutes);

// Admin
app.route('/api/admin', adminRoutes);

// Misc routes (statistics, notifications, announcements, hotel info, campaigns, facilities, users, demo-request)
app.route('/api', miscRoutes);

// ====== 404 HANDLER ======
app.notFound((c) => {
    return c.json({ message: 'Route not found' }, 404);
});

// ====== ERROR HANDLER ======
app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json({ message: 'Something went wrong!', error: err.message }, 500);
});

export default app;
