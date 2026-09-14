import { exec } from 'child_process'

let handler = async (m, { conn }) => {
    await conn.reply(m.chat, '➛ Merestart bot...', m)

    if (process.env.PM2_HOME || process.env.pm_id) {
        exec('pm2 restart $(basename $(pwd))')
    } else {
        setTimeout(() => process.exit(0), 1000)
    }
}

handler.command = ['restart', 'r']
handler.creator = true

export default handler
