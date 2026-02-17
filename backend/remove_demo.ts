import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeDemoTenant() {
    try {
        console.log('🧹 Demo tenant ve ilişkili veriler temizleniyor...')

        // Demo tenant'ı bul
        const demoTenant = await prisma.tenant.findUnique({
            where: { slug: 'demo' },
            include: {
                hotels: true,
                users: true,
                rooms: true,
                guests: true,
                orders: true,
                menuItems: true,
                guestRequests: true,
                notifications: true
            }
        })

        if (!demoTenant) {
            console.log('✅ Demo tenant zaten mevcut değil veya silinmiş.')
            return
        }

        console.log(`Bulunan Tenant: ${demoTenant.name} (${demoTenant.slug})`)

        // İlişkili tüm verileri sil
        // Önce order items'ı sil (Genellikle explicit silme daha güvenli)
        const orders = await prisma.order.findMany({
            where: { tenantId: demoTenant.id }
        })

        console.log(`${orders.length} adet sipariş ve içerikleri siliniyor...`)
        for (const order of orders) {
            await prisma.orderItem.deleteMany({
                where: { orderId: order.id }
            })
        }

        // Tenant'ı sil (Cascade delete sayesinde diğer her şey silinmeli)
        await prisma.tenant.delete({
            where: { id: demoTenant.id }
        })

        console.log('✅ Demo tenant ve tüm bağlı veriler başarıyla silindi.')

    } catch (e) {
        console.error('❌ Demo silme işlemi sırasında hata oluştu:', e)
    } finally {
        await prisma.$disconnect()
    }
}

removeDemoTenant()
