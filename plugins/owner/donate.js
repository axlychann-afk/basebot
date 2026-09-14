import config from '../../config.json' with { type: 'json' }

let handler = async (m, { conn }) => {
    await conn.reply(m.chat,
        `「 *DONASI* 」\n\n` +
        `➛ Terima kasih sudah mau support ${config.botName}!\n` +
        `➛ Hubungi ${config.ownerName} lewat .owner untuk info donasi.`, m)
}

handler.command = ['donate', 'donasi']

export default handler
