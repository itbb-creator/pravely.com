import { handleOptions, jsonResponse, readJson } from '../_shared/cors.ts';
import { envGet, originAllowed, supportEmail } from '../_shared/config.ts';
import { getSupabase } from '../_shared/supabase.ts';

type SupportRequest = { name?: unknown; email?: unknown; topic?: unknown; message?: unknown; website?: unknown };
const allowedTopics = new Set(['Account access', 'Purchase, refund, or reinstatement', 'Technical problem', 'Privacy or data request', 'Something else']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  const options = handleOptions(req);
  if (options) return options;
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405, req);
  if (!originAllowed(req.headers.get('origin'))) return jsonResponse({ error: 'Request origin is not allowed.' }, 403, req);

  try {
    const body = await readJson<SupportRequest>(req);
    if (clean(body.website, 200)) return jsonResponse({ ok: true }, 200, req);
    const name = clean(body.name, 100);
    const email = clean(body.email, 254).toLowerCase();
    const topic = clean(body.topic, 80);
    const message = clean(body.message, 5000);
    if (!name || !emailPattern.test(email) || !allowedTopics.has(topic) || !message) {
      return jsonResponse({ error: 'Enter a valid name, email address, topic, and message.' }, 400, req);
    }

    const address = (req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim();
    const salt = envGet('DOWNLOAD_RATE_LIMIT_SALT');
    if (!salt) return jsonResponse({ error: 'Support messaging is temporarily unavailable.' }, 503, req);
    const ipHash = await sha256(`${salt}:support:${address}`);
    const sb = getSupabase();
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await sb.from('support_requests').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since);
    if (countError) throw countError;
    if ((count ?? 0) >= 5) return jsonResponse({ error: 'Too many messages were sent from this network. Please try again later.' }, 429, req);

    const { data: stored, error: insertError } = await sb.from('support_requests').insert({ name, email, topic, message, ip_hash: ipHash }).select('id').single();
    if (insertError) throw insertError;

    const keys = [...new Set([envGet('RESEND_PRODUCTION_API_KEY'), envGet('RESEND_API_KEY')].filter(Boolean))];
    const senders = [...new Set([envGet('PRODUCTION_EMAIL_FROM'), envGet('EMAIL_FROM')].filter(Boolean))];
    if (!keys.length || !senders.length) throw new Error('Email provider is not configured.');
    const emailPayload = {
      to: [supportEmail()],
      reply_to: email,
      subject: `[Pravely support] ${topic}`,
      text: `Name: ${name}\nReply email: ${email}\nTopic: ${topic}\n\n${message}\n\nSupport request ID: ${stored.id}`,
      html: `<h2>New Pravely support request</h2><p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Reply email:</strong> ${escapeHtml(email)}<br><strong>Topic:</strong> ${escapeHtml(topic)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p><p>Support request ID: ${stored.id}</p>`,
    };
    let delivery: Response | undefined;
    let deliveryBody: Record<string, unknown> = {};
    let attempt = 0;
    for (const resendKey of keys) {
      for (const from of senders) {
        attempt += 1;
        delivery = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': `pravely-support-${stored.id}-${attempt}`,
          },
          body: JSON.stringify({ ...emailPayload, from }),
        });
        deliveryBody = await delivery.json().catch(() => ({}));
        if (delivery.ok) break;
      }
      if (delivery?.ok) break;
    }
    if (!delivery) throw new Error('Email provider is not configured.');
    await sb.from('support_requests').update({
      delivery_status: delivery.ok ? 'sent' : 'failed',
      provider_message_id: delivery.ok ? String(deliveryBody.id ?? '') : null,
      delivery_error: delivery.ok ? null : clean(deliveryBody.message || deliveryBody.name || `HTTP ${delivery.status}`, 500),
      updated_at: new Date().toISOString(),
    }).eq('id', stored.id);
    if (!delivery.ok) {
      // Preserve the request in the MFA-protected support ledger even when the
      // notification provider is temporarily misconfigured or unavailable.
      return jsonResponse({ ok: true, queued: true }, 202, req);
    }
    return jsonResponse({ ok: true }, 200, req);
  } catch (error) {
    console.error('submit-support error:', error);
    return jsonResponse({ error: 'Your message could not be sent. Please try again later.' }, 500, req);
  }
});
