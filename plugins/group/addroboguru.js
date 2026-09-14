let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '➛ Fitur ini hanya untuk grup.', m)

    try {
        await conn.groupParticipantsUpdate(m.chat, ['6281578150000@bot'], 'add')
        await conn.reply(m.chat, '➛ Berhasil menambahkan Roboguru ke grup!', m)
    } catch (error) {
        await conn.reply(m.chat, `➛ Gagal menambahkan Roboguru: ${error?.message || error}`, m)
    }
}

handler.command = ['addroboguru', 'addrobo']
handler.admin = true

export default handler
