import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const statePath = path.join(__dirname, '../database/cycle.json')

function readState() {
    try {
        return JSON.parse(fs.readFileSync(statePath, 'utf8'))
    } catch {
        return {}
    }
}

function writeState(state) {
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2))
}

// Sorts filenames naturally by the number embedded in them, so
// "deua.mp3, deua1.mp3, deua2.mp3, ..., deua10.mp3" ends up in
// the intended top-to-bottom order instead of alphabetical order.
export function naturalSort(files) {
    return files.slice().sort((a, b) => {
        const na = parseInt(a.match(/\d+/)?.[0] || '0', 10)
        const nb = parseInt(b.match(/\d+/)?.[0] || '0', 10)
        return na - nb
    })
}

export function listAssets(dir, extensions) {
    if (!fs.existsSync(dir)) return []
    const files = fs.readdirSync(dir).filter(f => extensions.some(ext => f.toLowerCase().endsWith(ext)))
    return naturalSort(files)
}

// Returns the next file path in the cycle for the given key, wrapping
// back to the top once the bottom of the list is reached.
export function nextAsset(key, dir, extensions) {
    const files = listAssets(dir, extensions)
    if (!files.length) return null

    const state = readState()
    const current = Number.isInteger(state[key]) ? state[key] : -1
    const next = (current + 1) % files.length

    state[key] = next
    writeState(state)

    return path.join(dir, files[next])
}
