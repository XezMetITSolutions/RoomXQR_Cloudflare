import { PrismaClient } from '@prisma/client';

const databaseUrl = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database';
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

async function checkUrl(url: string, name: string) {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.ok) {
            console.log(`FOUND R2 IMAGE FOR ${name}: ${url}`);
            return url;
        }
        return null;
    } catch (err) {
        return null;
    }
}

async function main() {
    const items = await prisma.menuItem.findMany({
        where: { tenantId: 'cmlj93fuw0000fw4ldipx34qf' }
    });

    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const baseR2Url = 'https://pub-3603ac50ebf4475dbcd32f2e93618c2a.r2.dev';

    console.log(`Checking R2 server for ${items.length} items...`);

    for (const item of items) {
        const slugs = [
            item.id,
            item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), // classic-burger
            item.name.replace(/[^a-zA-Z0-9]+/g, '_'),
            item.name
        ];

        let found = false;
        for (const slug of slugs) {
            if (found) break;
            for (const ext of ['', ...extensions]) {
                if (found) break;
                const url = `${baseR2Url}/${slug}${ext}`;

                let res = await checkUrl(url, item.name);
                if (res) {
                    found = true;
                    break;
                }

                if (slug !== encodeURI(slug)) {
                    res = await checkUrl(encodeURI(url), item.name);
                    if (res) found = true;
                }
            }
        }
        if (!found) {
            // Just checking to see what output we get
            // console.log(`Not found for ${item.name}`);
        }
    }
    console.log("Check complete.");
}

main().finally(() => prisma.$disconnect());
