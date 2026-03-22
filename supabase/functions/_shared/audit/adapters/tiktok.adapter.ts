import { AuditResponse } from '../types.ts'

export async function runTikTokAudit(url: string): Promise<Partial<AuditResponse>> {
  const match = url.match(/@([\w.-]+)/)
  const username = match ? match[1] : 'unknown_user'

  return {
    platform: 'tiktok',
    integrationStatus: 'pending',
    auditStatus: 'completed',
    provider: 'tiktok-pending',
    message:
      'A integração real com o TikTok está em desenvolvimento. Dados e métricas temporariamente indisponíveis.',
    data: null,
    meta: {
      channelName: `@${username}`,
    },
  }
}
