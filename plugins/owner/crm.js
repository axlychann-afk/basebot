import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, command }) => {
    if (!m.quoted) {
        return conn.reply(m.chat,
            `➛ Harus reply pesan dulu!\n\n` +
            `➛ Reply pesan → ketik .crm\n` +
            `➛ Reply pesan → ketik .crm <jid> (kirim ke chat lain)\n` +
            `➛ Reply pesan → ketik .rawjson (lihat raw JSON)\n\n` +
            `➛ Mendukung: button, media, sticker, text, dll`, m)
    }

    const rawQuotedMessage = m.quoted?.fakeObj?.message || null

    if (!rawQuotedMessage) {
        return conn.reply(m.chat, '➛ Tidak dapat mengambil raw message.\n\n➛ Coba gunakan .rawjson untuk melihat struktur quoted.', m)
    }

    if (command === 'rawjson' || command === 'rawijson') {
        const json = JSON.stringify(rawQuotedMessage, null, 2)
        if (json.length > 3500) {
            await conn.sendMessage(m.chat, {
                document: Buffer.from(json),
                mimetype: 'application/json',
                fileName: `${Date.now()}.json`,
                caption: `➛ Raw Quoted Message JSON\n➛ mtype: ${m.quoted?.mtype ?? 'unknown'}\n➛ size: ${json.length} chars`
            }, { quoted: m })
        } else {
            await conn.reply(m.chat, `➛ Raw Quoted Message\n➛ mtype: ${m.quoted?.mtype ?? 'unknown'}\n\n\`\`\`json\n${json}\n\`\`\``, m)
        }
        return
    }

    let targetJid = m.chat
    if (args[0]) {
        const argJid = args[0].trim()
        if (/^\d+$/.test(argJid)) {
            targetJid = `${argJid}@s.whatsapp.net`
        } else if (/^\d+@/.test(argJid) || argJid.includes('@g.us') || argJid.includes('@newsletter')) {
            targetJid = argJid
        } else {
            return conn.reply(m.chat, `➛ JID tidak valid: ${argJid}\n\n➛ Contoh:\n➛ 628xxx → nomor WA\n➛ 120363xxx@g.us → grup`, m)
        }
    }

    const isInteractive = !!rawQuotedMessage?.interactiveMessage
    const interactiveNodes = [
        {
            tag: 'biz',
            attrs: {},
            content: [
                {
                    tag: 'interactive',
                    attrs: { type: 'native_flow', v: '1' },
                    content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
                }
            ]
        }
    ]

    try {
        const generatedMsg = generateWAMessageFromContent(targetJid, rawQuotedMessage, { userJid: conn.user?.id ?? '' })
        const relayOptions = { messageId: generatedMsg.key.id }
        if (isInteractive) relayOptions.additionalNodes = interactiveNodes
        await conn.relayMessage(targetJid, generatedMsg.message, relayOptions)
        if (targetJid !== m.chat) {
            await conn.reply(m.chat, `➛ Berhasil relay pesan!\n➛ Tipe: ${m.quoted?.mtype ?? 'unknown'}\n➛ Tujuan: ${targetJid}`, m)
        }
    } catch (err1) {
        try {
            const fallbackOptions = isInteractive ? { additionalNodes: interactiveNodes } : {}
            await conn.relayMessage(targetJid, rawQuotedMessage, fallbackOptions)
            if (targetJid !== m.chat) {
                await conn.reply(m.chat, `➛ Relay berhasil\n➛ Tujuan: ${targetJid}`, m)
            }
        } catch (err2) {
            return conn.reply(m.chat, `➛ Relay gagal!\n\n➛ Error: ${err2?.message || err2}\n\n➛ Coba .rawjson untuk lihat struktur pesan.`, m)
        }
    }

    try {
        const json = JSON.stringify(rawQuotedMessage, null, 2)
        const mtype = m.quoted?.mtype ?? 'unknown'
        await conn.sendMessage(m.chat, {
            document: Buffer.from(json),
            mimetype: 'application/json',
            fileName: `${mtype}.json`
        }, { quoted: m })
    } catch (jsonErr) {
        await conn.reply(m.chat, `➛ Relay sukses tapi gagal kirim JSON:\n${jsonErr?.message || jsonErr}`, m)
    }
}

handler.command = ['crm', 'rawjson', 'rawijson']
handler.creator = true

export default handler
