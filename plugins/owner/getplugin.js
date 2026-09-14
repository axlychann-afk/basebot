import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { AIRich } from '../../lib/richMessage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let handler = async (m, { conn, args }) => {
    const query = (args[0] || '').toLowerCase()
    if (!query) {
        return conn.reply(m.chat, `➛ Cara pakai\n\n➛ .getplugin <nama_file>\n➛ Contoh: .getplugin menu`, m)
    }

    let targetFile = null
    const pluginsDir = path.resolve(__dirname, '../../plugins')

    const scanDir = dir => {
        for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file)
            if (fs.statSync(fullPath).isDirectory()) {
                scanDir(fullPath)
                continue
            }
            if (file.toLowerCase() === `${query}.js`) {
                targetFile = fullPath
                return
            }
        }
    }

    scanDir(pluginsDir)

    if (!targetFile) return conn.reply(m.chat, `➛ Plugin "${query}" tidak ditemukan.`, m)

    const source = fs.readFileSync(targetFile, 'utf8')
    const relativePath = path.relative(pluginsDir, targetFile)

    try {
        await new AIRich(conn)
            .addText(`➛ ${path.basename(targetFile)}\n➛ Path: plugins/${relativePath}`)
            .addCode('javascript', source)
            .send(m.chat)
    } catch (error) {
        await conn.sendMessage(m.chat, {
            document: Buffer.from(source),
            mimetype: 'application/javascript',
            fileName: path.basename(targetFile),
            caption: `➛ ${path.basename(targetFile)}\n➛ Path: plugins/${relativePath}`
        }, { quoted: m })
    }
}

handler.command = ['getplugin', 'getp', 'source']
handler.creator = true

export default handler
