const deviceMap = {
    ssmobile: 'mobile',
    sstablet: 'tablet',
    ssdesktop: 'desktop',
    ss: 'mobile',
    ssweb: 'desktop'
}

let handler = async (m, { conn, args, command }) => {
    const url = args[0] || (m.quoted?.text?.match(/https?:\/\/\S+/) || [])[0]

    if (!url) {
        return conn.reply(m.chat, `➛ Kirim URL yang ingin di-screenshot.\n➛ Contoh: .screenshot https://deua.zone.id`, m)
    }

    if (!/^https?:\/\//.test(url)) {
        return conn.reply(m.chat, '➛ URL tidak valid.', m)
    }

    const device = deviceMap[command] || 'mobile'

    try {
        const apiUrl = `https://api-nanzz.my.id/docs/api/tools/ssweb.php?url=${encodeURIComponent(url)}&device=${device}`
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json?.status || !json?.result?.screenshot_url) {
            return conn.reply(m.chat, '➛ Gagal mengambil screenshot. Pastikan URL valid dan coba lagi.', m)
        }

        const { screenshot_url, dimensions, size } = json.result

        await conn.sendMessage(m.chat, {
            image: { url: screenshot_url },
            caption:
                `➛ URL     : ${url}\n` +
                `➛ Device  : ${device[0].toUpperCase()}${device.slice(1)}\n` +
                `➛ Dimensi : ${dimensions.width}x${dimensions.height}px\n` +
                `➛ Ukuran  : ${size}`
        }, { quoted: m })
    } catch (error) {
        await conn.reply(m.chat, `➛ Terjadi kesalahan: ${error?.message || error}`, m)
    }
}

handler.command = ['screenshot', 'ss', 'ssmobile', 'sstablet', 'ssdesktop', 'ssweb']

export default handler
