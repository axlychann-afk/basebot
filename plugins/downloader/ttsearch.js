import { searchTikTok, cacheResults } from '../../lib/getdlClient.js'

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, `➛ Cara pakai\n\n➛ .ttsearch <kata kunci>\n➛ Contoh: .ttsearch supra mk4`, m)
    }

    try {
        const { totalResults, results } = await searchTikTok(text)

        if (!results.length) {
            return conn.reply(m.chat, '➛ Tidak ada hasil ditemukan.', m)
        }

        cacheResults(m.chat, results)

        const rows = results.map(r => ({
            header: r.duration,
            title: (r.title || `Video ${r.index}`).slice(0, 60),
            description: `Diunggah: ${r.createdAt}`,
            id: `.ttget ${r.index}`
        }))

        await conn.sendMessage(m.chat, {
            interactiveMessage: {
                body: {
                    text: `「 *HASIL PENCARIAN TIKTOK* 」\n\n➛ Kata kunci : ${text}\n➛ Total hasil : ${totalResults}\n\n➛ Pilih salah satu buat langsung diunduh.`
                },
                footer: { text: 'ttsearch' },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: 'Pilih Video',
                                sections: [
                                    {
                                        title: `Hasil untuk "${text}"`,
                                        rows
                                    }
                                ]
                            })
                        }
                    ]
                }
            }
        }, { quoted: m })
    } catch (error) {
        await conn.reply(m.chat, `➛ Terjadi kesalahan: ${error?.message || error}`, m)
    }
}

handler.command = ['ttsearch', 'tiktoksearch', 'searchtt']
handler.category = 'downloader'

export default handler
