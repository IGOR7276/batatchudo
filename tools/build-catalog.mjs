/* Builds data/catalog.json from the current sources.
 *
 * Sources of truth:
 *   - price.html  -> price + availability (the shop's current price list)
 *   - js/data.js  -> batat variety details (varieties[])
 *   - js/catalog-meta.js -> catalog table rows (CATALOG_TABLE_ROWS)
 *
 * Slug convention used by the site: page slug == image basename
 * (opisanie-sortov-batata.html builds pageUrl as `v.img.replace('.webp', '.html')`).
 *
 * Run: node tools/build-catalog.mjs
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';

const root = process.cwd();

const norm = (s) => String(s || '')
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/э/g, 'е')
  .replace(/[^a-zа-я0-9]/g, '');

async function loadExpr(file, expr) {
  const code = await readFile(path.join(root, file), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: file });
  return vm.runInNewContext(expr, sandbox);
}

const varieties = await loadExpr('js/data.js', 'varieties');
const catalogRows = await loadExpr('js/catalog-meta.js', 'window.CATALOG_TABLE_ROWS');

const bySlug = new Map();
for (const v of varieties) {
  const slug = v.img ? v.img.replace(/\.webp$/i, '') : null;
  if (slug) bySlug.set(slug.toLowerCase(), v);
}

/* ---- price.html parsing ---- */
const priceHtml = await readFile(path.join(root, 'price.html'), 'utf8');

const sectionRe = /<section class="price-section[^"]*"[^>]*>/g;
const sections = [];
for (const m of priceHtml.matchAll(sectionRe)) {
  const idMatch = m[0].match(/id="([^"]*)"/);
  const id = idMatch ? idMatch[1] : (m[0].includes('novelty') ? 'novelty' : 'unknown');
  sections.push({ index: m.index, id });
}
const sectionFor = (i) => [...sections].reverse().find((s) => s.index < i)?.id || 'unknown';

