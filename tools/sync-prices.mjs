/* Syncs each product page's JSON-LD Product data from data/catalog.json, so
 * pages always match the authoritative price.html, and enriches offers with the
 * fields Google expects for merchant listings (itemCondition, shipping,
 * returns, Google product category).
 *
 * - price/availability come from price.html (via data/catalog.json)
 * - an "offers" block without a price is removed (Google flags it otherwise)
 *
 * Run: node tools/sync-prices.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const catalog = JSON.parse(await readFile(path.join(root, 'data', 'catalog.json'), 'utf8'));

const bySlug = new Map();
for (const p of catalog.products) if (p.slug) bySlug.set(p.slug, p);

const AVAIL = {
  true: 'https://schema.org/InStock',
  false: 'https://schema.org/OutOfStock',
};

const CATEGORY = [
  {
    '@type': 'CategoryCode',
    inCodeSet: 'https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt',
    codeValue: 'Home & Garden > Plants',
  },
  'Саженцы и клубни батата',
];

const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'RU',
  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
};

const SHIPPING_DETAILS = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: '350', currency: 'RUB' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RU' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 10, unitCode: 'DAY' },
  },
};

const scriptRe = /(<script[^>]+type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/gi;

const files = (await readdir(root)).filter((f) => f.endsWith('.html'));
let updated = 0;
const report = [];

for (const file of files) {
  const product = bySlug.get(file.replace(/\.html$/, ''));
  let html = await readFile(path.join(root, file), 'utf8');
  let changed = false;

  const next = html.replace(scriptRe, (full, open, body, close) => {
    let data;
    try { data = JSON.parse(body); } catch { return full; }
    if (data['@type'] !== 'Product') return full;

    const before = JSON.stringify(data);
    data.category = CATEGORY;
    if (data.offers) {
      data.offers.itemCondition = 'https://schema.org/NewCondition';
      data.offers.hasMerchantReturnPolicy = RETURN_POLICY;
      data.offers.shippingDetails = SHIPPING_DETAILS;
      if (product && product.price != null) data.offers.price = String(product.price);
      if (product && (product.available === true || product.available === false)) {
        data.offers.availability = AVAIL[product.available];
      }
      if (data.offers.price == null || data.offers.price === '') delete data.offers;
    }
    if (JSON.stringify(data) !== before) changed = true;
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
