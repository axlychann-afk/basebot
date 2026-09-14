import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../../config.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rolePath = path.join(__dirname, '../../database/role.json')

let handler = async (m, { conn }) => {
    const role = JSON.parse(fs.readFileSync(rolePath, 'utf8'))
    const owners = role.owner || []
    const premiums = role.premium || []

    let text = `「 *ROLE LIST* 」\n\n`

    text += `➛ Creator\n`
    for (const num of config.creator) text += `➛ +${num}\n`

    text += `\n➛ Owner (${owners.length})\n`
    text += owners.length ? owners.map(n => `➛ +${n}`).join('\n') + '\n' : '➛ (kosong)\n'

    text += `\n➛ Premium (${premiums.length})\n`
    text += premiums.length ? premiums.map(n => `➛ +${n}`).join('\n') + '\n' : '➛ (kosong)\n'

    await conn.reply(m.chat, text.trim(), m)
}

handler.command = ['listowner', 'ownerlist', 'listrole']
handler.owner = true

export default handler
