import { readFile, writeFile } from 'node:fs/promises';

const sourceUrl = new URL('../docs/V1_FEATURE_TRUTH_TABLE_2026-09-15.md', import.meta.url);
const outputUrl = new URL('../features.html', import.meta.url);
const markdown = await readFile(sourceUrl, 'utf8');
const lines = markdown.split(/\r?\n/);
const headerIndex = lines.findIndex((line) => line.startsWith('| Feature | Free 7-day trial |'));
if (headerIndex < 0) throw new Error('Feature truth-table header was not found.');

const tableLines = [];
for (const line of lines.slice(headerIndex)) {
  if (!line.startsWith('|')) break;
  tableLines.push(line);
}
if (tableLines.length < 3) throw new Error('Feature truth table has no rows.');

const parseRow = (line) => line.slice(1, -1).split('|').map((cell) => cell.trim());
const headers = parseRow(tableLines[0]);
const rows = tableLines.slice(2).map(parseRow);
if (rows.some((row) => row.length !== headers.length)) throw new Error('Feature truth-table columns are inconsistent.');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const badge = (value) => {
  const normalized = value.toLowerCase();
  let className = 'neutral';
  if (value === '✓' || normalized === 'yes' || normalized.startsWith('yes,')) className = 'included';
  else if (normalized.includes('later') || normalized.includes('planned') || normalized.includes('future')) className = 'future';
  else if (normalized.includes('admin')) className = 'admin';
  else if (value === '—' || normalized === 'no' || normalized === 'n/a') className = 'none';
  return `<span class="status ${className}">${escapeHtml(value)}</span>`;
};

const bodyRows = rows.map((row) => `<tr>
  <th scope="row">${escapeHtml(row[0])}</th>
  ${row.slice(1, 8).map((cell) => `<td>${badge(cell)}</td>`).join('\n  ')}
  <td>${escapeHtml(row[8])}</td>
  <td>${escapeHtml(row[9])}</td>
  <td>${escapeHtml(row[10])}</td>
  <td class="wording">${escapeHtml(row[11])}</td>
</tr>`).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Feature availability — Pravely</title>
  <meta name="description" content="The current Pravely feature, plan, platform, and verification matrix, including what is available now and what is planned later.">
  <link rel="canonical" href="https://pravely.com/features.html">
  <link rel="icon" href="./favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root{--forest:#073f34;--mint:#c8f6dd;--lime:#dffc8b;--cream:#f5f1e8;--paper:#fffdf8;--ink:#12201d;--muted:#5d6b67;--line:#d8ded9;--future:#fff1c9}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:"DM Sans",sans-serif;-webkit-font-smoothing:antialiased}a{color:inherit}.wrap{width:min(1220px,calc(100% - 40px));margin:auto}.skip{position:absolute;left:-999px}.skip:focus{left:16px;top:12px;z-index:99;background:#fff;padding:10px 14px;border-radius:10px}header{position:sticky;top:0;z-index:20;background:rgba(255,253,248,.94);backdrop-filter:blur(14px);border-bottom:1px solid rgba(7,63,52,.12)}.nav{min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}.logo img{display:block;width:138px}.links{display:flex;gap:24px;align-items:center;font-size:14px;font-weight:700}.links a{text-decoration:none}.links a[aria-current="page"]{text-decoration:underline;text-underline-offset:5px}.hero{background:var(--cream);padding:76px 0 66px}.eyebrow{font-size:13px;text-transform:uppercase;letter-spacing:.12em;font-weight:800;color:#0d5b49}.hero h1{font:800 clamp(42px,6vw,72px)/1 Manrope,sans-serif;letter-spacing:-.055em;margin:15px 0 22px;max-width:900px}.hero p{font-size:18px;line-height:1.65;color:var(--muted);max-width:780px}.legend{display:flex;flex-wrap:wrap;gap:9px;margin-top:28px}.content{padding:64px 0 90px}.intro{display:grid;grid-template-columns:1.15fr .85fr;gap:22px;margin-bottom:30px}.card{border:1px solid var(--line);border-radius:24px;padding:25px;background:white}.card h2{font:800 22px Manrope,sans-serif;margin:0 0 10px}.card p{color:var(--muted);line-height:1.6;margin:0}.table-shell{border:1px solid var(--line);border-radius:25px;background:white;overflow:auto;box-shadow:0 20px 45px rgba(18,32,29,.07)}table{width:100%;min-width:1700px;border-collapse:separate;border-spacing:0;font-size:13px}caption{text-align:left;padding:21px 24px;background:var(--forest);color:white;font:700 15px Manrope,sans-serif}th,td{padding:14px 13px;border-right:1px solid #e7ebe8;border-bottom:1px solid #e7ebe8;text-align:left;vertical-align:top;line-height:1.45}thead th{position:sticky;top:0;background:#edf7f1;z-index:3;font-weight:800;color:#173b33}tbody th{position:sticky;left:0;z-index:2;background:white;width:230px;min-width:230px;font:700 14px Manrope,sans-serif}tbody tr:hover td,tbody tr:hover th{background:#fbfaf5}.wording{min-width:310px}.status{display:inline-flex;align-items:center;justify-content:center;min-height:27px;border-radius:999px;padding:4px 9px;font-weight:800;white-space:nowrap;background:#edf0ee;color:#43504c}.status.included{background:var(--mint);color:var(--forest)}.status.future{background:var(--future);color:#735512}.status.admin{background:#e3ddf7;color:#4b367f}.status.none{background:#f2f2f2;color:#737373}.status.neutral{white-space:normal}.note{margin-top:20px;color:var(--muted);font-size:13px;line-height:1.6}footer{background:#0b1e1a;color:#dce8e4;padding:45px 0}.footer{display:flex;justify-content:space-between;gap:28px;align-items:center}.footer img{filter:brightness(0) invert(1);width:132px}.footer-links{display:flex;flex-wrap:wrap;gap:18px;font-size:13px}.footer-links a{color:#dce8e4}@media(max-width:760px){.wrap{width:calc(100% - 28px)}.links{gap:13px}.links a:first-child{display:none}.hero{padding:54px 0 48px}.intro{grid-template-columns:1fr}.content{padding-top:42px}.footer{display:grid}.logo img{width:118px}}@media(max-width:520px){.nav{align-items:flex-start;flex-direction:column;gap:10px;padding:13px 0}.links{width:100%;justify-content:space-between}.links a:first-child{display:inline}.hero h1{font-size:42px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
  </style>
