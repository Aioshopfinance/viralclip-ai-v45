export type YouTubeUrlType =
  | 'handle'
  | 'channel'
  | 'user'
  | 'custom'
  | 'watch'
  | 'shorts'
  | 'shortlink'
  | 'unknown'

export function classifyInput(url: string): YouTubeUrlType {
  const lower = url.toLowerCase()
  if (lower.includes('youtu.be/')) return 'shortlink'
  if (lower.includes('/watch') || lower.includes('?v=')) return 'watch'
  if (lower.includes('/shorts/')) return 'shorts'
  if (lower.includes('/channel/')) return 'channel'
  if (lower.includes('/user/')) return 'user'
  if (lower.includes('/c/')) return 'custom'
  if (lower.includes('@')) return 'handle'
  return 'unknown'
}

export function extractIdentifier(url: string, type: YouTubeUrlType): string | null {
  const cleanUrl = url.trim()
  const withProtocol = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`

  try {
    const urlObj = new URL(withProtocol)
    if (type === 'shortlink') return urlObj.pathname.slice(1)
    if (type === 'watch') return urlObj.searchParams.get('v')
    if (type === 'shorts') {
      const parts = urlObj.pathname.split('/')
      const idx = parts.indexOf('shorts')
      return parts[idx + 1] || null
    }
    if (type === 'channel') {
      const parts = urlObj.pathname.split('/')
      const idx = parts.indexOf('channel')
      return parts[idx + 1] || null
    }
    if (type === 'user') {
      const parts = urlObj.pathname.split('/')
      const idx = parts.indexOf('user')
      return parts[idx + 1] || null
    }
    if (type === 'custom') {
      const parts = urlObj.pathname.split('/')
      const idx = parts.indexOf('c')
      return parts[idx + 1] || null
    }
  } catch (e) {
    // fallback logic handled below
  }

  if (type === 'handle') {
    const match = cleanUrl.match(/@([\w.-]+)/)
    return match ? match[1] : null
  }

  return null
}

export async function resolveCanonicalId(
  identifier: string,
  type: YouTubeUrlType,
  apiKey: string,
): Promise<{ channelId: string; title?: string } | null> {
  if (!identifier) return null

  if (type === 'channel') {
    const res = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${identifier}&key=${apiKey}`,
    )
    const data = await res.json()
    if (data.items && data.items.length > 0)
      return { channelId: data.items[0].id, title: data.items[0].snippet.title }
    return null
  }

  if (type === 'handle') {
    const res = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forHandle=@${identifier}&key=${apiKey}`,
    )
    const data = await res.json()
    if (data.items && data.items.length > 0)
      return { channelId: data.items[0].id, title: data.items[0].snippet.title }
    return null
  }

  if (type === 'user') {
    const res = await fetch(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${identifier}&key=${apiKey}`,
    )
    const data = await res.json()
    if (data.items && data.items.length > 0)
      return { channelId: data.items[0].id, title: data.items[0].snippet.title }
    return null
  }

  if (type === 'custom') {
    const res = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${identifier}&key=${apiKey}`,
    )
    const data = await res.json()
    if (data.items && data.items.length > 0)
      return {
        channelId: data.items[0].snippet.channelId,
        title: data.items[0].snippet.channelTitle,
      }
    return null
  }

  if (type === 'watch' || type === 'shorts' || type === 'shortlink') {
    const res = await fetch(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${identifier}&key=${apiKey}`,
    )
    const data = await res.json()
    if (data.items && data.items.length > 0)
      return {
        channelId: data.items[0].snippet.channelId,
        title: data.items[0].snippet.channelTitle,
      }
    return null
  }

  return null
}
