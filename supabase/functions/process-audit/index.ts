import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

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

    console.log(`[Audit Lifecycle] Processing Started: ${auditId}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    supabase = createClient(supabaseUrl, supabaseKey)

    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single()

    if (channelError || !channel) {
      throw new Error(`Failed to fetch channel: ${channelError?.message}`)
    }

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 2500))

    // Simulate an error for demonstration if the URL contains "fail"
    if (channel.channel_link && channel.channel_link.toLowerCase().includes('fail')) {
      throw new Error('Analysis failed due to simulated error (URL contained "fail").')
    }

    // Generate mocked AI response
    const growthScore = Math.floor(Math.random() * 31) + 65 // 65-95
    const analysisData = {
      score: growthScore,
      posting_frequency:
        'Based on the channel history, posting 3-4 times a week would optimize the algorithm pickup.',
      viral_potential:
        'High potential in the current niche if hooks are optimized in the first 3 seconds.',
      content_suggestions: [
        'Create a 3-part series around the most common question in your niche.',
        'Experiment with 7-second looping Shorts/Reels with trending audio.',
        'Use high-contrast text in the center of the screen for the first 2 seconds.',
      ],
    }

    const { error: updateError } = await supabase
      .from('audits')
      .update({
        status: 'completed',
        growth_score: growthScore,
        analysis_data: analysisData,
        error_message: null,
      })
      .eq('id', auditId)

    if (updateError) {
      throw new Error(`Failed to update audit: ${updateError.message}`)
    }

    console.log(`[Audit Lifecycle] Processing Finished: ${auditId}`)
    console.log(`[Audit Lifecycle] Completed Success: ${auditId}`)

    return new Response(JSON.stringify({ success: true, auditId }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error(`[Audit Lifecycle] Failed: ${auditId || 'unknown'} - Error: ${error.message}`)

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
