import { handleOptions, jsonResponse, readJson } from '../_shared/cors.ts';
import { getSupabase } from '../_shared/supabase.ts';
import { deleteCustomerData, recordBlockedAdminDeletion } from '../_shared/delete-customer-data.ts';

Deno.serve(async (req: Request) => {
  const options = handleOptions(req);
  if (options) return options;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, req);
  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    const body = await readJson<{ confirmation?: string }>(req);
    if (body.confirmation !== 'DELETE DATA') return jsonResponse({ error: 'Confirmation required.' }, 400, req);
    const sb = getSupabase();
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user?.id) return jsonResponse({ error: 'Your session is no longer valid.' }, 401, req);
    if (data.user.app_metadata?.role === 'admin') {
      await recordBlockedAdminDeletion(sb, data.user.id, 'financial_data');
      return jsonResponse({
        error: 'Administrator accounting data is protected and cannot be erased through self-service controls.',
      }, 403, req);
    }
    const result = await deleteCustomerData(sb, data.user.id, 'financial_data');
    return jsonResponse({ deleted: true, deletionJobId: result.jobId }, 200, req);
  } catch (error) {
    console.error('delete-user-data error:', error);
    return jsonResponse({ error: 'Financial data deletion could not be completed.' }, 500, req);
  }
});
