const KICK_EMOJI = new Set(['👢', '🥾', '🚷'])
const DELETE_EMOJI = new Set(['🗑️', '🗑', '🚮'])

function normalize(jid) {
    return (jid || '').split('@')[0].split(':')[0]
}

export function bindReactionActions(conn) {
    conn.ev.on('messages.upsert', ({ messages }) => {
        for (const m of messages) {
            (async () => {
                try {
                    const reaction = m.message?.reactionMessage
                    const groupId = m.key?.remoteJid
                    if (!reaction || !groupId?.endsWith('@g.us')) return

                    const emoji = reaction.text
                    const isKick = KICK_EMOJI.has(emoji)
                    const isDelete = DELETE_EMOJI.has(emoji)
                    if (!isKick && !isDelete) return

                    const targetKey = reaction.key
                    if (!targetKey?.id) return

                    const reactorJid = m.key.fromMe ? conn.user.id : (m.key.participant || m.participant)
                    if (!reactorJid) return

                    const meta = conn.chats[groupId]?.metadata || await conn.groupMetadata(groupId).catch(() => null)
                    if (!meta) return

                    const reactorNum = normalize(reactorJid)
                    const reactor = meta.participants.find(p => normalize(p.id) === reactorNum)
                    if (!reactor?.admin && !m.key.fromMe) return // hanya admin/bot sendiri yang boleh trigger

                    const botNum = normalize(conn.user?.id)
                    const botParticipant = meta.participants.find(p => normalize(p.id) === botNum)
                    if (!botParticipant?.admin) return // bot butuh admin buat delete/kick

                    if (isDelete) {
                        await conn.sendMessage(groupId, { delete: targetKey }).catch(() => {})
                        return
                    }

                    if (isKick) {
                        const targetJid = targetKey.participant || targetKey.remoteJid
                        if (!targetJid || normalize(targetJid) === botNum) return

                        await conn.sendMessage(groupId, { delete: targetKey }).catch(() => {})
                        await conn.groupParticipantsUpdate(groupId, [targetJid], 'remove').catch(() => {})
                    }
                } catch (e) {
                    console.error('[ReactionActions]', e?.message || e)
                }
            })()
        }
    })
}
