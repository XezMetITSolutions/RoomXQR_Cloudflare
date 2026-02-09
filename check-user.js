const { Client } = require('pg');

const connectionString = 'postgresql://roomxqr_database_user:BDnU6U13eW124KDpKF1fSJoCvWFxuHxQ@dpg-d64hapshg0os73d7hutg-a.frankfurt-postgres.render.com/roomxqr_database';

async function checkUser() {
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        // Kullanıcıyı kontrol et
        const userQuery = `
      SELECT 
        u.id, 
        u.email, 
        u.role, 
        u."tenantId", 
        u."isActive", 
        u."firstName", 
        u."lastName",
        t.name as tenant_name,
        t.slug as tenant_slug,
        t."isActive" as tenant_active
      FROM "User" u
      LEFT JOIN "Tenant" t ON u."tenantId" = t.id
      WHERE u.email = 'office@xezmet.at';
    `;

        const result = await client.query(userQuery);

        if (result.rows.length === 0) {
            console.log('❌ Kullanıcı bulunamadı: office@xezmet.at');
            console.log('\n📋 Tüm kullanıcıları listeleyelim:');

            const allUsersQuery = `
        SELECT 
          u.id, 
          u.email, 
          u.role, 
          u."firstName", 
          u."lastName",
          t.name as tenant_name,
          t.slug as tenant_slug
        FROM "User" u
        LEFT JOIN "Tenant" t ON u."tenantId" = t.id
        ORDER BY u."createdAt" DESC
        LIMIT 10;
      `;

            const allUsers = await client.query(allUsersQuery);
            console.table(allUsers.rows);
        } else {
            console.log('✅ Kullanıcı bulundu:');
            console.table(result.rows);

            const user = result.rows[0];

            // Tenant kontrolü
            if (!user.tenant_slug) {
                console.log('\n⚠️  PROBLEM: Kullanıcının tenant bilgisi yok!');
            } else if (user.tenant_slug !== 'demo' && user.tenant_slug !== 'system-admin') {
                console.log(`\n❌ PROBLEM: Tenant slug '${user.tenant_slug}' izinli değil!`);
                console.log('Auth controller sadece "demo" ve "system-admin" tenant\'larına izin veriyor.');
                console.log(`Bu kullanıcının tenant slug'ını 'demo' veya 'system-admin' olarak değiştirmeniz gerekiyor.`);
            } else {
                console.log(`\n✅ Tenant slug '${user.tenant_slug}' izinli.`);
            }

            if (!user.isActive) {
                console.log('\n❌ PROBLEM: Kullanıcı aktif değil!');
            }

            if (!user.tenant_active) {
                console.log('\n❌ PROBLEM: Tenant aktif değil!');
            }
        }

        // Tüm tenant'ları listele
        console.log('\n📋 Tüm Tenant\'lar:');
        const tenantsQuery = `SELECT id, name, slug, "isActive" FROM "Tenant" ORDER BY "createdAt" DESC;`;
        const tenants = await client.query(tenantsQuery);
        console.table(tenants.rows);

    } catch (error) {
        console.error('❌ Hata:', error.message);
    } finally {
        await client.end();
    }
}

checkUser();
