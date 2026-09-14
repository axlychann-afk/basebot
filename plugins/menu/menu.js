import fs from 'fs'
import Jimp from 'jimp'
import config from '../../config.json' with { type: 'json' }
import { plugins } from '../../handler.js'
import { nextAsset } from '../../lib/cycler.js'

const categoryLabel = {
    owner: 'OWNER',
    group: 'GROUP',
    tools: 'TOOLS',
    downloader: 'DOWNLOADER',
    stalker: 'STALKER',
    maker: 'MAKER',
    menu: 'MENU'
}

function buildMenuSections() {
    const grouped = {}
    const seen = new Set()

    for (const [cmd, h] of plugins.entries()) {
        if (typeof cmd !== 'string') continue
        if (seen.has(h)) continue
        seen.add(h)

        const category = h.category || 'lainnya'
        if (!grouped[category]) grouped[category] = []
        grouped[category].push(cmd)
    }

    return Object.keys(grouped).sort().map(category => ({
        title: categoryLabel[category] || category.toUpperCase(),
        highlight_label: `${grouped[category].length} fitur`,
        rows: grouped[category].sort().map(cmd => ({
            header: '',
            title: `.${cmd}`,
            description: '',
            id: `.${cmd}`
        }))
    }))
}

let handler = async (m, { conn }) => {
    const start = Date.now()

    const imagePath = nextAsset('menuImage', './src/img', ['.jpg', '.jpeg', '.png', '.webp']) || './src/img/menu.jpg'
    const image = await Jimp.read(fs.readFileSync(imagePath))
    image.resize(300, 300)
    const thumb = await image.getBufferAsync(Jimp.MIME_JPEG)

    const ping = Date.now() - start
    const runtime = process.uptime()

    const days = Math.floor(runtime / 86400)
    const hours = Math.floor((runtime % 86400) / 3600)
    const minutes = Math.floor((runtime % 3600) / 60)

    const totalPlugin = [...new Set(plugins.values())].length
    const number = m.sender.split('@')[0]

    const menu = `
「 *BOT INFORMATION* 」

➛ Name : ${config.botName}
➛ Type : ESM - Plugin
➛ Dev  : ${config.ownerName}
➛ Ping : ${ping} ms
➛ Status : ${config.botMode.toUpperCase()}
➛ Total Plugin : ${totalPlugin}
➛ Uptime : ${days} Day ${hours} Hour ${minutes} Minute

「 *USER INFORMATION* 」

➛ Name : ${m.pushName || '-'}
➛ Number : +${number}
➛ Status : ${m.isOwner ? 'Owner' : m.isPremium ? 'Premium' : 'Free'}
`.trim()

    await conn.sendMessage(m.chat, {
        buttonsMessage: {
            locationMessage: {
                degreesLatitude: 0,
                degreesLongitude: 0,
                name: config.botName,
                address: 'deuala.zone.id',
                jpegThumbnail: thumb
            },
            contentText: menu,
            footerText: config.ownerName,
            buttons: [
                {
                    buttonId: 'menu',
                    buttonText: {
                        displayText: ' MENU'
                    },
                    type: 1,
                    nativeFlowInfo: {
                        name: 'single_select',
                        paramsJson: JSON.stringify({
                            title: 'Pilih Menu',
                            sections: buildMenuSections()
                        })
                    }
                },
                {
                    buttonId: '.owner',
                    buttonText: {
                        displayText: ' OWNER'
                    },
                    type: 1
                }
            ],
            headerType: 6
        }
    }, {
        quoted: m
    })

    const audioPath = nextAsset('lagu', './src/deaudio', ['.mp3', '.m4a', '.ogg', '.opus'])
    if (audioPath) {
        try {
            const { data, mime } = await conn.getFile(audioPath)
            const mimetype = /ogg|opus/.test(mime) ? 'audio/ogg; codecs=opus'
                : /mp4|m4a/.test(mime) ? 'audio/mp4'
                : 'audio/mpeg'

            await conn.sendMessage(m.chat, {
                audio: data,
                mimetype,
                ptt: true
            }, { quoted: m })
        } catch (e) {
            // file audio bermasalah — jangan sampai bikin .menu ikut gagal
        }
    }
}

handler.command = ['menu', 'help']
handler.category = 'menu'

export default handler
