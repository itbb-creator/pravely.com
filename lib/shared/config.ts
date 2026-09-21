/**
 * Central configuration — products, buckets, env access.
 * Portable between Deno edge runtime and Node.js (used by scripts).
 */

export interface ProductConfig {
  id: string;
  /** Display name, e.g. "Pravely Premium Toolkit". */
  name: string;
  /** Master file inside the workbook-masters bucket. */
  masterPath: string;
  /** Output file name = `${fileNamePrefix}_${licenseId}.xlsx`. */
  fileNamePrefix: string;
  /** Env var holding this product's Stripe Price ID. */
  priceEnv: string;
}

/**
 * The workbooks Pravely delivers.
 *
 * One, now. Complete and Premium were separate paid spreadsheets with their own
 * Stripe prices and master files; the site stopped offering them, the app plans
 * took over what they did, and they sat here afterwards as configuration nobody
 * read — still resolvable by anyone holding an old license, still needing their
 * masters kept in step with a product that had moved on.
 *
 * The Essentials toolkit is the whole workbook line: free with any account, and
 * the founding edition founders are promised. Do not confuse these ids with the
 * app plans, which are also called plus and complete and are sold by a
 * different function entirely.
 */
export const PRODUCTS: ProductConfig[] = [
  {
    id: 'essentials',
    name: 'Pravely Essentials',
    masterPath: 'essentials.xlsx',
    fileNamePrefix: 'Pravely_Essentials',
    priceEnv: 'STRIPE_PRICE_ESSENTIALS',
  },
];

export function getProduct(id: string): ProductConfig | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const BUCKETS = {
  masters: 'workbook-masters',
  licensed: 'licensed-workbooks',
} as const;

/** Env access that works in both Deno (edge) and Node (scripts/tests). */
export function envGet(name: string, fallback = ''): string {
  const g = globalThis as Record<string, unknown>;
  if (g.Deno && typeof (g.Deno as { env?: unknown }).env === 'object') {
    const v = (g.Deno as { env: { get(k: string): string | undefined } }).env.get(name);
    return v ?? fallback;
  }
  const proc = (g.process ?? {}) as { env?: Record<string, string | undefined> };
  return proc.env?.[name] ?? fallback;
}

export function siteUrl(): string {
  return envGet('SITE_URL', 'https://pravely.com').replace(/\/+$/, '');
}

export function appUrl(): string {
  return envGet('APP_URL', 'https://app.pravely.com').replace(/\/+$/, '');
}

export function supportEmail(): string {
  return envGet('SUPPORT_EMAIL', 'support@pravely.com');
}

/** Seconds a signed download URL stays valid (default 10 minutes). */
export function downloadLinkTtlSeconds(): number {
  const minutes = Number(envGet('DOWNLOAD_LINK_TTL_MINUTES', '10'));
  return Math.max(5, Math.min(minutes || 10, 15)) * 60;
}

/** Max fresh signed links minted per license per rolling 24h. */
export function dailyDownloadLimit(): number {
  const n = Number(envGet('DAILY_DOWNLOAD_LIMIT', '20'));
  return Math.max(1, Math.min(n || 20, 1000));
}

/** Max links minted for one privacy-hashed network address per rolling 24h. */
export function ipDownloadLimit(): number {
  const n = Number(envGet('IP_DOWNLOAD_LIMIT', '40'));
  return Math.max(5, Math.min(n || 40, 500));
}

/**
 * Origin allow-list for CORS. Both the public site and the authenticated app
 * may call the shared Edge Functions, plus known local/preview hosts.
 */
export function originAllowed(origin: string | null): boolean {
  if (!origin) return true; // non-browser callers (curl, webhooks)
  const site = siteUrl();
  if (!site) return true;
  try {
    const o = new URL(origin);
    const allowedHosts = [site, appUrl()]
      .filter(Boolean)
      .map((value) => new URL(value).host);
    if (allowedHosts.includes(o.host)) return true;
    return (
      o.hostname === 'localhost' ||
      o.hostname === '127.0.0.1' ||
      o.hostname.endsWith('.e2b.app') ||
      o.hostname.endsWith('.netlify.app') ||
      o.hostname.endsWith('.vercel.app')
    );
  } catch {
    return false;
  }
}
