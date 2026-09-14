import config from '../../config.json' with { type: 'json' }

let handler = async (m, { conn }) => {
    const number = config.creator[0]
    const name = config.ownerName

    const vcard = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:;${name};;;`,
        `FN:${name}`,
        `ORG:${config.botName};`,
        `TEL;type=CELL;type=VOICE;waid=${number}:+${number}`,
        'END:VCARD'
    ].join('\n')

    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: name,
            contacts: [{ vcard }]
        }
    }, { quoted: m })
}

handler.command = ['owner', 'creator', 'dev']

export default handler
