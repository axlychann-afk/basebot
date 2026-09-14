import config from '../../config.json' with { type: 'json' }
import { readBlacklist, toggleBlacklist, calculateDelays, convertMsToDuration, sleep } from '../../lib/broadcastHelpers.js'

let handler = async (m, { conn, args, text }) => {
    const input = text || m.quoted?.text
    const mediaType = ['imageMessage', 'videoMessage'].includes(m.quoted?.mtype)
        ? m.quoted.mtype.replace('Message', '')
        : null

    if (args[0]?.toLowerCase() === 'blacklist' && m.isGroup) {
        const added = toggleBlacklist(m.chat)
        return conn.reply(m.chat, added
            ? '➛ Grup ini telah ditambahkan ke blacklist broadcast'
            : '➛ Grup ini telah dihapus dari blacklist broadcast', m)
    }

    if (!input && !mediaType) {
        return conn.reply(m.chat,
            `➛ Cara pakai\n\n➛ .swgc <teks>\n➛ Atau reply gambar/video + .swgc <caption>\n\n` +
            `➛ .swgc blacklist — kecualikan grup ini dari broadcast (jalankan di dalam grup)`, m)
    }

    try {
        const blacklist = readBlacklist()
        const allGroups = await conn.groupFetchAllParticipating()
        const groupJids = Object.values(allGroups)
            .filter(g => !blacklist.includes(g.id) && !g.announce && !g.isCommunity && !g.isCommunityAnnounce)
            .map(g => g.id)

        let content
        if (mediaType) {
            const buffer = await m.quoted.download()
            content = { [mediaType]: buffer, caption: input }
        } else {
            content = { text: input }
        }

        const { delays, duration } = calculateDelays(groupJids.length)
        const waitMsg = await conn.reply(m.chat, `➛ Mengirim status ke ${groupJids.length} grup, perkiraan waktu: ${convertMsToDuration(duration)}`, m)

        let success = 0
        for (let i = 0; i < groupJids.length; i++) {
            try {
                await conn.sendMessage(groupJids[i], {
                    ...content,
                    contextInfo: {
                        statusAudienceMetadata: {
                            audienceType: 1,
                            listName: config.botName,
                            listEmoji: '🏷️'
                        }
                    },
                    groupStatus: true
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

handler.command = ['swgc', 'swgcall', 'broadcastgcsw', 'bcgcsw', 'bcswgc']
handler.owner = true

export default handler
