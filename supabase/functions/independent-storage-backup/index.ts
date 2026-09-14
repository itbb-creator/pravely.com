import { envGet, supportEmail } from '../_shared/config.ts';
import { getSupabase } from '../_shared/supabase.ts';

const SOURCE_BUCKETS = ['workbook-masters', 'licensed-workbooks', 'business-receipts'] as const;
const encoder = new TextEncoder();

type SourceObject = { bucket: string; path: string; size: number };
type ManifestEntry = SourceObject & {
  sha256: string;
  destinationKey: string;
  destinationVersionId: string | null;
  destinationEtag: string | null;
};

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function sha256Bytes(value: ArrayBuffer | Uint8Array | string) {
  const input = typeof value === 'string' ? encoder.encode(value) : value;
  return new Uint8Array(await crypto.subtle.digest('SHA-256', input));
}

async function hmac(key: ArrayBuffer | Uint8Array, value: string) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value)));
}

function awsEncode(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function putS3Object(key: string, body: Uint8Array, contentType: string) {
  const bucket = envGet('BACKUP_S3_BUCKET');
  const region = envGet('BACKUP_AWS_REGION');
  const accessKey = envGet('BACKUP_AWS_ACCESS_KEY_ID');
  const secretKey = envGet('BACKUP_AWS_SECRET_ACCESS_KEY');
  const kmsKey = envGet('BACKUP_KMS_KEY_ID');
  if (!bucket || !region || !accessKey || !secretKey) throw new Error('AWS backup configuration is incomplete.');

  const host = `s3.${region}.amazonaws.com`;
  const canonicalUri = `/${[bucket, ...key.split('/')].map(awsEncode).join('/')}`;
  const endpoint = `https://${host}${canonicalUri}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHashBytes = await sha256Bytes(body);
  const payloadHash = bytesToHex(payloadHashBytes);
  const checksum = bytesToBase64(payloadHashBytes);

  const signedHeaders: Record<string, string> = {
    host,
    'x-amz-checksum-sha256': checksum,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    'x-amz-server-side-encryption': kmsKey ? 'aws:kms' : 'AES256',
  };
  if (kmsKey) signedHeaders['x-amz-server-side-encryption-aws-kms-key-id'] = kmsKey;

  const names = Object.keys(signedHeaders).sort();
  const canonicalHeaders = names.map((name) => `${name}:${signedHeaders[name].trim()}\n`).join('');
  const canonicalRequest = ['PUT', canonicalUri, '', canonicalHeaders, names.join(';'), payloadHash].join('\n');
  const scope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, bytesToHex(await sha256Bytes(canonicalRequest))].join('\n');
  const dateKey = await hmac(encoder.encode(`AWS4${secretKey}`), dateStamp);
  const regionKey = await hmac(dateKey, region);
  const serviceKey = await hmac(regionKey, 's3');
  const signingKey = await hmac(serviceKey, 'aws4_request');
  const signature = bytesToHex(await hmac(signingKey, stringToSign));

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      ...signedHeaders,
      Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`,
      'Content-Type': contentType,
    },
    body,
  });
  if (!response.ok) throw new Error(`AWS upload failed with HTTP ${response.status}.`);
  const returnedChecksum = response.headers.get('x-amz-checksum-sha256');
  if (returnedChecksum && returnedChecksum !== checksum) throw new Error('AWS checksum confirmation did not match.');
  return {
    sha256: payloadHash,
    versionId: response.headers.get('x-amz-version-id'),
    etag: response.headers.get('etag'),
  };
}

