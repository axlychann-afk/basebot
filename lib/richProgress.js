import { AIRich } from './richMessage.js'

// Sends a placeholder AIRich message (e.g. "Sedang memproses...") and
// returns the AIRich instance so editRich() can update it in place.
export async function sendRich(conn, jid, { text, quoted } = {}) {
    const ai = new AIRich(conn)
    if (text) ai.addText(text)

    const msg = await ai.send(jid, quoted ? { quoted } : {})
    return { ai, key: msg.key }
}

export async function editRichImage(conn, jid, rich, imageUrl, opts = {}) {
    rich.ai.addImage(imageUrl, opts)
    return rich.ai.sendEdit(jid, rich.key.id)
}

export async function editRichVideo(conn, jid, rich, videoUrl, opts = {}) {
    rich.ai.addVideo(videoUrl, opts)
    return rich.ai.sendEdit(jid, rich.key.id)
}

export async function editRichText(conn, jid, rich, text) {
    rich.ai.addText(text)
    return rich.ai.sendEdit(jid, rich.key.id)
}
