/* P3 upgrade for all plant pages (idempotent).
 *
 * 1. Removes single-variety "В коллекции" sections.
 * 2. Fixes duplicated benefit cards and accusative case in H2/CTA.
 * 3. Adds related plants, gallery headings and descriptive alt text.
 * 4. Adds FAQPage and (where catalog has an exact price) Product JSON-LD.
 * 5. Adds query-driven content blocks for the highest-demand pages.
 *
 * Run: node tools/p3-upgrade.mjs --dry
 *      node tools/p3-upgrade.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import {
  BENEFITS,
  EXTRA_FAQ,
  EXTRA_SECTIONS,
  GALLERY,
  GRAMMAR,
  PRODUCTS,
  RELATED,
  TEMPLATES,
} from './p3-data.mjs';

const dry = process.argv.includes('--dry');

const PAGES = Object.fromEntries(
  Object.keys(GALLERY).map((slug) => [
    slug,
    {
      gen: GALLERY[slug],
      grammar: GRAMMAR[slug],
      benefits: BENEFITS[slug],
      product: PRODUCTS[slug],
      extraFaq: EXTRA_FAQ[slug],
      extraSection: EXTRA_SECTIONS[slug],
      template: TEMPLATES[slug],
    },
  ]),
);

for (const [slug, targets] of Object.entries(RELATED)) {
  if (!PAGES[slug]) throw new Error(`RELATED: unknown page ${slug}`);
  for (const target of targets) {
    if (!PAGES[target]) throw new Error(`RELATED: ${slug} -> unknown ${target}`);
    if (target === slug) throw new Error(`RELATED: ${slug} links to itself`);
  }
}

const decodeEnt = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&deg;/g, '°')
    .replace(/&times;/g, '×')
    .replace(/&sup2;/g, '²')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const strip = (s) => decodeEnt(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function cardInfo(slug) {
  const h = await readFile(`${slug}.html`, 'utf8');
  const h1 = strip((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '');
  const name = h1.split('(')[0].trim();
  const meta = strip((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const hero = strip((h.match(/<p class="(?:pl|chufa)-hero-desc">([\s\S]*?)<\/p>/) || [])[1] || meta);
  let desc = (hero.match(/^.*?[.!?](?:\s|$)/) || [hero])[0].trim();
  if (desc.length > 105) desc = `${desc.slice(0, 102).replace(/[ ,.;:—–-]+$/, '')}…`;
  return { name, desc };
}

function relatedBlock(cards) {
  const links = cards
    .map(
      (c) => `      <a class="glass-card pl-variety" href="${c.slug}.html" style="display:block;text-decoration:none;color:inherit;">
        <div class="pl-variety-name">${esc(c.name)}</div>
        <div class="pl-variety-desc">${esc(c.desc)}</div>
      </a>`,
    )
    .join('\n');
  return `<!-- p3:related:start -->
<section class="pl-section" style="position:relative;">
  <div class="container">
    <h2 class="pl-section-title">Похожие растения</h2>
    <p class="pl-section-sub">Другие культуры из коллекции Batatchudo.</p>
    <div class="pl-varieties-grid">
${links}
    </div>
  </div>
</section>
<!-- p3:related:end -->`;
}

function extraFaqItems(items) {
  return items
    .map(
      (i) =>
        `      <div class="pl-faq-item"><div class="pl-faq-question">${esc(i.q)}</div><div class="pl-faq-answer"><p>${esc(i.a)}</p></div></div>`,
    )
    .join('\n');
}

function faqPrefix(cfg) {
  return cfg.template === 'chufa' ? 'chufa' : 'pl';
}

function parseFaq(h, cfg) {
  const prefix = faqPrefix(cfg);
  const start = h.indexOf(`<div class="${prefix}-faq">`);
  if (start < 0) return [];
  const end = h.indexOf('</section>', start);
  const block = h.slice(start, end);
  const out = [];
  for (const part of block.split(`<div class="${prefix}-faq-item">`).slice(1)) {
    const q = strip((part.match(new RegExp(`<div class="${prefix}-faq-question">([\\s\\S]*?)<\\/div>`)) || [])[1] || '');
    const a = strip((part.match(new RegExp(`<div class="${prefix}-faq-answer">([\\s\\S]*?)<\\/div>`)) || [])[1] || '');
    if (q && a) out.push({ q, a });
  }
  return out;
}

function removeSingleVarietySection(h, cfg) {
  if (cfg.template === 'chufa') return h;
  const re = /<section[^>]*id="varieties"[^>]*>[\s\S]*?<\/section>\n?/i;
  const match = h.match(re);
  if (!match) return h;
  const cards = (match[0].match(/<div class="glass-card pl-variety">/g) || []).length;
  return cards <= 1 ? h.replace(re, '') : h;
}

const rel = (s) => s.replace(/  <!-- p3:jsonld:start -->[\s\S]*?<!-- p3:jsonld:end -->\n/g, '');
let changed = 0;

for (const [slug, cfg] of Object.entries(PAGES)) {
  let h = await readFile(`${slug}.html`, 'utf8');
  const before = h;
  const prefix = faqPrefix(cfg);

  // 1. remove a block that shows only one variety
  h = removeSingleVarietySection(h, cfg);

  // 2. benefits (only pages with the known duplicated/wrong block)
  if (cfg.benefits) {
    const a = h.indexOf('<div class="pl-benefits-grid">');
    const b = h.indexOf('\n    </div>', a);
    if (a < 0 || b < 0) throw new Error(`${slug}: benefits grid not found`);
    if (!h.includes(cfg.benefits[0].text)) {
      const cards = cfg.benefits
        .map(
          (c) =>
            `      <div class="glass-card"><div class="pl-benefit-icon">${c.icon}</div><div class="pl-benefit-title">${c.title}</div><div class="pl-benefit-text">${c.text}</div></div>`,
        )
        .join('\n');
      h = h.slice(0, a) + `<div class="pl-benefits-grid">\n${cards}` + h.slice(b);
    }
  }

  // 3. grammar in H2 / CTA
  if (cfg.grammar) {
    h = h.split(`выбирают ${cfg.grammar.nom}`).join(`выбирают ${cfg.grammar.acc}`);
    h = h.split(`вырастить ${cfg.grammar.nom}?`).join(`вырастить ${cfg.grammar.acc}?`);
  }

  // 4. collection heading for blocks that stay (2+ varieties)
  if (cfg.template !== 'chufa') {
    h = h.replace(
      /<h2 class="pl-section-title">(?:Сорт|Сорта|\d+ сорта?) в коллекции<\/h2>/,
      '<h2 class="pl-section-title">Сорта в коллекции</h2>',
    );
  }

  // 5. gallery H2 + alt texts
  h = h.replace(
    `<h2 class="${prefix}-section-title">Галерея</h2>`,
    `<h2 class="${prefix}-section-title">Фото ${cfg.gen}</h2>`,
  );
  h = h.replace(/alt="[^"]*?— фото (\d+)"/g, (_, n) => `alt="Фото ${cfg.gen} — ${n}"`);

  // 6. remove previous injections, normalizing surrounding whitespace
  h = h.replace(/\n*<!-- p3:extra:start -->[\s\S]*?<!-- p3:extra:end -->\n*/g, '\n\n');
  h = h.replace(/\n*<!-- p3:faq:start -->[\s\S]*?<!-- p3:faq:end -->\n*/g, '\n');
  h = h.replace(/\n*<!-- p3:related:start -->[\s\S]*?<!-- p3:related:end -->\n*/g, '\n\n');
  h = rel(h);

  // 7. extra content before FAQ
  if (cfg.extraSection) {
    const h2 = h.indexOf(`<h2 class="${prefix}-section-title">Частые вопросы</h2>`);
    const sec = h.lastIndexOf('<section', h2);
    if (h2 < 0 || sec < 0) throw new Error(`${slug}: FAQ section not found`);
    const head = h.slice(0, sec).replace(/\s+$/, '');
    h = `${head}\n\n<!-- p3:extra:start -->\n${cfg.extraSection}\n<!-- p3:extra:end -->\n\n${h.slice(sec)}`;
  }

  // 8. extra FAQ items
  if (cfg.extraFaq?.length) {
    const start = h.indexOf('<div class="pl-faq">');
    const close = h.indexOf('\n    </div>\n  </div>\n</section>', start);
    if (start < 0 || close < 0) throw new Error(`${slug}: FAQ grid not found`);
    h = `${h.slice(0, close)}\n<!-- p3:faq:start -->\n${extraFaqItems(cfg.extraFaq)}\n<!-- p3:faq:end -->${h.slice(close)}`;
  }

  // 9. related plants before CTA
  const cards = [];
  for (const target of RELATED[slug]) cards.push({ slug: target, ...(await cardInfo(target)) });
  const cta = h.indexOf(`<section class="${prefix}-cta">`);
  if (cta < 0) throw new Error(`${slug}: CTA not found`);
  // Keep a "CTA" banner comment attached to the CTA section, not to the related block.
  const pre = h.slice(0, cta).replace(/\s+$/, '');
  let insertAt = cta;
  if (pre.endsWith('-->')) {
    const commentStart = pre.lastIndexOf('<!--');
    const comment = pre.slice(commentStart);
    if (commentStart >= 0 && /CTA|призыв/i.test(comment)) insertAt = commentStart;
  }
  const head = h.slice(0, insertAt).replace(/\s+$/, '');
  h = `${head}\n\n${relatedBlock(cards)}\n\n${h.slice(insertAt).replace(/^\s+/, '')}`;

  // 10. JSON-LD
  const faq = parseFaq(h, cfg);
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const image = (h.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || '';
  const url = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || `https://batatchudo.com/${slug}.html`;

  const schemas = [];
  if (cfg.product) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: cfg.product.name,
      description: desc,
      image,
      url,
      brand: { '@type': 'Brand', name: 'Batatchudo' },
      category: [
        {
          '@type': 'CategoryCode',
          inCodeSet: 'https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt',
          codeValue: 'Home & Garden > Plants',
        },
        'Саженцы и семена экзотических растений',
      ],
      seller: { '@type': 'Organization', name: 'Центр развития батата Луцан' },
      offers: {
        '@type': 'Offer',
        price: String(cfg.product.price),
        priceCurrency: 'RUB',
        availability: 'https://schema.org/InStock',
        url: 'https://batatchudo.com/price.html',
        seller: { '@type': 'Organization', name: 'Centr razvitiya batata Lutsan' },
        itemCondition: 'https://schema.org/NewCondition',
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'RU',
          returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: '350', currency: 'RUB' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RU' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 10, unitCode: 'DAY' },
          },
        },
      },
    });
  }
  if (faq.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  const scripts = schemas
    .map(
      (o) =>
        `  <script type="application/ld+json">\n${JSON.stringify(o, null, 2)
          .split('\n')
          .map((l) => `  ${l}`)
          .join('\n')}\n  </script>`,
    )
    .join('\n');
  h = h.replace('</head>', `  <!-- p3:jsonld:start -->\n${scripts}\n  <!-- p3:jsonld:end -->\n</head>`);

  const status = h === before ? 'unchanged' : 'changed';
  console.log(
    `${slug.padEnd(26)} ${status} | faq ${faq.length} | related ${cards.length} | schema ${schemas.map((s) => s['@type']).join('+') || '—'}`,
  );
  if (!dry && h !== before) await writeFile(`${slug}.html`, h, 'utf8');
  if (h !== before) changed++;
}

console.log(`\n${dry ? 'would change' : 'changed'} ${changed} page(s)`);
