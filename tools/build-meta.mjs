/* Rewrites <title>, meta description and social tags for product/plant pages
 * so snippets are clickable (include "купить", price, availability, intent).
 *
 * Data sources:
 *   - js/data.js     -> batat variety attributes
 *   - data/catalog.json -> price/availability (from price.html)
 *
 * Run: node tools/build-meta.mjs          (writes)
 *      node tools/build-meta.mjs --dry    (preview only)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';

const dry = process.argv.includes('--dry');
const root = process.cwd();

const vsrc = await readFile('js/data.js', 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(vsrc, sandbox, { filename: 'js/data.js' });
const varieties = vm.runInNewContext('varieties', sandbox);

const bySlug = new Map();
for (const v of varieties) {
  if (v.img) bySlug.set(v.img.replace(/\.webp$/i, '').toLowerCase(), v);
}

const catalog = JSON.parse(await readFile('data/catalog.json', 'utf8'));
const priceBySlug = new Map();
for (const p of catalog.products) if (p.slug) priceBySlug.set(p.slug, p);

const lower = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const fem = (c) => {
  if (!c) return c;
  const s = lower(c);
  if (s.endsWith('ый')) return s.slice(0, -2) + 'ая';
  if (s.endsWith('ий')) return s.slice(0, -2) + 'яя';
  if (s.endsWith('ой')) return s.slice(0, -2) + 'ая';
  return s;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Varieties that have pages but are missing from js/data.js
const VARIETY_EXTRA = {
  'cvetik-semicvetik': 'Цветик-семицветик',
  elastik: 'Эластик',
  'erato-purpurnyy': 'Эрато пурпурный',
  'nensi-holl': 'Нэнси Холл',
  'nochnaya-furiya': 'Ночная фурия',
};

function varietyMeta(name, v, price) {
  const bits = [];
  if (v?.type) bits.push(lower(v.type));
  if (v?.color) bits.push(`мякоть ${fem(v.color)}`);
  if (v?.term) bits.push(lower(v.term));
  const attrs = bits.length ? ': ' + bits.join(', ') : '';
  const available = price ? price.available : null;
  let title, desc, alt;
  if (available === false) {
    title = `Батат «${name}» — саженцы и клубни, описание сорта | Batatchudo`;
    desc = `Сорт батата «${name}»${attrs}. Сейчас нет в наличии — оставьте заявку. Доставка саженцев и клубней батата по всей России.`;
    alt = `Батат «${name}» — саженцы и клубни`;
  } else if (price && price.price != null) {
    const p = price.priceFrom ? `от ${price.price} ₽` : `${price.price} ₽`;
    title = `Батат «${name}» — купить саженцы и клубни, ${p} | Batatchudo`;
    desc = `Сорт батата «${name}»${attrs}. Купить саженцы и клубни батата за ${p} с доставкой по России. Заказ в WhatsApp и Telegram.`;
    alt = `Батат «${name}» — купить саженцы и клубни`;
  } else {
    title = `Батат «${name}» — купить саженцы и клубни | Batatchudo`;
    desc = `Сорт батата «${name}»${attrs}. Купить саженцы и клубни батата с доставкой по России. Заказ в WhatsApp и Telegram.`;
    alt = `Батат «${name}» — купить саженцы и клубни`;
  }
  return { title, desc, alt };
}

// Plant / non-variety pages: curated titles (subtitle = keep existing description tail)
const PLANT_TITLE = {
  dzhinura: ['Джинура :SUB: — купить саженец, польза', 'Джинура'],
  chayot: ['Чайот :SUB: — купить саженец, уход', 'Чайот'],
  trihozant: ['Трихозант :SUB: — купить саженец, вкус', 'Трихозант'],
  tladianta: ['Тладианта :SUB: — купить клубни, уход', 'Тладианта'],
  yakon: ['Якон — купить клубни для посадки, польза', 'Якон'],
  yams: ['Ямс — купить клубни, виды и уход', 'Ямс'],
  kolokaziya: ['Колоказия :SUB: — купить саженец, уход', 'Колоказия'],
  stahis: ['Стахис :SUB: — купить клубни, посадка', 'Стахис'],
  chufa: ['Чуфа :SUB: — купить клубни, посадка', 'Чуфа'],
  'saharnyy-trostnik': ['Сахарный тростник — купить саженец, уход', 'Сахарный тростник'],
  dzhikama: ['Джикама :SUB: — купить клубни, уход', 'Джикама'],
  kivano: ['Кивано :SUB: — купить семена, уход', 'Кивано'],
  'bazilik-kiprskiy': ['Базилик кипрский :SUB: — купить саженец', 'Базилик кипрский'],
  'lichi-tomat': ['Личи томат — купить семена, посадка и уход', 'Личи томат'],
  momordika: ['Момордика — купить семена, посадка и уход', 'Момордика'],
  karipenze: ['Карипензе — купить, посадка и уход', 'Карипензе'],
  ciklantera: ['Циклантера — купить семена, посадка и уход', 'Циклантера'],
  maniok: ['Маниок :SUB: — купить, выращивание', 'Маниок'],
  banany: ['Бананы — купить саженец, выращивание', 'Бананы'],
  topinambur: ['Топинамбур — купить клубни, посадка', 'Топинамбур'],
  'melotriya-shershavaya': ['Мелотрия шершавая — купить семена, уход', 'Мелотрия шершавая'],
  naranhilla: ['Наранхилла :SUB: — купить семена, уход', 'Наранхилла'],
  lyuffa: ['Люффа — купить семена, выращивание', 'Люффа'],
  'vigna-kustovaya': ['Вигна :SUB: — купить семена', 'Вигна'],
  spilantes: ['Спилантес — купить семена, посадка и уход', 'Спилантес'],
  sikana: ['Сикана :SUB: — купить семена', 'Сикана'],
  kislica: ['Кислица :SUB: — купить, посадка и уход', 'Кислица'],
  'klenoviy-listok': ['Батат «Кленовый листок» — купить саженцы', 'Батат «Кленовый листок»'],
  kokciniya: ['Кокциния — купить, посадка и уход', 'Кокциния'],
  cifomandra: ['Цифомандра :SUB: — купить саженец', 'Цифомандра'],
  lemongrass: ['Лемонграсс — купить, выращивание', 'Лемонграсс'],
  imbir: ['Имбирь — купить корневища, выращивание', 'Имбирь'],
  lippiya: ['Липпия — купить, посадка и уход', 'Липпия'],
  bamiya: ['Бамия :SUB: — купить семена, уход', 'Бамия'],
  'anguriya-siriyskaya': ['Ангурия сирийская — купить семена', 'Ангурия сирийская'],
  'beninkaza-voskovaya-tykva': ['Тыква бенинказа :SUB: — купить семена', 'Тыква бенинказа'],
  'vodnyy-kashtan': ['Водный каштан — купить, посадка и уход', 'Водный каштан'],
  'yavanskiy-redis': ['Яванский редис — купить семена', 'Яванский редис'],
  ayote: ['Зелёная тыква Айоте — купить семена', 'Зелёная тыква Айоте'],
};

const sub = (s) => (s.match(/\(([^)]+)\)/)?.[1] ? `(${s.match(/\(([^)]+)\)/)[1]})` : '');

function plantMeta(slug, html) {
  const entry = PLANT_TITLE[slug];
  if (!entry) return null;
  const [titleTpl, alt] = entry;
  const existingDesc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const title = titleTpl.replace(' :SUB:', '').replace(/  +/g, ' ') + ' | Batatchudo';
  const clean = existingDesc.replace(/\s+/g, ' ').trim();
  const base = clean.length > 118 ? clean.slice(0, 115).replace(/[ ,.;:—-]+$/, '') + '…' : clean;
  const desc = `${base} Купить саженцы и семена с доставкой по России.`.trim();
  return { title, desc, alt };
}

const files = (await readdir(root)).filter((f) => f.endsWith('.html'));
let updated = 0;

for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  let html = await readFile(file, 'utf8');

  let meta = null;
  if (bySlug.has(slug) || VARIETY_EXTRA[slug]) {
    const v = bySlug.get(slug);
    const name = v?.name || VARIETY_EXTRA[slug];
    meta = varietyMeta(name, v, priceBySlug.get(slug));
  } else {
    meta = plantMeta(slug, html);
  }
  if (!meta) continue;

  if (dry) {
    const oldTitle = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
    if (updated < 14) console.log(`\n# ${file}\n  OLD: ${oldTitle}\n  NEW: ${meta.title}\n  DESC: ${meta.desc}`);
    updated++;
    continue;
  }

  const { title, desc, alt } = meta;
  let next = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:image:alt" content=")[^"]*(")/, `$1${esc(alt)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`);

  if (next !== html) { await writeFile(file, next, 'utf8'); }
  updated++;
}

console.log(`\n${dry ? 'would update' : 'updated'} ${updated} page(s)`);