async function listFiles(bucket: string, prefix = ''): Promise<SourceObject[]> {
  const sb = getSupabase();
  const files: SourceObject[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(`Source listing failed for ${bucket}.`);
    const page = data ?? [];
    for (const item of page) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id || item.metadata) {
        files.push({ bucket, path, size: Number(item.metadata?.size ?? 0) });
      } else {
        files.push(...await listFiles(bucket, path));
      }
    }
    if (page.length < 1000) break;
    offset += page.length;
  }
  return files;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function authenticate(req: Request) {
  const token = req.headers.get('x-backup-token') ?? '';
  if (!token) return false;
  const candidate = bytesToHex(await sha256Bytes(token));
  const { data, error } = await getSupabase().from('backup_runtime_config').select('trigger_token_hash').eq('singleton', true).single();
  if (error || !data?.trigger_token_hash) return false;
  return constantTimeEqual(candidate, String(data.trigger_token_hash));
}

async function sendFailureAlert(runId: string) {
  const key = envGet('RESEND_PRODUCTION_API_KEY') || envGet('RESEND_API_KEY');
  const from = envGet('PRODUCTION_EMAIL_FROM') || envGet('EMAIL_FROM');
  if (!key || !from) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [supportEmail()],
      subject: '[Pravely security] Independent backup failed',
      text: `Independent backup run ${runId} failed. Review the Supabase Edge Function logs and backup_runs status. No customer data is included in this alert.`,
    }),
  }).catch(() => undefined);
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 });
  if (!await authenticate(req)) return Response.json({ error: 'Unauthorized.' }, { status: 401 });

  const sb = getSupabase();
  const { data: run, error: runError } = await sb.from('backup_runs').insert({}).select('id,started_at').single();
  if (runError || !run) return Response.json({ error: 'Could not start the backup run.' }, { status: 500 });
  const runId = String(run.id);
  const runPrefix = `pravely/${new Date(run.started_at).toISOString().replace(/[:.]/g, '-')}-${runId}`;

  try {
    const sourceObjects = (await Promise.all(SOURCE_BUCKETS.map((bucket) => listFiles(bucket)))).flat();
    const entries: ManifestEntry[] = [];
    let byteCount = 0;
    for (const source of sourceObjects) {
      const { data, error } = await sb.storage.from(source.bucket).download(source.path);
      if (error || !data) throw new Error(`Source download failed in ${source.bucket}.`);
      const bytes = new Uint8Array(await data.arrayBuffer());
      const destinationKey = `${runPrefix}/objects/${awsEncode(source.bucket)}/${source.path.split('/').map(awsEncode).join('/')}`;
      const uploaded = await putS3Object(destinationKey, bytes, data.type || 'application/octet-stream');
      entries.push({
        ...source,
        size: bytes.byteLength,
        sha256: uploaded.sha256,
        destinationKey,
        destinationVersionId: uploaded.versionId,
        destinationEtag: uploaded.etag,
      });
      byteCount += bytes.byteLength;
    }

    const manifest = JSON.stringify({
      schemaVersion: 1,
      runId,
      createdAt: new Date().toISOString(),
      sourceProject: 'vtrdkoeydzvrhtiuykja',
      encryption: envGet('BACKUP_KMS_KEY_ID') ? 'SSE-KMS' : 'SSE-S3',
      objectCount: entries.length,
      byteCount,
      objects: entries,
    }, null, 2);
    const manifestKey = `${runPrefix}/manifest.json`;
    const manifestUpload = await putS3Object(manifestKey, encoder.encode(manifest), 'application/json');
    await sb.from('backup_runs').update({
      status: 'succeeded',
      completed_at: new Date().toISOString(),
      object_count: entries.length,
      byte_count: byteCount,
      manifest_key: manifestKey,
      manifest_sha256: manifestUpload.sha256,
      error_message: null,
    }).eq('id', runId);
    return Response.json({ ok: true, runId, objectCount: entries.length, byteCount });
  } catch {
    await sb.from('backup_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: 'Backup failed. Review the privacy-safe Edge Function logs.',
    }).eq('id', runId);
    await sendFailureAlert(runId);
    return Response.json({ error: 'Backup failed.', runId }, { status: 500 });
  }
});
