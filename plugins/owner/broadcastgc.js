import config from '../../config.json' with { type: 'json' }
import { readBlacklist, toggleBlacklist, calculateDelays, convertMsToDuration, sleep } from '../../lib/broadcastHelpers.js'

let handler = async (m, { conn, args, text, command }) => {
    const input = text || m.quoted?.text

    if (args[0]?.toLowerCase() === 'blacklist' && m.isGroup) {
        const added = toggleBlacklist(m.chat)
        return conn.reply(m.chat, added
            ? '➛ Grup ini telah ditambahkan ke blacklist broadcast'
            : '➛ Grup ini telah dihapus dari blacklist broadcast', m)
    }

    if (!input) {
        return conn.reply(m.chat,
            `➛ Cara pakai\n\n➛ .broadcastgc <teks>\n➛ Contoh: .broadcastgc halo, dunia!\n\n` +
            `➛ .broadcastgc blacklist — kecualikan grup ini dari broadcast (jalankan di dalam grup)`, m)
    }

    try {
        const blacklist = readBlacklist()
        const allGroups = await conn.groupFetchAllParticipating()
        const groupJids = Object.values(allGroups)
            .filter(g => !blacklist.includes(g.id) && !g.announce && !g.isCommunity && !g.isCommunityAnnounce)
            .map(g => g.id)

        const { delays, duration } = calculateDelays(groupJids.length)
        const waitMsg = await conn.reply(m.chat, `➛ Mengirim siaran ke ${groupJids.length} grup, perkiraan waktu: ${convertMsToDuration(duration)}`, m)

        let success = 0
        for (let i = 0; i < groupJids.length; i++) {
            try {
                await conn.sendMessage(groupJids[i], {
                    text: input,
                    mentions: command === 'bcht' ? (allGroups[groupJids[i]]?.participants?.map(p => p.id) || []) : undefined,
                    footer: config.botName,
                    buttons: [
                        { buttonId: '.owner', buttonText: { displayText: 'Hubungi Owner' }, type: 1 },
                        { buttonId: '.donate', buttonText: { displayText: 'Donasi' }, type: 1 }
                    ]
                })
                success++
            } catch { /* skip grup yang gagal */ }
            await sleep(delays[i])
        }

        try {
            await conn.sendMessage(m.chat, { text: `➛ Berhasil mengirim ke ${success}/${groupJids.length} grup.`, edit: waitMsg.key })
        } catch {
            await conn.reply(m.chat, `➛ Berhasil mengirim ke ${success}/${groupJids.length} grup.`, m)
        }
    } catch (error) {
        await conn.reply(m.chat, `➛ Terjadi kesalahan: ${error?.message || error}`, m)
    }
}

handler.command = ['broadcastgc', 'bc', 'bcht', 'bcgc', 'broadcast']
handler.owner = true

export default handler
