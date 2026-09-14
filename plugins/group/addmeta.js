let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '➛ Fitur ini hanya untuk grup.', m)

    try {
        await conn.groupParticipantsUpdate(m.chat, ['867051314767696@bot'], 'add')
        await conn.reply(m.chat, '➛ Berhasil menambahkan Meta AI ke grup!', m)
    } catch (error) {
        await conn.reply(m.chat, `➛ Gagal menambahkan Meta AI: ${error?.message || error}`, m)
    }
}

handler.command = ['addmeta', 'addai']
handler.admin = true

export default handler
