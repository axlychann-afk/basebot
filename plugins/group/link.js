let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '➛ Fitur ini hanya untuk grup.', m)

    try {
        const code = await conn.groupInviteCode(m.chat)
        await conn.reply(m.chat, `➛ https://chat.whatsapp.com/${code}`, m)
    } catch (error) {
        await conn.reply(m.chat, '➛ Gagal mengambil link grup. Pastikan bot adalah admin.', m)
    }
}

handler.command = ['link', 'gclink', 'grouplink']

export default handler
