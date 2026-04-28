// Vercel Edge Function — ICY (Icecast/Shoutcast) metadata proxy.
//
// Browsers can't read ICY metadata directly because:
//   1. The Icy-MetaData request header is non-standard and browsers don't
//      send it for <audio> requests.
//   2. The metadata is interleaved with audio bytes — not exposed by <audio>.
//   3. CORS prevents JS from reading raw cross-origin stream bytes.
//
// We fetch the stream server-side, request interleaved metadata, walk the
// `metaInt`-byte cycles until we find a non-empty StreamTitle, then return
// JSON with CORS open. The result is cached for 15s at the edge.

export const config = { runtime: 'edge' }

const ALLOWED_HOSTS = new Set([
  '29073.live.streamtheworld.com',
  '28563.live.streamtheworld.com',
  '27873.live.streamtheworld.com',
  'playerservices.streamtheworld.com',
  'glzwizzlv.bynetcdn.com',
  'glzicylv01.bynetcdn.com',
  '102.livecdn.biz',
  '1075.livecdn.biz',
  'cdn.cybercdn.live',
  'eco-live.mediacast.co.il',
  'media2.93fm.co.il',
  'mzr.mediacast.co.il',
  'cdna.streamgates.net'
])

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=15, s-maxage=15'
}

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status || 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init.headers || {})
    }
  })
}

// Decode metadata bytes. Most streams use UTF-8; some Israeli streams use
// CP1255 (Windows Hebrew). Try UTF-8 first and fall back to CP1255 if the
// result contains the U+FFFD replacement char or no Hebrew at all when the
// raw bytes look like CP1255.
function decodeIcy(bytes) {
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/\0+$/, '')
  if (!utf8.includes('�')) return utf8
  try {
    return new TextDecoder('windows-1255', { fatal: false }).decode(bytes).replace(/\0+$/, '')
  } catch { return utf8 }
}

function parseStreamTitle(bytes) {
  const text = decodeIcy(bytes)
  const m = text.match(/StreamTitle='([^']*)'/)
  return m ? m[1].trim() : ''
}

// Many Israeli stations broadcast generic CDN strings instead of song titles.
// Treat those as "no title" so the UI doesn't show noise.
const JUNK_PATTERNS = [
  /CDN\s*-\s*Powered/i,
  /Multix Technologies/i,
  /^This is my server/i,
  /^stream\.?$/i
]
function isJunkTitle(t) {
  return JUNK_PATTERNS.some((re) => re.test(t))
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })

  const target = new URL(req.url).searchParams.get('url')
  if (!target) return json({ error: 'missing url param' }, { status: 400 })

  let parsed
  try { parsed = new URL(target) } catch { return json({ error: 'invalid url' }, { status: 400 }) }
  // Allowlist prevents the function from being abused as an open proxy.
  if (!ALLOWED_HOSTS.has(parsed.hostname)) return json({ error: 'host not allowed' }, { status: 403 })

  const ctrl = new AbortController()
  const timeout = setTimeout(() => ctrl.abort(), 10000)

  try {
    const upstream = await fetch(target, {
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': 'iradio-icy-proxy/1.0 (+https://iradio.vercel.app)'
      },
      signal: ctrl.signal,
      redirect: 'follow'
    })

    const stationName = upstream.headers.get('icy-name')

    if (!upstream.ok || !upstream.body) {
      return json({ title: null, station: stationName, source: 'http_error', status: upstream.status })
    }

    const metaInt = parseInt(upstream.headers.get('icy-metaint') || '', 10)
    if (!metaInt || isNaN(metaInt)) {
      upstream.body.cancel().catch(() => {})
      return json({ title: null, station: stationName, source: 'no_metaint' })
    }

    // Walk the stream: each cycle is `metaInt` audio bytes followed by 1 length
    // byte and `length * 16` metadata bytes.
    const reader = upstream.body.getReader()
    let buf = new Uint8Array(0)
    let cyclesSeen = 0
    const MAX_CYCLES = 3 // give up after a few empty intervals

    try {
      while (cyclesSeen < MAX_CYCLES) {
        // Need at least metaInt + 1 bytes to read the length byte.
        while (buf.length < metaInt + 1) {
          const { done, value } = await reader.read()
          if (done) return json({ title: null, station: stationName, source: 'eof' })
          const merged = new Uint8Array(buf.length + value.length)
          merged.set(buf); merged.set(value, buf.length)
          buf = merged
        }

        const metaLen = buf[metaInt] * 16

        // Need full metadata block to parse it.
        while (buf.length < metaInt + 1 + metaLen) {
          const { done, value } = await reader.read()
          if (done) return json({ title: null, station: stationName, source: 'eof' })
          const merged = new Uint8Array(buf.length + value.length)
          merged.set(buf); merged.set(value, buf.length)
          buf = merged
        }

        if (metaLen > 0) {
          const metaBytes = buf.slice(metaInt + 1, metaInt + 1 + metaLen)
          const title = parseStreamTitle(metaBytes)
          if (title && !isJunkTitle(title)) {
            return json({ title, station: stationName, source: 'icy' })
          }
        }

        // Drop the processed cycle and look for the next one.
        buf = buf.slice(metaInt + 1 + metaLen)
        cyclesSeen++
      }
      return json({ title: null, station: stationName, source: 'no_title' })
    } finally {
      reader.cancel().catch(() => {})
    }
  } catch (err) {
    return json({ title: null, error: err.name === 'AbortError' ? 'timeout' : err.message, source: 'fetch_error' })
  } finally {
    clearTimeout(timeout)
  }
}
