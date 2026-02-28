const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function checkAndUpdate() {
    const connectionString = 'postgresql://roomxqr_database_user:BDnU6U13eW124j3MvIe130yvQ7N0zF9Z@dpg-cuseuijv2p9s73cdmbb0-a.frankfurt-postgres.render.com/roomxqr_eek6?sslmode=require';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        // find tenant grandhotel
        let res = await client.query("SELECT id FROM tenants WHERE slug = 'grandhotel'");
        if (res.rows.length === 0) {
            console.log('Grandhotel tenant not found');
            return;
        }
        const tenantId = res.rows[0].id;

        res = await client.query("SELECT id FROM users WHERE email = 'office@grandhotel.com'");

        // Hash the password '123456'
        const passwordHash = await bcrypt.hash('123456', 10);

        if (res.rows.length > 0) {
            // update
            await client.query("UPDATE users SET password = $1 WHERE email = 'office@grandhotel.com'", [passwordHash]);
            console.log('User office@grandhotel.com updated.');
        } else {
            // check another admin for grandhotel to overwrite?
            // let's just insert one
            const uuidv4 = require('crypto').randomUUID;
            const newId = uuidv4();
            await client.query(
                "INSERT INTO users (id, \"firstName\", \"lastName\", email, password, role, \"tenantId\", \"createdAt\", \"updatedAt\") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())",
                [newId, 'Demo', 'Admin', 'office@grandhotel.com', passwordHash, 'ADMIN', tenantId]
            );
            console.log('User office@grandhotel.com created.');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkAndUpdate();
