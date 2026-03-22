import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { runAudit } from '../_shared/audit/runner.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url, platform } = await req.json()
    if (!url || !platform) throw new Error('Missing url or platform')

    const auditRes = await runAudit(url, platform, Deno.env.toObject())

    const channelName = auditRes.meta?.channelName || url

    return new Response(JSON.stringify({ analysisData: auditRes, channelName }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
