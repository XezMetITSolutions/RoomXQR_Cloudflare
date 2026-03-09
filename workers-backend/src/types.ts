import { Context, Next } from 'hono';

// Env bindings tipi
export type Bindings = {
    DATABASE_URL: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM?: string;
    SMTP_SECURE?: string;
    DEEPL_API_KEY?: string;
    SEED_SECRET?: string;
    ENVIRONMENT: string;
};

export type Variables = {
    tenantId: string;
    tenantSlug: string;
    userId: string;
    userRole: string;
    userEmail: string;
};

export type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>;
