import net from 'net'
import https from 'https'

function testEdge(host, port) {
    return new Promise(resolve => {
        const start = Date.now()

        const socket = net.createConnection({ host, port, timeout: 8000 })

        socket.once('connect', () => {
            resolve({ ok: true, connectMs: Date.now() - start })
            socket.destroy()
        })

        socket.once('timeout', () => {
            socket.destroy()
            resolve({ ok: false, error: 'timeout' })
        })

        socket.once('error', err => {
            resolve({ ok: false, error: err.message })
        })
    })
}

function rate(ms) {
    if (ms < 50) return '🟢 Sangat cepat'
    if (ms < 150) return '🟡 Cukup baik'
    if (ms < 400) return '🟠 Agak lambat'
    return '🔴 Lambat'
}

function getServerInfo() {
    return new Promise(resolve => {
        const req = https.get('https://ipinfo.io/json', { timeout: 5000 }, res => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try {
                    const json = JSON.parse(data)
                    resolve({ org: json.org, city: json.city, country: json.country })
                } catch {
                    resolve(null)
                }
            })
        })
        req.once('timeout', () => { req.destroy(); resolve(null) })
        req.once('error', () => resolve(null))
    })
}

let handler = async (m, { conn }) => {
    const targets = [
        ['Chat Server', '31.13.80.53'],
        ['Media Server', 'mmg.whatsapp.net'],
        ['Static CDN', 'static.whatsapp.net'],
        ['Gateway', 'g.whatsapp.net']
    ]

    const waitMsg = await conn.reply(m.chat, '➛ Menguji koneksi WhatsApp...', m)

    const [info, ...results] = await Promise.all([
        getServerInfo(),
        ...targets.map(([name, host]) => testEdge(host, 443).then(result => ({ name, host, ...result })))
    ])

    const server = info
        ? `➛ Server : ${info.org || '-'}\n➛ Region : ${info.city ? info.city + ', ' : ''}${info.country || '-'}\n`
        : ''

    let text = `「 *TES KONEKSI WHATSAPP* 」\n\n${server}`
    for (const item of results) {
        text += `\n➛ ${item.name} (${item.host})\n`
        text += item.ok
            ? `➛ TCP : ${item.connectMs}ms — ${rate(item.connectMs)}\n`
            : `➛ Error : ${item.error}\n`
    }

    try {
        await conn.sendMessage(m.chat, { text: text.trim(), edit: waitMsg.key })
    } catch {
        await conn.reply(m.chat, text.trim(), m)
    }
}

handler.command = ['pingwa', 'edgewa', 'testwa']

export default handler
