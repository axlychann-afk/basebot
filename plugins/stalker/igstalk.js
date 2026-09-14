let handler = async (m, { conn, args }) => {
    try {
        const username = (args[0] || '').replace('@', '')

        if (!username) {
            return conn.reply(m.chat, `➛ Instagram Stalker\n\n➛ Cara pakai: .igstalk <username>\n➛ Contoh: .igstalk kersenify666`, m)
        }

        await conn.reply(m.chat, `➛ Mengambil info akun @${username}...`, m)

        const apiUrl = `https://api-nanzz.my.id/docs/api/stalker/ig-stalk.php?username=${encodeURIComponent(username)}`
        const res = await fetch(apiUrl)
        const data = await res.json()

        if (!data?.status || !data?.result) {
            return conn.reply(m.chat, '➛ Gagal mengambil data. Pastikan username Instagram valid.', m)
        }

        const r = data.result
        const s = r.stats

        const caption =
            `➛ Instagram Stalker\n\n` +
            `➛ Username  : @${r.username}\n` +
            `➛ Nama      : ${r.full_name || '-'}\n` +
            `➛ Bio       : ${r.bio ? r.bio.replace(/\n/g, ' ') : '-'}\n` +
            `➛ Followers : ${s.followers.toLocaleString('id-ID')}\n` +
            `➛ Following : ${s.following.toLocaleString('id-ID')}\n` +
            `➛ Posts     : ${s.posts.toLocaleString('id-ID')}\n` +
            `➛ Private   : ${r.is_private ? 'Ya' : 'Tidak'}\n` +
            `➛ Verified  : ${r.is_verified ? 'Ya' : 'Tidak'}\n` +
            `➛ URL       : ${r.external_url || '-'}`

        await conn.sendMessage(m.chat, {
            image: { url: r.profile_pic },
            caption
        }, { quoted: m })
    } catch (error) {
        await conn.reply(m.chat, `➛ Terjadi kesalahan: ${error?.message || error}`, m)
    }
}

handler.command = ['igstalk', 'iginfo', 'stalkig']

export default handler
