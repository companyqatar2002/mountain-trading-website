// Replace supabase/functions/admin-create-user/index.ts with this file, then deploy it.
// Supports create, role changes and deletion; all privileged actions stay server-side.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const anon = Deno.env.get('SUPABASE_ANON_KEY')
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !anon || !service) return json({ error: 'Function configuration is incomplete. Ask an administrator to configure Supabase secrets.' }, 500)

    const authorization = req.headers.get('Authorization')
    if (!authorization) return json({ error: 'Your session has expired. Please sign in again.' }, 401)
    const callerClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } })
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) return json({ error: 'Your session has expired. Please sign in again.' }, 401)

    const admin = createClient(url, service)
    const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', caller.id).single()
    if (callerProfile?.role !== 'admin') return json({ error: 'Only administrators can manage users.' }, 403)

    const body = await req.json()
    const action = body.action || 'create'
    if (action === 'create') {
      const { email, password, full_name, role } = body
      if (!email || !password || !full_name) return json({ error: 'Name, email, and temporary password are required.' }, 400)
      if (password.length < 8) return json({ error: 'Temporary password must contain at least 8 characters.' }, 400)
      const { data: created, error } = await admin.auth.admin.createUser({ email: String(email).trim(), password, email_confirm: true })
      if (error) return json({ error: error.message }, 400)
      const { error: profileError } = await admin.from('profiles').insert({ id: created.user.id, full_name: String(full_name).trim(), role: role === 'admin' ? 'admin' : 'user' })
      if (profileError) { await admin.auth.admin.deleteUser(created.user.id); return json({ error: `Account was not created: ${profileError.message}` }, 400) }
      return json({ ok: true, message: `${role === 'admin' ? 'Admin' : 'User'} created successfully.`, user_id: created.user.id })
    }
    if (action === 'change_role') {
      if (!body.user_id || !['admin', 'user'].includes(body.role)) return json({ error: 'A user and valid role are required.' }, 400)
      const { error } = await admin.from('profiles').update({ role: body.role }).eq('id', body.user_id)
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true, message: 'User role updated successfully.' })
    }
    if (action === 'delete') {
      if (!body.user_id || body.user_id === caller.id) return json({ error: 'You cannot delete your own administrator account.' }, 400)
      const { error } = await admin.auth.admin.deleteUser(body.user_id)
      if (error) return json({ error: error.message }, 400)
      return json({ ok: true, message: 'User deleted successfully.' })
    }
    return json({ error: 'Unsupported user-management action.' }, 400)
  } catch (error) {
    console.error(error)
    return json({ error: error instanceof Error ? error.message : 'Unexpected server error.' }, 500)
  }
})
