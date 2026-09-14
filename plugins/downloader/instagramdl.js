import { sendRich, editRichImage, editRichVideo } from '../../lib/richProgress.js'

let handler = async (m, { conn, args }) => {
    const url = args[0] || (m.quoted?.text?.match(/https?:\/\/\S+/) || [])[0]

    if (!url) {
        return conn.reply(m.chat, `➛ Kirim link Instagram.\n➛ Contoh: .instagramdl https://www.instagram.com/p/DVKVfnVjyep`, m)
    }

    if (!/^https?:\/\//.test(url)) {
        return conn.reply(m.chat, '➛ URL tidak valid.', m)
    }

    try {
        const apiUrl = `https://api.delirius.store/download/instagram?url=${encodeURIComponent(url)}`
        const res = await fetch(apiUrl)
        const json = await res.json()
        const items = json?.data

        if (!Array.isArray(items) || !items.length) {
            return conn.reply(m.chat, '➛ Gagal mengambil media. Pastikan link Instagram valid dan publik.', m)
        }

        const first = items[0]
        try {
            const rich = await sendRich(conn, m.chat, { text: `➛ URL: ${url}\n➛ Memproses media...`, quoted: m })
            if (first.type === 'video') {
                await editRichVideo(conn, m.chat, rich, first.url)
            } else {
                await editRichImage(conn, m.chat, rich, first.url)
            }
        } catch {
            const mtype = first.type === 'video' ? 'video' : 'image'
            await conn.sendMessage(m.chat, {
                [mtype]: { url: first.url },
                caption: `➛ URL: ${url}`
            }, { quoted: m })
        }

        for (let i = 1; i < items.length; i++) {
            const item = items[i]
            const mtype = item.type === 'video' ? 'video' : 'image'
            await conn.sendMessage(m.chat, { [mtype]: { url: item.url } }, { quoted: m })
        }
    } catch (error) {
        await conn.reply(m.chat, `➛ Terjadi kesalahan: ${error?.message || error}`, m)
    }
}

handler.command = ['instagramdl', 'ig', 'igdl', 'instagram']
handler.category = 'downloader'

export default handler
