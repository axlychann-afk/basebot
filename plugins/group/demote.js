let handler = async (m, { conn, args }) => {
    if (!m.isGroup) return conn.reply(m.chat, '➛ Fitur ini hanya untuk grup.', m)

    let targetJid = m.quoted?.sender || m.mentionedJid?.[0]
    if (!targetJid && args[0]) {
        const num = args[0].replace(/\D/g, '')
        if (num.length > 5 && num.length < 20) targetJid = num + '@s.whatsapp.net'
    }

    if (!targetJid) {
        return conn.reply(m.chat, `➛ Kirim/tag/reply akun yang ingin diturunkan.\n➛ Contoh: .demote @6281234567891`, m)
    }

    const meta = conn.chats[m.chat]?.metadata || await conn.groupMetadata(m.chat).catch(() => null)
    if (!meta) return conn.reply(m.chat, '➛ Gagal mengambil data grup.', m)

    const targetNum = targetJid.split('@')[0].split(':')[0]
    const botNum = conn.user?.id?.split('@')[0]?.split(':')[0]

    const participant = meta.participants.find(p => (p.id || '').split('@')[0].split(':')[0] === targetNum)
    const botParticipant = meta.participants.find(p => (p.id || '').split('@')[0].split(':')[0] === botNum)

    if (!participant) {
        return conn.reply(m.chat, '➛ Akun tersebut tidak ada di dalam grup ini.', m)
    }

    if (!participant.admin) {
        return conn.reply(m.chat, '➛ Dia adalah anggota biasa (bukan admin)!', m)
    }

    if (!botParticipant?.admin) {
        return conn.reply(m.chat, '➛ Bot bukan admin di grup ini, tidak bisa menurunkan admin.', m)
    }

    try {
        await conn.groupParticipantsUpdate(m.chat, [participant.id], 'demote')
        await conn.reply(m.chat, '➛ Berhasil diturunkan dari admin menjadi anggota!', m)
    } catch (error) {
        await conn.reply(m.chat, `➛ Gagal menurunkan admin: ${error?.message || error}`, m)
    }
}

handler.command = ['demote']
handler.admin = true

export default handler
