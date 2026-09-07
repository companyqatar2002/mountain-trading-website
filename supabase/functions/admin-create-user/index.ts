// Supabase Edge Function: admin-create-user
// Lets an admin create a new login (email + password + role) without ever
// exposing the service_role key to the browser.
//
// Deploy with: supabase functions deploy admin-create-user
// (see README.md for full setup steps)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing authorization header' }, 401)
    }

    // Client scoped to the calling user - used only to verify who is calling.
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: caller }, error: callerErr } = await callerClient.auth.getUser()
    if (callerErr || !caller) {
      return json({ error: 'Not authenticated' }, 401)
    }

    // Admin client with full privileges - used only after verifying the caller is an admin.
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Only admins can create accounts' }, 403)
    }

    const { email, password, full_name, role } = await req.json()
    if (!email || !password || !full_name) {
      return json({ error: 'email, password and full_name are required' }, 400)
    }

    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr) return json({ error: createErr.message }, 400)

    const { error: profileErr } = await adminClient.from('profiles').insert({
      id: created.user.id,
      full_name,
      role: role === 'admin' ? 'admin' : 'user',
    })
    if (profileErr) return json({ error: profileErr.message }, 400)

    return json({ ok: true, user_id: created.user.id })
  } catch (e) {
    return json({ error: e.message }, 500)
  }
})

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
