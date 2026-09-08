# Admin dashboard integration

Replace the `handleCreate` session/access-token part in `UsersPanel` with the guarded helper below. It turns the vague Edge Function failure into a usable message and avoids dereferencing a missing session.

```jsx
async function manageUser(body) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.')

  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (error) {
    const hint = /Failed to send a request/i.test(error.message)
      ? 'User management service is unavailable. Confirm the admin-create-user Edge Function is deployed and its Supabase secrets are configured.'
      : error.message
    throw new Error(data?.error || hint)
  }
  if (data?.error) throw new Error(data.error)
  return data
}
```

Use this creation handler:

```jsx
async function handleCreate(e) {
  e.preventDefault(); setCreating(true); setError('')
  try {
    await manageUser({ action: 'create', email, password, full_name: fullName, role })
    setEmail(''); setPassword(''); setFullName(''); setRole('user')
    await loadUsers(); setSuccess('Account created successfully.')
  } catch (err) { setError(err.message) } finally { setCreating(false) }
}
```

For role changes, require two deliberate confirmations before calling the server:

```jsx
async function changeRole(user) {
  const nextRole = user.role === 'admin' ? 'user' : 'admin'
  if (!window.confirm(`Change ${user.full_name} from ${user.role.toUpperCase()} to ${nextRole.toUpperCase()}?`)) return
  if (!window.confirm('This is a security-sensitive change. Confirm role change.')) return
  try { await manageUser({ action: 'change_role', user_id: user.id, role: nextRole }); await loadUsers() }
  catch (err) { setError(err.message) }
}
```

For deletion, do not offer the action for the final admin. Use a final confirmation and invoke the server:

```jsx
const adminCount = users.filter((user) => user.role === 'admin').length
async function deleteUser(user) {
  if (user.role === 'admin' && adminCount === 1) {
    setError('At least one Admin user must remain in the system.'); return
  }
  if (!window.confirm(`Delete ${user.full_name}? This account can be recreated, but deletion cannot be undone.`)) return
  try { await manageUser({ action: 'delete', user_id: user.id }); await loadUsers() }
  catch (err) { setError(err.message) }
}
```

Use accessible custom dialogs rather than `window.confirm` for production UI; retain the two explicit confirmation steps. In the user row, show a disabled “Protected” badge for the last admin, a “Change role” button, and a destructive “Delete” button.

Deployment order:

1. Run `admin-security-migration.sql` in Supabase SQL Editor.
2. Replace/deploy `admin-create-user-index.ts` as the `admin-create-user` Edge Function.
3. Ensure function secrets include `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. Apply the dashboard integration and redeploy through GitHub/Netlify.
