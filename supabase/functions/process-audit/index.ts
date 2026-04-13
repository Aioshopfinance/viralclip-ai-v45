import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { runAudit } from '../_shared/audit/runner.ts'
import { normalizeAuditResult } from '../_shared/audit/normalize.ts'

Deno.serve(async (req: Request) => {
  let supabase: ReturnType<typeof createClient> | null = null
  let auditId: string | null = null

  try {
    const payload = await req.json().catch(() => null)

    auditId = payload?.audit_id ?? null

    if (!auditId) {
      return new Response(JSON.stringify({ error: 'Invalid payload: missing audit_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables.')
    }

    supabase = createClient(supabaseUrl, supabaseKey)

    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('id, channel_id, status, platform')
      .eq('id', auditId)
      .single()

    if (auditError || !audit) {
      throw new Error(`Failed to fetch audit: ${auditError?.message ?? 'Audit not found'}`)
    }

    const { data: lockResult, error: lockError } = await supabase
      .from('audits')
      .update({
        status: 'processing',
        error_message: null,
      })
      .eq('id', auditId)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (lockError) {
      throw new Error(`Failed to lock audit for processing: ${lockError.message}`)
    }

    if (!lockResult) {
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          reason: `Audit is not pending anymore.`,
          auditId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, user_id, platform, channel_name, channel_link, normalized_link')
      .eq('id', audit.channel_id)
      .single()

    if (channelError || !channel) {
      throw new Error(`Failed to fetch channel: ${channelError?.message ?? 'Channel not found'}`)
    }

    const rawResult = await runAudit(channel.channel_link, channel.platform, Deno.env.toObject())

    const normalized = normalizeAuditResult(rawResult, {
      platform: channel.platform,
      channel_name: channel.channel_name,
      channel_link: channel.channel_link,
    })

    if (normalized.meta.channelName && normalized.meta.channelName !== channel.channel_name) {
      await supabase
        .from('channels')
        .update({ channel_name: normalized.meta.channelName })
        .eq('id', channel.id)
    }

    const finalStatus =
      normalized.auditStatus === 'pending_integration' ? 'pending_integration' : 'completed'

    const { error: updateError } = await supabase
      .from('audits')
      .update({
        status: finalStatus,
        growth_score: normalized.growthScore,
        analysis_data: normalized as any,
        error_message: normalized.error?.message ?? null,
      })
      .eq('id', auditId)

    if (updateError) {
      throw new Error(`Failed to update audit: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        auditId,
        status: finalStatus,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    if (supabase && auditId) {
      await supabase
        .from('audits')
        .update({
          status: 'failed',
          error_message: error?.message ?? 'Unknown processing error',
        })
        .eq('id', auditId)
    }

    return new Response(
      JSON.stringify({
        error: error?.message ?? 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
})
