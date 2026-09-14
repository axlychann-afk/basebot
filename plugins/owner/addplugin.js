import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, args, text }) => {
    const category = args[0]
    const fileName = args[1]
    const code = m.quoted?.text || text.split(/ +/).slice(2).join(' ')

    if (!category || !fileName || !code || code.trim().length < 10) {
        return conn.reply(m.chat,
            `➛ Cara pakai\n\n` +
            `➛ Reply kode plugin, lalu ketik:\n` +
            `➛ .addplugin <kategori> <namafile>\n\n` +
            `➛ Atau langsung:\n` +
            `➛ .addplugin <kategori> <namafile> <kode>\n\n` +
            `➛ Kode plugin harus punya "handler.command = [...]" seperti plugin lain di bot ini.`, m)
    }

    if (!/handler\.command\s*=/.test(code)) {
        return conn.reply(m.chat, '➛ Kode tidak valid! Plugin harus mendefinisikan handler.command = [...].', m)
    }

    try {
        const cmdDir = path.resolve(__dirname, '../../plugins', category.toLowerCase())
        const filePath = path.join(cmdDir, `${fileName.replace(/[^a-zA-Z0-9_-]/g, '')}.js`)

        if (!fs.existsSync(cmdDir)) fs.mkdirSync(cmdDir, { recursive: true })
        const isNew = !fs.existsSync(filePath)

        fs.writeFileSync(filePath, code, 'utf-8')

        await conn.reply(m.chat,
            `➛ Plugin ${isNew ? 'ditambahkan' : 'diperbarui'}!\n\n` +
            `➛ Nama: ${fileName}\n` +
            `➛ Kategori: ${category}\n` +
            `➛ Path: plugins/${category}/${fileName}.js`, m)
    } catch (error) {
        await conn.reply(m.chat, `➛ Gagal menyimpan plugin.\n\n${error?.message || error}`, m)
    }
}

handler.command = ['addplugin', 'editplugin', 'saveplugin']
handler.creator = true

export default handler
