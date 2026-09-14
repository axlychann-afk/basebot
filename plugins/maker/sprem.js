let handler = async (m, { conn }) => {
    const quoted = m.quoted?.fakeObj?.message?.stickerMessage

    if (!quoted || !quoted.url) {
        return conn.reply(m.chat, '➛ Reply ke stiker yang mau dijadikan stiker premium!', m)
    }

    try {
        await conn.relayMessage(
            m.chat,
            {
                messageContextInfo: {
                    messageSecret: 'rme8dNt3wUoOXIqw5rIpoHsnCSGJtcy/kMJVsBfyukA='
                },
                lottieStickerMessage: {
                    message: {
                        stickerMessage: {
                            url: quoted.url,
                            fileSha256: quoted.fileSha256,
                            fileEncSha256: quoted.fileEncSha256,
                            mediaKey: quoted.mediaKey,
                            mimetype: quoted.mimetype || 'image/webp',
                            height: quoted.height,
                            width: quoted.width,
                            directPath: quoted.directPath,
                            fileLength: quoted.fileLength,
                            mediaKeyTimestamp: quoted.mediaKeyTimestamp,
                            isAnimated: quoted.isAnimated || false,
                            stickerSentTs: quoted.stickerSentTs || Date.now(),
                            isAvatar: quoted.isAvatar || false,
                            isAiSticker: quoted.isAiSticker || false,
                            isLottie: quoted.isLottie || false,
                            premium: 1
                        }
                    }
                }
            },
            {}
        )

        await conn.sendMessage(m.chat, { react: { text: '⭐', key: m.key } })
    } catch (error) {
        await conn.reply(m.chat, '➛ Gagal membuat stiker premium. Pastikan yang di-reply benar-benar stiker.', m)
    }
}

handler.command = ['sprem', 'stikerpremium', 'premstiker']

export default handler