const rowRe = /<tr><td class="item-name">(?:<a href="([^"]+)"[^>]*>([^<]*)<\/a>|([^<]*))<\/td><td(?: class="([^"]*)")?>([^<]*)<\/td><\/tr>/g;
const priceRows = [];
for (const m of priceHtml.matchAll(rowRe)) {
  const [, href, nameInLink, namePlain, priceClass = '', priceTextRaw = ''] = m;
  const priceText = priceTextRaw.trim();
  let available = null;
  let price = null;
  let status = null;
  if (priceClass === 'price-unavailable') {
    available = false;
    status = priceText || 'закончился';
  } else if (priceClass === 'price-available') {
    available = true;
    const num = priceText.match(/\d+/);
    price = num ? Number(num[0]) : null;
    status = 'available';
  }
  priceRows.push({
    section: sectionFor(m.index),
    name: (nameInLink || namePlain || '').trim(),
    slug: href ? href.replace(/\.html$/i, '').toLowerCase() : null,
    price,
    priceText,
    priceFrom: /^от\s/i.test(priceText),
    available,
    status,
  });
}

/* ---- resolve price row -> data.js variety ---- */
const ALIASES = {
  'баюбелла': 'la-bayu-bell',
  'белыйнбссухумскийбелый': 'belyy-nbs',
  'винницкийрозовыйредголдтэккен': 'vinnitskiy-rozovyy',
  'каратморковный': 'karat',
  'победа100хаубэйшубайкурдюмовский': 'pobeda-100',
  'портубаттерабабурячковый': 'portu-baterraba',
  'сортбататакубань': 'kuban',
  'sweetcarolinelightgreenкорона': 'korona',
  'rustymapleleaf': 'rusty',
  'млечныйпуть': 'mlechnyy-put',
  'анноимо': 'annoimo',
};

function findVariety(row) {
  if (row.slug && bySlug.has(row.slug)) return bySlug.get(row.slug);
  const n = norm(row.name);
  for (const v of varieties) if (norm(v.name) === n) return v;
  if (ALIASES[n] && bySlug.has(ALIASES[n])) return bySlug.get(ALIASES[n]);
  const cont = varieties.filter((v) => {
    const vn = norm(v.name);
    return vn && (vn.includes(n) || n.includes(vn));
  });
  if (cont.length === 1) return cont[0];
  return null;
}

const metaByName = new Map();
for (const r of catalogRows) metaByName.set(norm(r[0]), r);

const products = priceRows.map((row) => {
  const v = findVariety(row);
  const meta = metaByName.get(norm(v ? v.name : row.name));
  const slug = v?.img ? v.img.replace(/\.webp$/i, '') : row.slug;
  return {
    slug,
    name: v?.name || row.name,
    namePrice: row.name,
    section: row.section,
    price: row.price,
    priceText: row.priceText,
    priceFrom: row.priceFrom,
    available: row.available,
    status: row.status,
    matched: Boolean(v),
    img: v?.img || null,
    color: v?.color || meta?.[1] || null,
    type: v?.type || meta?.[3] || null,
    term: v?.term || meta?.[2] || null,
    termDays: v?.termDays || null,
    category: v?.category || null,
    sweetness: v?.sweetness ?? null,
    productivity: v?.productivity || null,
    storage: v?.storage || null,
    tasteProfile: v?.tasteProfile || null,
    desc: v?.desc || null,
    rawTaste: v?.rawTaste || null,
    bakedTaste: v?.bakedTaste || null,
    yield: v?.yield || null,
    advantages: v?.advantages || [],
    patent: v?.patent ?? null,
  };
});

const fileExists = async (name) => { try { await access(path.join(root, name)); return true; } catch { return false; } };

/* ---- conflicts: page JSON-LD Product vs price.html ---- */
const conflicts = [];
const pagesChecked = new Set();
for (const p of products) {
  if (!p.slug || p.slug === 'chufa') continue;
  const page = p.slug + '.html';
  if (pagesChecked.has(page)) continue;
  pagesChecked.add(page);
  if (!await fileExists(page)) continue;
  const html = await readFile(path.join(root, page), 'utf8');
  const scripts = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  let product = null;
  for (const s of scripts) {
    try { const d = JSON.parse(s[1]); if (d['@type'] === 'Product') { product = d; break; } } catch {}
  }
  if (!product?.offers) continue;
  const expectedAvail = p.available === false ? 'https://schema.org/OutOfStock'
    : p.available === true ? 'https://schema.org/InStock' : null;
  const pagePrice = product.offers.price != null ? String(product.offers.price) : null;
  const priceMismatch = p.price != null && pagePrice != null && pagePrice !== String(p.price);
  const availMismatch = expectedAvail && product.offers.availability && product.offers.availability !== expectedAvail;
  if (priceMismatch || availMismatch) {
    conflicts.push({
      page,
      name: product.name || p.name,
      pagePrice: pagePrice ? Number(pagePrice) : null,
      priceHtmlPrice: p.price,
      pageAvailability: product.offers.availability || null,
      priceHtmlAvailability: expectedAvail,
      priceMismatch,
      availMismatch,
    });
  }
}

await mkdir(path.join(root, 'data'), { recursive: true });
const output = {
  generatedFrom: ['price.html', 'js/data.js', 'js/catalog-meta.js'],
  slugRule: 'slug = image basename (img.replace(".webp", ".html"))',
  note: 'price/available come from price.html and are authoritative.',
  counts: {
    priceRows: products.length,
    matchedToVariety: products.filter((p) => p.matched).length,
    unmatchedPriceRows: products.filter((p) => !p.matched).length,
    conflicts: conflicts.length,
  },
  products,
};
await writeFile(path.join(root, 'data', 'catalog.json'), JSON.stringify(output, null, 2) + '\n', 'utf8');

/* ---- markdown report ---- */
const lines = [];
lines.push('# Отчёт по данным каталога', '');
lines.push(`Источник цен/наличия: \`price.html\`. Сгенерировано: \`node tools/build-catalog.mjs\`.`, '');
lines.push(`- строк в прайсе: **${products.length}**`);
lines.push(`- сопоставлено с сортом (data.js): **${products.filter((p) => p.matched).length}**`);
lines.push(`- без сопоставления: **${products.filter((p) => !p.matched).length}**`);
lines.push(`- конфликтов «страница vs прайс»: **${conflicts.length}**`, '');

lines.push('## Конфликты цена/наличие (страница ↔ price.html)', '');
if (conflicts.length) {
  lines.push('| Страница | Сорт | Цена на стр. | Цена в прайсе | Наличие на стр. | Наличие в прайсе |');
  lines.push('|---|---|---|---|---|---|');
  for (const c of conflicts) {
    lines.push(`| ${c.page} | ${c.name} | ${c.pagePrice ?? '—'} | ${c.priceHtmlPrice ?? '—'} | ${(c.pageAvailability || '—').replace('https://schema.org/', '')} | ${(c.priceHtmlAvailability || '—').replace('https://schema.org/', '')} |`);
  }
} else {
  lines.push('Расхождений нет.');
}
lines.push('');

lines.push('## Строки прайса без сопоставления с сортом', '');
const unmatched = products.filter((p) => !p.matched);
lines.push('| Раздел | Название | Цена | Наличие | Slug |');
lines.push('|---|---|---|---|---|');
for (const p of unmatched) {
  lines.push(`| ${p.section} | ${p.namePrice} | ${p.priceText || '—'} | ${p.available === false ? 'нет' : p.available === true ? 'да' : '—'} | ${p.slug || '—'} |`);
}
lines.push('');

lines.push('## Сорта (страницы) без строки в прайсе', '');
const slugsInPrice = new Set(products.map((p) => p.slug).filter(Boolean));
const missing = varieties.filter((v) => {
  const slug = v.img ? v.img.replace(/\.webp$/i, '') : null;
  return slug && !slugsInPrice.has(slug.toLowerCase());
});
lines.push('| Slug | Название |');
lines.push('|---|---|');
for (const v of missing) {
  lines.push(`| ${v.img.replace(/\.webp$/i, '')} | ${v.name} |`);
}
lines.push('');

await writeFile(path.join(root, 'data', 'price-report.md'), lines.join('\n'), 'utf8');

console.log(`catalog.json: ${products.length} rows, ${products.filter((p) => p.matched).length} matched, ${unmatched.length} unmatched, ${conflicts.length} conflicts`);
