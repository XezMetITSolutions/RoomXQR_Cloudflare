import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const databaseUrl = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

async function main() {
    const hotels = await prisma.hotel.findMany();
    const data = JSON.stringify(hotels.map(h => ({ id: h.id, name: h.name, tenantId: h.tenantId })), null, 2);
    fs.writeFileSync('hotels_report.json', data);
    console.log('Hotels written to hotels_report.json');
}

main();
