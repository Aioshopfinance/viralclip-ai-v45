export async function runTikTokAudit(url: string) {
  return {
    integrationStatus: 'pending_integration',
    auditStatus: 'pending_integration',
    provider: 'tiktok',
    message:
      'A integração com a API oficial do TikTok está em desenvolvimento. Em breve você terá dados reais.',
    data: null,
    error: null,
    meta: {
      channelName: url,
    },
  }
}
