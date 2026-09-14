import { WAMessageStubType } from '@whiskeysockets/baileys'

const STUB_EMOJI = new Map([
    [WAMessageStubType.GROUP_CREATE, '🎉'],
    [WAMessageStubType.GROUP_PARTICIPANT_ADD, '👋'],
    [WAMessageStubType.GROUP_PARTICIPANT_INVITE, '👋'],
    [WAMessageStubType.GROUP_PARTICIPANT_ADD_REQUEST_JOIN, '👋'],
    [WAMessageStubType.GROUP_PARTICIPANT_REMOVE, '💨'],
    [WAMessageStubType.GROUP_PARTICIPANT_LEAVE, '💨'],
    [WAMessageStubType.GROUP_PARTICIPANT_PROMOTE, '💥'],
    [WAMessageStubType.GROUP_PARTICIPANT_DEMOTE, '🗣'],
    [WAMessageStubType.GROUP_CHANGE_SUBJECT, '📝'],
    [WAMessageStubType.GROUP_CHANGE_DESCRIPTION, '📝'],
    [WAMessageStubType.GROUP_CHANGE_ICON, '🖼️'],
    [WAMessageStubType.GROUP_CHANGE_INVITE_LINK, '🔗'],
    [WAMessageStubType.GROUP_CHANGE_RESTRICT, '🤣'],
    [WAMessageStubType.GROUP_CHANGE_ANNOUNCE, '📢']
])

// Group stub events (participant add/remove/promote/etc) arrive on
// 'messages.upsert' without a `.message` field, so index.js's normal
// command pipeline skips them entirely. This listens independently.
export function bindGroupNotify(conn) {
    conn.ev.on('messages.upsert', ({ messages }) => {
        for (const m of messages) {
            (async () => {
                try {
                    if (!m?.key?.remoteJid || m.messageStubType == null) return

                    const emoji = STUB_EMOJI.get(m.messageStubType)
                    if (!emoji) return

                    await conn.sendMessage(m.key.remoteJid, {
                        react: { text: emoji, key: m.key }
                    })
                } catch (e) {
                    console.error('[GroupNotify]', e?.message || e)
                }
            })()
        }
    })
}
