const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: "postgresql://roomxqr:2s0ZdRXelkkxLsSNi9fHyzPNsTUPjQMN@dpg-d38qqfvfte5s73cb4vv0-a.oregon-postgres.render.com/roomxqr_eek6",
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = $1", ['grandhotel']);
        if (tenantRes.rows.length === 0) {
            console.log('not found');
            return;
        }
        const tenantId = tenantRes.rows[0].id;
        console.log('found target:', tenantId);

        const res = await client.query("DELETE FROM menu_items WHERE \"tenantId\" = $1", [tenantId]);
        console.log('deleted items: ' + res.rowCount);
    } catch (err) {
        console.error('error executing query', err);
    } finally {
        await client.end();
    }
}

main();
