import config from '../../config.json' with { type: 'json' }

let handler = async (m, { conn, args }) => {
    const url = args[0] || (m.quoted?.text?.match(/https?:\/\/\S+/) || [])[0]

    if (!url) {
        return conn.reply(m.chat, `➛ Cara pakai\n\n➛ .join <link grup>\n➛ Contoh: .join https://chat.whatsapp.com/xxxxx`, m)
    }

    if (!/chat\.whatsapp\.com\//.test(url)) {
        return conn.reply(m.chat, '➛ Link tidak valid, harus link grup WhatsApp.', m)
    }

    try {
        const code = url.split('chat.whatsapp.com/')[1].split(/[/?]/)[0]
        const groupId = await conn.groupAcceptInvite(code)

        if (groupId) {
            try {
                await conn.sendMessage(groupId, {
                    text: `➛ Halo! Saya ${config.botName}, bot WhatsApp milik ${config.ownerName}. Ketik .menu untuk lihat semua fitur saya!`
                })
            } catch (e) { /* ignore kalau gagal kirim pesan pembuka */ }
        }

        await conn.reply(m.chat, '➛ Berhasil bergabung dengan grup!', m)
    } catch (error) {
        await conn.reply(m.chat, '➛ Gagal join grup. Link mungkin sudah tidak berlaku atau bot sudah pernah di-kick.', m)
    }
}

handler.command = ['join', 'j']
handler.creator = true

export default handler
