import { sendRich, editRichVideo } from '../../lib/richProgress.js'

let handler = async (m, { conn, args }) => {
    const url = args[0] || (m.quoted?.text?.match(/https?:\/\/\S+/) || [])[0]

    if (!url) {
        return conn.reply(m.chat, `➛ Kirim link Facebook.\n➛ Contoh: .facebookdl https://www.facebook.com/reel/2796711250580249`, m)
    }

    if (!/^https?:\/\//.test(url)) {
        return conn.reply(m.chat, '➛ URL tidak valid.', m)
    }

    try {
        const apiUrl = `https://api.delirius.store/download/facebook?url=${encodeURIComponent(url)}`
        const res = await fetch(apiUrl)
        const json = await res.json()
        const videoUrl = json?.data?.list?.[0]?.url

        if (!videoUrl) {
            return conn.reply(m.chat, '➛ Gagal mengambil video. Pastikan link Facebook valid dan publik.', m)
        }

        try {
            const rich = await sendRich(conn, m.chat, { text: `➛ URL: ${url}\n➛ Memproses video...`, quoted: m })
            await editRichVideo(conn, m.chat, rich, videoUrl)
        } catch {
            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: `➛ URL: ${url}`
            }, { quoted: m })
        }
    } catch (error) {
        await conn.reply(m.chat, `➛ Terjadi kesalahan: ${error?.message || error}`, m)
    }
}

handler.command = ['facebookdl', 'facebook', 'fb', 'fbdl']
handler.category = 'downloader'

export default handler
