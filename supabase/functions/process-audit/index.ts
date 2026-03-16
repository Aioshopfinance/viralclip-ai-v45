import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from '@supabase/supabase-js'

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

    // Fetch channel details
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

    // Generate mocked AI response based on channel data
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

    // Update audit record
    const { error: updateError } = await supabase
      .from('audits')
      .update({
        status: 'completed',
        growth_score: growthScore,
        analysis_data: analysisData,
      })
      .eq('id', auditId)

    if (updateError) {
      throw new Error(`Failed to update audit: ${updateError.message}`)
    }

    return new Response(JSON.stringify({ success: true, auditId }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Error processing audit:', error)

    if (supabase && auditId) {
      await supabase.from('audits').update({ status: 'error' }).eq('id', auditId)
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
