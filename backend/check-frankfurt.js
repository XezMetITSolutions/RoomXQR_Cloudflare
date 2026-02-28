const { Client } = require('pg');

async function check() {
    const connectionString = 'postgresql://roomxqr_database_user:BDnU6U13eW124j3MvIe130yvQ7N0zF9Z@dpg-cuseuijv2p9s73cdmbb0-a.frankfurt-postgres.render.com/roomxqr_eek6?sslmode=require';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        const res = await client.query("SELECT title FROM notifications WHERE type = 'SYSTEM'");
        console.log('Announcements in DB:', res.rows.length);
        res.rows.forEach(r => console.log('-', r.title));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
