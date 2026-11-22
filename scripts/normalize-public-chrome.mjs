import { readFile, readdir, writeFile } from 'node:fs/promises';

const output = new URL('../site-dist/', import.meta.url);
const pages = (await readdir(output)).filter((name) => name.endsWith('.html'));

const socialIcon = (label, url, path) => `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg></a>`;

const footer = `<footer class="pravely-site-footer"><div class="pravely-footer-inner"><div class="pravely-footer-brand"><img src="./images/pravely-logo-horizontal.png" alt="Pravely"><p>Clear money decisions, one step at a time.<br>© 2026 Pravely. Not financial advice.</p></div><div class="pravely-footer-navigation"><nav aria-label="Footer navigation"><a href="./">Home</a><a href="./features.html">Feature availability</a><a href="./changelog.html">Changelog</a><a href="./onboarding.html">Getting started</a><a href="./contact.html">Contact</a><a href="./privacy.html">Privacy</a><a href="./terms.html">Terms</a><a href="./eula.html">EULA</a></nav><div class="pravely-footer-socials" aria-label="Pravely social media">${socialIcon('Facebook', 'https://www.facebook.com/profile.php?id=61593162213256', 'M13.5 22v-8h2.8l.4-3.2h-3.2V8.7c0-.9.3-1.5 1.6-1.5h1.8V4.3c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v1.8H6.2V14h3.2v8h4.1z')}${socialIcon('Instagram', 'https://www.instagram.com/pravelyofficial/', 'M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2zm-.1 2A3.1 3.1 0 0 0 4 7.1v9.8A3.1 3.1 0 0 0 7.1 20h9.8a3.1 3.1 0 0 0 3.1-3.1V7.1A3.1 3.1 0 0 0 16.9 4H7.1zM12 7.1A4.9 4.9 0 1 1 12 17a4.9 4.9 0 0 1 0-9.9zm0 2A2.9 2.9 0 1 0 12 15a2.9 2.9 0 0 0 0-5.9zm5.2-3.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z')}${socialIcon('TikTok', 'https://www.tiktok.com/@pravelyus', 'M15.5 3c.5 2.6 2 4.1 4.5 4.3v3.1a8.5 8.5 0 0 1-4.5-1.3v6.2a6.3 6.3 0 1 1-5.4-6.2v3.2a3.2 3.2 0 1 0 2.2 3V3h3.2z')}</div></div></div></footer>`;

const styles = `<style id="pravely-public-chrome">.pravely-site-footer{background:#0b1e1a!important;color:#dce8e4!important;padding:48px 0!important;margin:0!important;font-family:"DM Sans",system-ui,sans-serif!important;text-align:left!important}.pravely-footer-inner{width:min(1180px,calc(100% - 40px));margin:auto;display:flex;justify-content:space-between;gap:36px}.pravely-footer-brand img{display:block;width:132px;filter:brightness(0) invert(1)}.pravely-footer-brand p{margin:14px 0 0;color:#9fb0aa;font-size:13px;line-height:1.6}.pravely-footer-navigation{display:grid;gap:22px;justify-items:end}.pravely-footer-navigation nav{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:14px 20px}.pravely-site-footer a{color:#dce8e4!important;text-decoration:none}.pravely-site-footer a:hover{text-decoration:underline}.pravely-footer-socials{display:flex;gap:12px}.pravely-footer-socials a{display:grid;place-items:center;width:38px;height:38px;border:1px solid #526761;border-radius:50%}.pravely-footer-socials svg{width:19px;height:19px;fill:currentColor}@media(max-width:700px){.pravely-footer-inner{display:grid}.pravely-footer-navigation{justify-items:start}.pravely-footer-navigation nav{justify-content:flex-start}}</style>`;

const horizontalBrand = '<img src="./images/pravely-logo-horizontal.png" alt="Pravely" style="display:block;width:138px;height:auto">';

for (const page of pages) {
  const url = new URL(page, output);
  let html = await readFile(url, 'utf8');
  html = html
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/i, footer)
    .replace(/<a href="\.\/" class="flex items-center gap-3 font-extrabold tracking-tight"><img[^>]*pravely-app-icon\.png[^>]*>PRAVELY<\/a>/i, `<a href="./" aria-label="Pravely home">${horizontalBrand}</a>`)
    .replace(/<a class="brand" href="\.\/"><img[^>]*pravely-app-icon\.png[^>]*>\s*PRAVELY<\/a>/i, `<a class="brand" href="./">${horizontalBrand}</a>`)
    .replace(/<a href="\.\/" class="flex items-center gap-2 font-extrabold tracking-tight" aria-label="Pravely home">[\s\S]*?<\/a>/i, `<a href="./" aria-label="Pravely home">${horizontalBrand}</a>`)
    .replace(/<span style="display: block;margin: 0 auto 3\.125rem;[^"]*background: url\(data:image\/svg\+xml;base64,[\s\S]*?<\/span>/i, `<img src="./images/pravely-logo-horizontal.png" alt="Pravely" style="display:block;width:178px;height:auto;margin:0 auto 3.125rem">`)
    .replace(/<a href="\.\/" class="font-extrabold">← PRAVELY<\/a>/gi, `<a href="./" aria-label="Pravely home">${horizontalBrand}</a>`);
  if (!html.includes('pravely-site-footer')) html = html.replace(/<\/body>/i, `${footer}</body>`);
  if (!html.includes('pravely-public-chrome')) html = html.replace(/<\/head>/i, `${styles}</head>`);
  await writeFile(url, html, 'utf8');
}

console.log(`Standardized the public logo and two-row footer across ${pages.length} pages.`);