</head>
<body>
  <a class="skip" href="#main">Skip to feature table</a>
  <header><div class="wrap nav"><a class="logo" href="./" aria-label="Pravely home"><img src="./images/pravely-logo-horizontal.png" alt="Pravely"></a><nav class="links" aria-label="Product information"><a href="./">Home</a><a href="./changelog.html">Changelog</a><a href="./features.html" aria-current="page">Features</a></nav></div></header>
  <main id="main">
    <section class="hero"><div class="wrap"><div class="eyebrow">Living product guide · Updated September 2026</div><h1>What you get now—and what comes later.</h1><p>This table is Pravely’s public source of truth for plan access, platforms, implementation, verification, and customer wording. “Later” and “planned” features are roadmap items, not promises that they are available today.</p><div class="legend" aria-label="Status legend"><span class="status included">✓ Included now</span><span class="status future">Later or planned</span><span class="status none">— Not included</span></div></div></section>
    <section class="content"><div class="wrap">
      <div class="intro"><div class="card"><h2>Web and installable PWA</h2><p>The responsive web app and installable PWA are the first release. Dedicated iOS and Android packages follow only after their own purchasing, restoration, signing, and physical-device testing.</p></div><div class="card"><h2>Seven-day trial</h2><p>The trial provides Complete access for seven days. After expiry, the editable workspace locks; the paywall still lets customers review or export their saved information, purchase access, sign out, or delete their data and account.</p></div></div>
      <div class="table-shell" tabindex="0" role="region" aria-label="Scrollable Pravely feature availability table">
        <table><caption>${rows.length} product capabilities and roadmap items</caption><thead><tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${bodyRows}</tbody></table>
      </div>
      <p class="note">Verification describes completed evidence, not a guarantee of uninterrupted operation. The founder is the current support owner and the only person authorized to change plan inclusion or promote a roadmap feature into the launch product.</p>
    </div></section>
  </main>
  <footer><div class="wrap footer"><img src="./images/pravely-logo-horizontal.png" alt="Pravely"><div class="footer-links"><a href="./">Home</a><a href="./changelog.html">Changelog</a><a href="https://www.instagram.com/pravelyofficial/" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://www.tiktok.com/@pravelyus" target="_blank" rel="noopener noreferrer">TikTok</a><a href="./contact.html">Contact</a><a href="./terms.html">Terms</a><a href="./privacy.html">Privacy</a></div></div></footer>
</body>
</html>
`;

if (process.argv.includes('--check')) {
  const current = await readFile(outputUrl, 'utf8').catch(() => '');
  if (current !== html) throw new Error('features.html is out of date. Run npm run build:features.');
  console.log(`Feature page matches ${rows.length} truth-table rows.`);
} else {
  await writeFile(outputUrl, html, 'utf8');
  console.log(`Generated features.html from ${rows.length} truth-table rows.`);
}
