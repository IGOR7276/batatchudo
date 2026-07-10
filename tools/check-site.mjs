import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const errors = [];

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

for (const file of await walk(root)) {
  const html = await readFile(file, 'utf8');
  const relative = path.relative(root, file);
  if (html.charCodeAt(0) === 0xfeff) errors.push(`${relative}: UTF-8 BOM`);
  if (/type=["']text\/javascript/i.test(html)) errors.push(`${relative}: obsolete script type`);
  if (/<button\b(?![^>]*\btype=)/i.test(html)) errors.push(`${relative}: button without type`);

  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch (error) { errors.push(`${relative}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const value = match[1].split(/[?#]/)[0];
    if (!value || value.includes('${') || /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(value)) continue;
    try { await access(path.resolve(path.dirname(file), value)); } catch { errors.push(`${relative}: missing ${value}`); }
  }

  if (/property=["']og:image["']/i.test(html) && !/property=["']og:image:width["']/i.test(html)) {
    errors.push(`${relative}: og:image has no dimensions`);
  }
}

const priceHtml = await readFile(path.join(root, 'price.html'), 'utf8');
for (const row of priceHtml.matchAll(/<tr><td class="item-name"><a href="([^"]+)">[^<]+<\/a><\/td><td class="(price-(?:available|unavailable))">([^<]+)<\/td><\/tr>/g)) {
  const [, page, status, priceText] = row;
  const html = await readFile(path.join(root, page), 'utf8');
  const scripts = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  const product = scripts.map((match) => JSON.parse(match[1])).find((data) => data['@type'] === 'Product');
  if (!product?.offers) continue;
  const expectedAvailability = status === 'price-available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  if (product.offers.availability !== expectedAvailability) errors.push(`${page}: availability differs from price.html`);
  const expectedPrice = priceText.match(/\d+/)?.[0];
  if (expectedPrice && String(product.offers.price) !== expectedPrice) errors.push(`${page}: price differs from price.html`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Site checks passed');
}
