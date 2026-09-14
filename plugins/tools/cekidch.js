import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import config from '../../config.json' with { type: 'json' }

let handler = async (m, { conn, args }) => {
    if (!args[0]) {
        return conn.reply(
            m.chat,
            '➛ Masukkan URL channel!\n\n➛ Contoh:\n.idch https://whatsapp.com/channel/xxxxxxxx',
            m
        )
    }

    try {
        const code = args[0]
            .split('/channel/')[1]
            ?.split('?')[0]
            ?.split('/')[0]

        if (!code) {
            return conn.reply(
                m.chat,
                '➛ Link channel tidak valid',
                m
            )
        }

        const res = await conn.newsletterMetadata(
            'invite',
            code
        ).catch(() => null)

        if (!res) {
            return conn.reply(
                m.chat,
                '➛ Channel tidak ditemukan',
                m
            )
        }

        const teks = `「 *CHANNEL INFO* 」

➛ Nama : ${res.name || '-'}
➛ ID : ${res.id || '-'}
➛ Pengikut : ${Number(res.subscribers || 0).toLocaleString('id-ID')}
➛ Status : ${res.state || '-'}
➛ Verifikasi : ${res.verification === 'VERIFIED' ? 'Ya' : 'Tidak'}`

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage:
                            proto.Message.InteractiveMessage.create({
                                body: {
                                    text: teks
                                },

                                footer: {
                                    text: config.botName
                                },

                                nativeFlowMessage: {
                                    buttons: [
                                        {
                                            name: 'cta_copy',

                                            buttonParamsJson:
                                                JSON.stringify({
                                                    display_text:
                                                        'Salin ID Channel',

                                                    copy_code:
                                                        res.id || ''
                                                })
                                        }
                                    ]
                                }
                            })
                    }
                }
            },
            {
                userJid: conn.user.id,
                quoted: m
            }
        )

        await conn.relayMessage(
            m.chat,
            msg.message,
            {
                messageId: msg.key.id
            }
        )

    } catch (e) {
        console.error(e)

        await conn.reply(
            m.chat,
            `➛ Gagal mengambil data channel\n\n${e.message}`,
            m
        )
    }
}

handler.command = [
    'idch',
    'cekidch'
]

export default handler