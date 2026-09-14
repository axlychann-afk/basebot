import { sendRich, editRichImage, editRichVideo } from '../../lib/richProgress.js'

let handler = async (m, { conn, args }) => {
    const url = args[0] || (m.quoted?.text?.match(/https?:\/\/\S+/) || [])[0]

    if (!url) {
        return conn.reply(m.chat, `➛ Kirim link TikTok.\n➛ Contoh: .tiktokdl https://www.tiktok.com/@netflixanime/video/7596931111805078805`, m)
    }

    if (!/^https?:\/\//.test(url)) {
        return conn.reply(m.chat, '➛ URL tidak valid.', m)
    }

    try {
        const primary = await fetch(`https://api.nexray.eu.cc/downloader/tiktok?url=${encodeURIComponent(url)}`)
            .then(r => r.json()).catch(() => null)

        const primaryResult = primary?.status ? primary.result : null

        const primaryHasMedia =
            (typeof primaryResult?.data === 'string' && primaryResult.data.startsWith('http')) ||
            (Array.isArray(primaryResult?.data) && primaryResult.data.length > 0)

        const backup = primaryHasMedia
            ? null
            : await fetch(`https://api.synoxcloud.xyz/download/tiktok?url=${encodeURIComponent(url)}`)
                .then(r => r.json()).catch(() => null)

        const title = primaryResult?.title || backup?.data?.title || '-'
        const author = primaryResult?.author?.fullname || backup?.data?.author || '-'
        const musicUrl = primaryResult?.music_info?.url || null
        const musicTitle = primaryResult?.music_info?.title || 'audio'

        const caption = `➛ Title  : ${title}\n➛ Author : ${author}`

        const validImages = (() => {
            const fromMain = Array.isArray(primaryResult?.data)
                ? primaryResult.data.filter(img => typeof img === 'string' && img.startsWith('http'))
                : []
            if (fromMain.length > 0) return fromMain

            const fromBackup = Array.isArray(backup?.data?.images)
                ? backup.data.images.filter(img => typeof img === 'string' && img.startsWith('http'))
                : []
            return fromBackup
        })()

        if (validImages.length > 0) {
            try {
                const rich = await sendRich(conn, m.chat, { text: `${caption}\n➛ Memproses gambar...`, quoted: m })
                await editRichImage(conn, m.chat, rich, validImages[0])
            } catch {
                await conn.sendMessage(m.chat, { image: { url: validImages[0] }, caption }, { quoted: m })
            }
            for (let i = 1; i < validImages.length; i++) {
                await conn.sendMessage(m.chat, { image: { url: validImages[i] } }, { quoted: m })
            }
            if (musicUrl) {
                await conn.sendFile(m.chat, musicUrl, `${musicTitle}.mp3`, '', m, false)
            }
            return
        }

        const validLinks = (() => {
            const fromMain = typeof primaryResult?.data === 'string' && primaryResult.data.startsWith('http')
                ? [primaryResult.data]
                : []
            if (fromMain.length > 0) return fromMain

            const fromBackup = Array.isArray(backup?.data?.links)
                ? backup.data.links.filter(link =>
                    typeof link === 'string' &&
                    link.startsWith('http') &&
                    !link.includes('play.google.com') &&
                    !link.includes('apps.apple.com')
                )
                : []
            return fromBackup
        })()

        const videoUrl = validLinks[0] || null

        if (videoUrl) {
            try {
                const rich = await sendRich(conn, m.chat, { text: `${caption}\n➛ Memproses video...`, quoted: m })
                await editRichVideo(conn, m.chat, rich, videoUrl)
            } catch {
                await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m })
            }

            if (musicUrl) {
                await conn.sendFile(m.chat, musicUrl, `${musicTitle}.mp3`, '', m, false)
            }
            return
        }

        return conn.reply(m.chat, '➛ Tidak ditemukan media yang valid dari URL tersebut.', m)
    } catch (error) {
        await conn.reply(m.chat, `➛ Terjadi kesalahan: ${error?.message || error}`, m)
    }
}

handler.command = ['tiktokdl', 'tiktok', 'tt', 'ttdl', 'vt', 'vtdl']

export default handler
