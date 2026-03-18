import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  return new Response(
    JSON.stringify({ message: 'This is a placeholder function to resolve deployment errors.' }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
