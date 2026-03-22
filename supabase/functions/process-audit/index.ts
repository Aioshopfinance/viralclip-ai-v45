import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { runAudit } from '../_shared/audit/runner.ts'

Deno.serve(async (req: Request) => {
  let supabase
  let auditId

  try {
    const payload = await req.json()
    const record = payload.record || payload

    if (!record || !record.id || !record.channel_id) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
    }

    auditId = record.id
    const channelId = record.channel_id

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    supabase = createClient(supabaseUrl, supabaseKey)

    await supabase.from('audits').update({ status: 'processing' }).eq('id', auditId)

    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single()

    if (channelError || !channel) {
      throw new Error(`Failed to fetch channel: ${channelError?.message}`)
    }

    const auditRes = await runAudit(channel.channel_link, channel.platform, Deno.env.toObject())

    if (auditRes.meta?.channelName && auditRes.meta.channelName !== channel.channel_name) {
      await supabase
        .from('channels')
        .update({ channel_name: auditRes.meta.channelName })
        .eq('id', channelId)
    }

    const { error: updateError } = await supabase
      .from('audits')
      .update({
        status: auditRes.auditStatus,
        growth_score: auditRes.data?.score_breakdown?.total || 0,
        analysis_data: auditRes as any,
        error_message: auditRes.error?.message || null,
      })
      .eq('id', auditId)

    if (updateError) throw new Error(`Failed to update audit: ${updateError.message}`)

    return new Response(JSON.stringify({ success: true, auditId, status: auditRes.auditStatus }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    if (supabase && auditId) {
      await supabase
        .from('audits')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', auditId)
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
