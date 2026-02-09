import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkPassword() {
    const email = 'office@xezmet.at'
    const passwordInput = '01528797Mb##'

    try {
        console.log(`🔍 Kullanıcı aranıyor: ${email}`)

        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        })

        if (!user) {
            console.log('❌ Kullanıcı bulunamadı!')
            return
        }

        console.log('👤 Kullanıcı bulundu.')
        console.log(`🔑 Girilen şifre test ediliyor...`)

        const isMatch = await bcrypt.compare(passwordInput, user.password)

        if (isMatch) {
            console.log('\n✅ ŞİFRE DOĞRU! Veritabanındaki hash ile eşleşiyor.')
            console.log('Sorun şifrede değil, muhtemelen frontend-backend iletişiminde veya başka bir mantıkta.')
        } else {
            console.log('\n❌ ŞİFRE YANLIŞ! Girilen şifre veritabanındaki hash ile eşleşmiyor.')
            console.log('Bu şifreyi kullanabilmeniz için veritabanındaki şifreyi güncellememiz gerekiyor.')
        }

    } catch (error) {
        console.error('Hata:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkPassword()
