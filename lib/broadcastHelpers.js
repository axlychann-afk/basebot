import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../database/broadcastBlacklist.json')

export function readBlacklist() {
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    } catch {
        return []
    }
}

export function writeBlacklist(list) {
    fs.writeFileSync(dbPath, JSON.stringify(list, null, 2))
}

export function toggleBlacklist(groupId) {
    const list = readBlacklist()
    const idx = list.indexOf(groupId)
    if (idx > -1) {
        list.splice(idx, 1)
        writeBlacklist(list)
        return false
    }
    list.push(groupId)
    writeBlacklist(list)
    return true
}

// Staggers a random 2-4s gap between each send so a mass broadcast
// doesn't fire all at once.
export function calculateDelays(count) {
    const delays = Array.from({ length: count }, () => 2000 + Math.floor(Math.random() * 2000))
    const duration = delays.reduce((a, b) => a + b, 0)
    return { delays, duration }
}

export function convertMsToDuration(ms) {
    const totalSec = Math.round(ms / 1000)
    const minutes = Math.floor(totalSec / 60)
    const seconds = totalSec % 60
    if (minutes <= 0) return `${seconds} detik`
    return `${minutes} menit ${seconds} detik`
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
