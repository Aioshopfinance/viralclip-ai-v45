import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async () => {
  return new Response(
    JSON.stringify({ error: 'Not implemented. Use anonymous-audit or process-audit instead.' }),
    {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    },
  )
})
