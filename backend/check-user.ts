import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
    try {
        console.log('🔍 Checking user: office@xezmet.at\n')

        // Kullanıcıyı kontrol et
        const user = await prisma.user.findUnique({
            where: { email: 'office@xezmet.at' },
            include: {
                tenant: true,
                hotel: true
            }
        })

        if (!user) {
            console.log('❌ Kullanıcı bulunamadı: office@xezmet.at\n')
            console.log('📋 Tüm kullanıcıları listeleyelim:\n')

            const allUsers = await prisma.user.findMany({
                include: {
                    tenant: {
                        select: {
                            name: true,
                            slug: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            })

            console.table(allUsers.map(u => ({
                id: u.id,
                email: u.email,
                role: u.role,
                firstName: u.firstName,
                lastName: u.lastName,
                tenant: u.tenant?.slug || 'NO TENANT',
                isActive: u.isActive
            })))
        } else {
            console.log('✅ Kullanıcı bulundu:\n')
            console.log({
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
                tenant: user.tenant ? {
                    name: user.tenant.name,
                    slug: user.tenant.slug,
                    isActive: user.tenant.isActive
                } : 'NO TENANT',
                hotel: user.hotel ? {
                    name: user.hotel.name,
                    isActive: user.hotel.isActive
                } : 'NO HOTEL'
            })

            console.log('\n📋 Debug Bilgileri:')

            // Tenant kontrolü
            if (!user.tenant) {
                console.log('❌ PROBLEM 1: Kullanıcının tenant bilgisi yok!')
            } else if (user.tenant.slug !== 'demo' && user.tenant.slug !== 'system-admin') {
                console.log(`❌ PROBLEM 1: Tenant slug '${user.tenant.slug}' izinli değil!`)
                console.log('   Auth controller sadece "demo" ve "system-admin" tenant\'larına izin veriyor.')
                console.log(`   Bu kullanıcının tenant slug'ını düzeltmeniz gerekiyor.`)
            } else {
                console.log(`✅ Tenant slug '${user.tenant.slug}' izinli.`)
            }

            if (!user.isActive) {
                console.log('❌ PROBLEM 2: Kullanıcı aktif değil!')
            } else {
                console.log('✅ Kullanıcı aktif.')
            }

            if (user.tenant && !user.tenant.isActive) {
                console.log('❌ PROBLEM 3: Tenant aktif değil!')
            } else if (user.tenant) {
                console.log('✅ Tenant aktif.')
            }

            // Şifre hash kontrolü
            console.log(`\n🔐 Password hash mevcut: ${user.password ? 'Evet' : 'Hayır'}`)
            if (user.password) {
                console.log(`   Hash uzunluğu: ${user.password.length} karakter`)
                console.log(`   Hash formatı: ${user.password.startsWith('$2') ? 'Bcrypt ✅' : 'Bilinmiyor ⚠️'}`)
            }
        }

        // Tüm tenant'ları listele
        console.log('\n📋 Tüm Tenant\'lar:')
        const tenants = await prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' }
        })
        console.table(tenants.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            isActive: t.isActive
        })))

    } catch (error) {
        console.error('❌ Hata:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
