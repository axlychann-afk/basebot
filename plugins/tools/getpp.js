let handler = async (m, { conn, args }) => {
    let targetJid = m.quoted?.sender || m.mentionedJid?.[0]

    if (!targetJid && args[0]) {
        const num = args[0].replace(/\D/g, '')
        if (num.length > 5 && num.length < 20) targetJid = num + '@s.whatsapp.net'
    }

    if (!targetJid) targetJid = m.sender

    try {
        const url = await conn.profilePictureUrl(targetJid, 'image')

        await conn.sendMessage(m.chat, {
            image: { url },
            caption: `➛ Akun: @${targetJid.split('@')[0]}`,
            mentions: [targetJid]
        }, { quoted: m })
    } catch (error) {
        await conn.reply(m.chat, '➛ Gagal mengambil foto profil, mungkin akun tidak punya foto profil.', m)
    }
}

handler.command = ['getpp', 'geticon']

export default handler
