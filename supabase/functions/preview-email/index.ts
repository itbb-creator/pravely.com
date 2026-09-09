/**
 * preview-email — admin-only view of the exact email a customer received
 * (or will receive once a provider is connected). Until EMAIL_PROVIDER=resend
 * is set, the pipeline stores the rendered HTML on the license record; this
 * endpoint lets you see it.
 *
 *   GET ?license=PRV-7K4X9P2M with an authenticated administrator JWT.
 */

import { corsHeaders, handleOptions, jsonResponse } from '../_shared/cors.ts';
import { getSupabase } from '../_shared/supabase.ts';

function assuranceLevel(token: string): string {
  try {
    const payload = token.split('.')[1] ?? '';
    const normalized = payload.replaceAll('-', '+').replaceAll('_', '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return String(JSON.parse(atob(padded))?.aal ?? '');
  } catch {
    return '';
  }
}

Deno.serve(async (req: Request) => {
  const options = handleOptions(req);
  if (options) return options;

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405, req);
  }

  const url = new URL(req.url);
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const sb = getSupabase();
  const { data: authData, error: authError } = token
    ? await sb.auth.getUser(token)
    : { data: { user: null }, error: new Error('Missing authorization') };
  if (authError || !authData.user || authData.user.app_metadata?.role !== 'admin') {
    return jsonResponse({ error: 'Unauthorized' }, 401, req);
  }
  if (assuranceLevel(token) !== 'aal2') {
    return jsonResponse({ error: 'MFA verification required.' }, 403, req);
  }

  const licenseId = (url.searchParams.get('license') ?? '').trim().toUpperCase();
  if (!licenseId) {
    return jsonResponse({ error: 'Pass ?license=' }, 400, req);
  }

  const { data, error } = await sb
    .from('licenses')
    .select('license_id, customer_email, email_status, email_provider, email_preview_html')
    .eq('license_id', licenseId)
    .maybeSingle();

  if (error || !data) {
    return jsonResponse({ error: 'License not found' }, 404, req);
  }
  if (!data.email_preview_html) {
    return jsonResponse({ error: 'No email preview stored for this license' }, 404, req);
  }

  return new Response(data.email_preview_html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'Content-Security-Policy': "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      ...corsHeaders(req),
    },
  });
});
