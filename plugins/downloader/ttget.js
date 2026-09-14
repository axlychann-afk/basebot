import { getCachedResult, fetchBuffer } from '../../lib/getdlClient.js'

let handler = async (m, { conn, args }) => {
    const index = parseInt(args[0], 10)

    if (!index || index < 1) {
        return conn.reply(m.chat, `➛ Cara pakai\n\n➛ .ttsearch <kata kunci> dulu\n➛ Lalu: .ttget <nomor>`, m)
    }

    const result = getCachedResult(m.chat, index)

    if (!result) {
        return conn.reply(m.chat, '➛ Nomor tidak ditemukan, lakukan .ttsearch dulu.', m)
    }

    if (!result.playUrl) {
        return conn.reply(m.chat, '➛ Video ini tidak punya link yang bisa diunduh.', m)
    }

    try {
        const buffer = await fetchBuffer(result.playUrl)
        await conn.sendMessage(m.chat, {
            video: buffer,
            caption: `➛ ${result.title || '-'}\n➛ Durasi: ${result.duration}`
        }, { quoted: m })
    } catch (error) {
        await conn.reply(m.chat, `➛ Gagal mengunduh: ${error?.message || error}`, m)
    }
}

handler.command = ['ttget', 'tget']

export default handler
