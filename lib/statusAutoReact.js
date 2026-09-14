// Auto-reacts to every contact's WA status/story with a fixed emoji.
// Always on — not a toggleable feature.
const REACT_EMOJI = '🔥'

// status@broadcast updates are filtered out before index.js's normal
// command pipeline, so this listens independently for them.
export function bindStatusAutoReact(conn) {
    conn.ev.on('messages.upsert', ({ messages }) => {
        for (const m of messages) {
            (async () => {
                try {
                    if (!m?.key || m.key.remoteJid !== 'status@broadcast' || m.key.fromMe) return

                    await conn.sendMessage('status@broadcast', {
                        react: { text: REACT_EMOJI, key: m.key }
                    }, { statusJidList: [m.key.participant] })
                } catch (e) {
                    console.error('[StatusAutoReact]', e?.message || e)
                }
            })()
        }
    })
}
