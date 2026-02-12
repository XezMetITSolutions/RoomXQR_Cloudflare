import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMenuItems() {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: 'grandhotel' }
        })

        if (!tenant) {
            console.log('Tenant not found')
            return
        }

        const items = await prisma.menuItem.findMany({
            where: { tenantId: tenant.id },
            select: { id: true, name: true, image: true }
        })

        console.table(items)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

checkMenuItems()
