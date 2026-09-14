const BASE_URL = 'https://getdl.space'

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
}

function parseCookies(res) {
    const raw = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []
    return raw.map(c => c.split(';')[0]).join('; ')
}

async function getSession() {
    const res = await fetch(`${BASE_URL}/api/session`, {
        headers: { ...HEADERS, Referer: `${BASE_URL}/id/search/tiktok`, Origin: BASE_URL }
    })
    const cookie = parseCookies(res)
    const json = await res.json()
    if (!json?.success || !json.sessionId) throw new Error('Gagal inisialisasi session pencarian')
    return { sessionId: json.sessionId, cookie }
}

export async function searchTikTok(query, count = 10, region = 'ID') {
    const { sessionId, cookie } = await getSession()

    const res = await fetch(`${BASE_URL}/api/search/tiktok`, {
        method: 'POST',
        headers: {
            ...HEADERS,
            'Content-Type': 'application/json',
            Referer: `${BASE_URL}/id/search/tiktok`,
            Origin: BASE_URL,
            ...(cookie ? { Cookie: cookie } : {})
        },
        body: JSON.stringify({ query, count, cursor: 0, region, sessionId, sortType: 0 })
    })

    if (!res.ok) throw new Error(`Server menolak request (Status: ${res.status})`)
    const json = await res.json()
    if (!json?.success) throw new Error('Pencarian gagal, coba lagi nanti')

    const { totalResults, videos } = json.data
    const results = (videos || []).map((v, i) => ({
        index: i + 1,
        title: v.title,
        duration: `${v.duration}s`,
        playUrl: v.playUrl,
        coverUrl: v.cover,
        createdAt: new Date(v.createdAt).toLocaleString('id-ID')
    }))

    return { totalResults, results }
}

export async function downloadFromUrl(targetUrl) {
    const res = await fetch(`${BASE_URL}/api/download`, {
        method: 'POST',
        headers: {
            ...HEADERS,
            'Content-Type': 'application/json',
            Referer: `${BASE_URL}/id`,
            Origin: BASE_URL
        },
        body: JSON.stringify({ url: targetUrl })
    })
    if (!res.ok) throw new Error(`Server menolak request (Status: ${res.status})`)
    return res.json()
}

export async function fetchBuffer(url) {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) throw new Error(`Gagal mengambil media (Status: ${res.status})`)
    return Buffer.from(await res.arrayBuffer())
}

// In-memory cache so `.ttget <nomor>` can find what `.ttsearch` just listed.
// Not persisted on purpose — search results are only relevant for the session.
const searchCache = new Map()

export function cacheResults(chatId, results) {
    searchCache.set(chatId, results)
}

export function getCachedResult(chatId, index) {
    const results = searchCache.get(chatId)
    return results?.[index - 1] || null
}
