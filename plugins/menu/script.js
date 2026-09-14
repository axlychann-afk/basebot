import config from '../../config.json' with { type: 'json' }

let handler = async (m, { conn }) => {
    await conn.reply(m.chat,
        `「 *SCRIPT INFO* 」\n\n` +
        `➛ Nama : ${config.botName}\n` +
        `➛ Developer : ${config.ownerName}\n` +
        `➛ Base : Baileys (ESM)\n\n` +
        `➛ Mau punya bot kayak gini? Ketik .owner buat kontak developer.`, m)
}

handler.command = ['script', 'sourcecode']
handler.category = 'menu'

export default handler
