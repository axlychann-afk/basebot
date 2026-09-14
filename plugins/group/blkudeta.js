import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../../database/kudetaWhitelist.json')

function readDb() {
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    } catch {
        return {}
    }
}

function writeDb(db) {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

let handler = async (m, { conn, args }) => {
    if (!m.isGroup) return conn.reply(m.chat, '➛ Fitur ini hanya untuk grup.', m)

    const db = readDb()
    const groupId = m.chat
    if (!db[groupId]) db[groupId] = []

    const action = (args[0] || '').toLowerCase()

    if (action === 'list') {
        const whitelist = db[groupId]
        if (whitelist.length === 0) {
            return conn.reply(m.chat, `➛ Whitelist Kudeta\n\nBelum ada nomor yang di-whitelist.\n➛ Gunakan: .blkudeta @tag`, m)
        }
        let text = `➛ Whitelist Kudeta\n\n`
        whitelist.forEach((jid, i) => { text += `➛ ${i + 1}. @${jid.split('@')[0]}\n` })
        text += `\n➛ Total: ${whitelist.length} nomor\n➛ Hapus: .blkudeta del @tag`
        return conn.sendMessage(m.chat, { text, mentions: whitelist }, { quoted: m })
    }

    if (['del', 'delete', 'rm', 'remove'].includes(action)) {
        let targetJid = m.quoted?.sender || m.mentionedJid?.[0]
        if (!targetJid && args[1]) {
            const num = args[1].replace(/\D/g, '')
            if (num.length > 5 && num.length < 20) targetJid = num + '@s.whatsapp.net'
        }

        if (!targetJid) {
            return conn.reply(m.chat, `➛ Cara pakai\n\n.blkudeta del @tag\nAtau reply pesan + .blkudeta del`, m)
        }

        const targetNum = targetJid.replace(/\D/g, '')
        const idx = db[groupId].findIndex(jid => jid.replace(/\D/g, '') === targetNum)

        if (idx === -1) {
            return conn.sendMessage(m.chat, { text: `➛ Tidak ditemukan!\n\n@${targetJid.split('@')[0]} tidak ada di whitelist.`, mentions: [targetJid] }, { quoted: m })
        }

        db[groupId].splice(idx, 1)
        writeDb(db)
        return conn.sendMessage(m.chat, { text: `➛ Dihapus\n\n@${targetJid.split('@')[0]} dihapus dari whitelist.`, mentions: [targetJid] }, { quoted: m })
    }

    let targetJid = m.quoted?.sender || m.mentionedJid?.[0]
    if (!targetJid && args[0]) {
        const num = args[0].replace(/\D/g, '')
        if (num.length > 5 && num.length < 20) targetJid = num + '@s.whatsapp.net'
    }

    if (!targetJid) {
        return conn.reply(m.chat,
            `➛ Whitelist Kudeta\n\n` +
            `Proteksi nomor dari fitur .kudeta\n\n` +
            `➛ .blkudeta @tag — Tambah\n` +
            `➛ .blkudeta list — Lihat daftar\n` +
            `➛ .blkudeta del @tag — Hapus`, m)
    }

    const targetNum = targetJid.replace(/\D/g, '')
    const exists = db[groupId].some(jid => jid.replace(/\D/g, '') === targetNum)

    if (exists) {
        return conn.sendMessage(m.chat, { text: `➛ Sudah ada\n\n@${targetJid.split('@')[0]} sudah di whitelist.`, mentions: [targetJid] }, { quoted: m })
    }

    db[groupId].push(targetJid)
    writeDb(db)
    return conn.sendMessage(m.chat, {
        text: `➛ Ditambahkan\n\n@${targetJid.split('@')[0]} ditambahkan ke whitelist, nomor ini dilindungi dari .kudeta.\n\n➛ Total whitelist: ${db[groupId].length}`,
        mentions: [targetJid]
    }, { quoted: m })
}

handler.command = ['blkudeta', 'kudetawl', 'kudetawhitelist', 'wlkudeta']
handler.creator = true

export default handler
