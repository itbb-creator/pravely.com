type SupabaseAdmin = any;

const PERSONAL_TABLES = [
  ['budget_entries', 'user_id'],
  ['debts', 'user_id'],
  ['net_worth_items', 'user_id'],
  ['goals', 'user_id'],
  ['app_feedback', 'user_id'],
  ['operational_events', 'user_id'],
  ['push_device_tokens', 'user_id'],
  ['health_coach_rate_limits', 'user_id'],
  ['user_settings', 'user_id'],
] as const;

const BUSINESS_TABLES = [
  ['business_invoice_items', 'owner_id'],
  ['business_transaction_lines', 'owner_id'],
  ['business_invoices', 'owner_id'],
  ['business_recurring_expenses', 'owner_id'],
  ['business_transactions', 'owner_id'],
  ['business_reconciliations', 'owner_id'],
  ['business_contacts', 'owner_id'],
  ['business_accounts', 'owner_id'],
  ['business_audit_log', 'owner_id'],
] as const;

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function retry(operation: () => Promise<{ error?: unknown }>, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const result = await operation();
    if (!result.error) return;
    lastError = result.error;
  }
  throw lastError;
}

async function listStoragePrefix(sb: SupabaseAdmin, bucket: string, prefix: string) {
  const paths: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error: listError } = await sb.storage.from(bucket)
      .list(prefix, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
    if (listError) throw listError;
    for (const object of data ?? []) paths.push(`${prefix}/${object.name}`);
    if (!data || data.length < 1000) break;
  }
  return paths;
}

async function listReceiptPaths(sb: SupabaseAdmin, userId: string) {
  const paths = new Set<string>();
  const { data: rows, error } = await sb.from('business_transactions')
    .select('receipt_path').eq('owner_id', userId).not('receipt_path', 'is', null);
  if (error) throw error;
  for (const row of rows ?? []) if (row.receipt_path) paths.add(String(row.receipt_path));
  for (const path of await listStoragePrefix(sb, 'business-receipts', userId)) paths.add(path);
  return [...paths];
}

async function objectExists(sb: SupabaseAdmin, bucket: string, path: string) {
  const slash = path.lastIndexOf('/');
  const prefix = slash >= 0 ? path.slice(0, slash) : '';
  const name = slash >= 0 ? path.slice(slash + 1) : path;
  const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 100, search: name });
  if (error) throw error;
  return (data ?? []).some((object: { name: string }) => object.name === name);
}

async function removeObjects(sb: SupabaseAdmin, bucket: string, paths: string[]) {
  for (let index = 0; index < paths.length; index += 100) {
    const batch = paths.slice(index, index + 100);
    await retry(() => sb.storage.from(bucket).remove(batch));
  }
}

export async function deleteCustomerData(
  sb: SupabaseAdmin,
  userId: string,
  scope: 'financial_data' | 'account',
) {
  const userIdHash = await digest(userId);
  const { data: job, error: jobError } = await sb.from('data_deletion_jobs')
    .insert({ user_id_hash: userIdHash, scope, status: 'started' }).select('id').single();
  if (jobError || !job?.id) throw jobError ?? new Error('Could not record deletion job.');

  const results: Record<string, number> = {};
  try {
    const receiptPaths = await listReceiptPaths(sb, userId);
    const { data: freeLicenses, error: licenseReadError } = await sb.from('licenses')
      .select('license_id,file_path').eq('user_id', userId).eq('license_source', 'account_free');
    if (licenseReadError) throw licenseReadError;
    const workbookPaths = (freeLicenses ?? []).map((row: any) => String(row.file_path || '')).filter(Boolean);

    await removeObjects(sb, 'business-receipts', receiptPaths);
    await removeObjects(sb, 'licensed-workbooks', workbookPaths);
    results.receipt_objects_deleted = receiptPaths.length;
    results.workbook_objects_deleted = workbookPaths.length;
    const remainingReceipts = await listStoragePrefix(sb, 'business-receipts', userId);
    const workbookChecks = await Promise.all(workbookPaths.map((path: string) => objectExists(sb, 'licensed-workbooks', path)));
    results.receipt_objects_remaining = remainingReceipts.length;
    results.workbook_objects_remaining = workbookChecks.filter(Boolean).length;
    if (remainingReceipts.length || workbookChecks.some(Boolean)) {
      throw new Error('Deletion verification found remaining Storage objects.');
    }

    for (const [table, ownerColumn] of [...BUSINESS_TABLES, ...PERSONAL_TABLES]) {
      await retry(() => sb.from(table).delete().eq(ownerColumn, userId));
      const { count, error } = await sb.from(table).select(ownerColumn, { count: 'exact', head: true }).eq(ownerColumn, userId);
      if (error) throw error;
      results[`${table}_remaining`] = count ?? 0;
    }

    await retry(() => sb.from('licenses').delete()
      .eq('user_id', userId).eq('license_source', 'account_free'));
    const { count: freeLicenseCount, error: freeLicenseError } = await sb.from('licenses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('license_source', 'account_free');
    if (freeLicenseError) throw freeLicenseError;
    results.account_free_licenses_remaining = freeLicenseCount ?? 0;

    const remaining = Object.entries(results)
      .filter(([key]) => key.endsWith('_remaining'))
      .reduce((sum, [, value]) => sum + value, 0);
    if (remaining) throw new Error(`Deletion verification found ${remaining} remaining records.`);

    const { error: completionError } = await sb.from('data_deletion_jobs').update({
      status: 'completed', result: results, completed_at: new Date().toISOString(),
    }).eq('id', job.id);
    if (completionError) throw completionError;
    return { jobId: job.id, results };
  } catch (error) {
    await sb.from('data_deletion_jobs').update({
      status: 'partial',
      result: { ...results, error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown deletion error' },
    }).eq('id', job.id);
    throw error;
  }
}

export async function recordBlockedAdminDeletion(
  sb: SupabaseAdmin,
  userId: string,
  scope: 'financial_data' | 'account',
) {
  await sb.from('data_deletion_jobs').insert({
    user_id_hash: await digest(userId),
    scope,
    status: 'blocked_admin',
    result: { reason: 'Administrator accounts and accounting records are protected from self-service deletion.' },
    completed_at: new Date().toISOString(),
  });
}
