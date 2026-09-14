let handler = async (m, { conn, text }) => {
    if (!m.isGroup) return conn.reply(m.chat, '➛ Fitur ini hanya untuk grup.', m)

    const meta = conn.chats[m.chat]?.metadata || await conn.groupMetadata(m.chat).catch(() => null)
    if (!meta) return conn.reply(m.chat, '➛ Gagal mengambil data grup.', m)

    const mentions = meta.participants.map(p => p.id)
    const body = text || m.quoted?.text || '>ᴗ< Halo, Dunia!'

    await conn.sendMessage(m.chat, {
        text: body,
        mentions
    }, { quoted: m })
}

handler.command = ['hidetag', 'h', 'ht']
handler.admin = true

export default handler
