/* Syncs each product page's JSON-LD Product offer (price + availability)
 * from data/catalog.json, so pages always match the authoritative price.html.
 *
 * Run: node tools/sync-prices.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const catalog = JSON.parse(await readFile(path.join(root, 'data', 'catalog.json'), 'utf8'));

const AVAIL = {
  true: 'https://schema.org/InStock',
  false: 'https://schema.org/OutOfStock',
};

const scriptRe = /(<script[^>]+type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/gi;

let updated = 0;
const report = [];

for (const p of catalog.products) {
  if (!p.slug) continue;
  const file = p.slug + '.html';
  let html;
  try { html = await readFile(path.join(root, file), 'utf8'); } catch { continue; }

  let changed = false;
  const next = html.replace(scriptRe, (full, open, body, close) => {
    let data;
    try { data = JSON.parse(body); } catch { return full; }
    if (data['@type'] !== 'Product' || !data.offers) return full;

    const before = JSON.stringify(data.offers);
    if (p.price != null) data.offers.price = String(p.price);
    if (p.available === true || p.available === false) data.offers.availability = AVAIL[p.available];
    if (JSON.stringify(data.offers) !== before) changed = true;
    return open + '\n' + JSON.stringify(data, null, 2) + '\n  ' + close;
  });

  if (changed) {
    await writeFile(path.join(root, file), next, 'utf8');
    updated++;
    report.push(file);
  }
}

console.log(`updated ${updated} page(s)`);
if (report.length) console.log(report.join('\n'));
