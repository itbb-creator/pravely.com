import { handleOptions, jsonResponse, readJson } from '../_shared/cors.ts';
import { getSupabase } from '../_shared/supabase.ts';
import { deleteCustomerData, recordBlockedAdminDeletion } from '../_shared/delete-customer-data.ts';

Deno.serve(async (req: Request) => {
  const options = handleOptions(req);
  if (options) return options;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, req);

  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    if (!token) return jsonResponse({ error: 'Sign in required.' }, 401, req);

    const body = await readJson<{ confirmation?: string }>(req);
    if (body.confirmation !== 'DELETE') return jsonResponse({ error: 'Confirmation required.' }, 400, req);

    const sb = getSupabase();
    const { data, error: authError } = await sb.auth.getUser(token);
    const user = data.user;
    if (authError || !user?.id) return jsonResponse({ error: 'Your session is no longer valid.' }, 401, req);
    if (user.app_metadata?.role === 'admin') {
      await recordBlockedAdminDeletion(sb, user.id, 'account');
      return jsonResponse({ error: 'Administrator accounts are protected and cannot be deleted.' }, 403, req);
    }

    const deletion = await deleteCustomerData(sb, user.id, 'account');

    const { error: deleteError } = await sb.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    return jsonResponse({ deleted: true, deletionJobId: deletion.jobId }, 200, req);
  } catch (error) {
    console.error('delete-account error:', error);
    return jsonResponse({ error: 'Account deletion could not be completed.' }, 500, req);
  }
});
