import { AuditResponse } from './types.ts'
import { runYouTubeAudit } from './adapters/youtube.adapter.ts'
import { runTikTokAudit } from './adapters/tiktok.adapter.ts'

export async function runAudit(
  url: string,
  platform: string,
  env: Record<string, string>,
): Promise<AuditResponse> {
  const baseResponse: AuditResponse = {
    platform,
    input: url,
    normalizedInput: url
      .toLowerCase()
      .trim()
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .replace(/\/$/, ''),
    integrationStatus: 'error',
    auditStatus: 'failed',
    provider: 'unknown',
    message: 'Plataforma desconhecida',
    data: null,
    error: null,
  }

  try {
    if (platform.toLowerCase() === 'youtube') {
      const ytRes = await runYouTubeAudit(url, env.YOUTUBE_API_KEY || '')
      return { ...baseResponse, ...ytRes }
    } else if (platform.toLowerCase() === 'tiktok') {
      const tkRes = await runTikTokAudit(url)
      return { ...baseResponse, ...tkRes }
    } else {
      baseResponse.message = `Plataforma ${platform} ainda não suportada.`
      return baseResponse
    }
  } catch (e: any) {
    return {
      ...baseResponse,
      integrationStatus: 'error',
      auditStatus: 'failed',
      message: e.message,
      error: { code: 'INTERNAL_ERROR', message: e.message },
    }
  }
}
