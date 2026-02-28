require('dotenv').config();
const { Client } = require('pg');

async function check() {
    const connectionString = process.env.DATABASE_URL + '?sslmode=require';
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
