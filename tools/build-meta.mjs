/* Rewrites <title>, meta description and social tags for product/plant pages.
 *
 * Two intents:
 *   - variety cards: commercial ("купить", price, availability)
 *   - plant/exotic pages: informational ("что это", "фото", "выращивание"),
 *     because Search Console shows informational queries with low CTR there.
 *
 * Data sources:
 *   - js/data.js     -> batat variety attributes
 *   - data/catalog.json -> price/availability (from price.html)
 *   - page HTML      -> hero tagline used as the base for plant descriptions
 *
 * Run: node tools/build-meta.mjs                    (writes)
 *      node tools/build-meta.mjs --dry              (preview only)
 *      node tools/build-meta.mjs --only=dzhinura,kivano   (subset)
 *      node tools/build-meta.mjs --dry --only=...
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';

const dry = process.argv.includes('--dry');
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg
  ? new Set(onlyArg.slice('--only='.length).split(',').map((s) => s.trim()).filter(Boolean))
  : null;
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
  ayote: ['Зелёная тыква Айоте: сорт, фото, семена', 'Зелёная тыква Айоте'],
};

const sub = (s) => (s.match(/\(([^)]+)\)/)?.[1] ? `(${s.match(/\(([^)]+)\)/)[1]})` : '');

/* Curated metas for pages where Search Console shows high impressions but
 * near-zero CTR: queries are informational ("фото", "что это", "выращивание"),
 * while the old title promised a purchase. Descriptions are written as whole
 * sentences and include availability only when catalog.json confirms it. */
const PLANT_META = {
  dzhinura: {
    title: 'Джинура: фото, польза и выращивание | Batatchudo',
    desc: 'Джинура (Gynura procumbens): фото растения, полезные свойства, посадка и уход в домашних условиях и в саду. Саженцы в наличии.',
    alt: 'Джинура — фото, польза и выращивание',
  },
  'vyrashchivanie-batata': {
    title: 'Как вырастить батат: от клубня до урожая | Batatchudo',
    desc: 'Пошагово: как вырастить батат из клубня и черенка, сроки посадки, полив, когда копать и как хранить урожай. Фото и советы.',
    alt: 'Как вырастить батат — пошаговое руководство',
  },
  kivano: {
    title: 'Кивано: что это, фото, вкус и выращивание | Batatchudo',
    desc: 'Кивано (африканский огурец, рогатая дыня): фото, вкус и польза. Как вырастить из семян через рассаду и когда собирать урожай. Семена в наличии.',
    alt: 'Кивано — что это, фото и выращивание',
  },
  yams: {
    title: 'Ямс: что это, виды, фото и выращивание | Batatchudo',
    desc: 'Ямс (Dioscorea) — лиана со съедобными клубнями. Чем отличается от батата, какие виды бывают, как посадить и вырастить урожай.',
    alt: 'Ямс — виды, фото и выращивание',
  },
  kolokaziya: {
    title: 'Колоказия (таро): фото, посадка и уход | Batatchudo',
    desc: 'Колоказия съедобная (таро): фото, вкус клубней, посадка и уход. Как вырастить в водоёме или грунте и собрать урожай. Саженцы в наличии.',
    alt: 'Колоказия (таро) — фото, посадка и уход',
  },
  chayot: {
    title: 'Чайот: что это, фото, вкус и выращивание | Batatchudo',
    desc: 'Чайот (мексиканский огурец): фото, вкус плодов и польза. Как вырастить лиану, когда собирать урожай и что из него приготовить.',
    alt: 'Чайот — фото, вкус и выращивание',
  },
  trihozant: {
    title: 'Трихозант: фото, вкус и выращивание лианы | Batatchudo',
    desc: 'Трихозант (змеевидный огурец): фото, вкус плодов до 1 метра, ароматные цветы. Посадка, уход и сбор урожая. Семена в наличии.',
    alt: 'Трихозант — фото, вкус и выращивание',
  },
  maniok: {
    title: 'Маниок (кассава): что это, фото и выращивание | Batatchudo',
    desc: 'Маниок съедобный (кассава): фото, клубни и применение. Как вырастить в тёплом климате, сроки вегетации и особенности ухода.',
    alt: 'Маниок (кассава) — фото и выращивание',
  },
  tladianta: {
    title: 'Тладианта: красный огурец, фото и выращивание | Batatchudo',
    desc: 'Тладианта (красный огурец): фото, вкус, опыление. Как посадить клубнями, вырастить лиану и собрать урожай. Неприхотливый многолетник.',
    alt: 'Тладианта — красный огурец, фото и выращивание',
  },
  'vodnyy-kashtan': {
    title: 'Водный каштан: фото, посадка и уход | Batatchudo',
    desc: 'Водный каштан (Eleocharis dulcis): фото, вкус клубней, польза. Как посадить в пруду или контейнере и собрать урожай. Семена в наличии.',
    alt: 'Водный каштан — фото, посадка и уход',
  },
  'saharnyy-trostnik': {
    title: 'Сахарный тростник: фото, выращивание и уход | Batatchudo',
    desc: 'Сахарный тростник: фото, посадка через рассаду, полив и уход. Когда собирать стебли и как получить сладкий сок. Семена в наличии.',
    alt: 'Сахарный тростник — фото, выращивание и уход',
  },
  ayote: {
    title: 'Зелёная тыква Айоте: сорт, фото, семена | Batatchudo',
    desc: 'Зелёная тыква Айоте — мускатный сорт из Гватемалы с зелёной мякотью. Фото, описание, вкус печёного каштана. Хранение 6–8 месяцев. Семена в наличии.',
    alt: 'Зелёная тыква Айоте — фото и описание сорта',
  },
};

const DESC_MAX = 158;
const COMMERCIAL_TAIL = /\s*Купить саженцы и семена с доставкой по России\.?\s*$/i;

const stripTags = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const ensureDot = (s) => (/[.!?]$/.test(s) ? s : `${s}.`);

/* Cuts text at the last sentence boundary that fits, never mid-word. */
function trimToSentence(s, max) {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return ensureDot(t);
  const cut = t.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (stop > 40) return cut.slice(0, stop + 1).trim();
  const space = cut.lastIndexOf(' ');
  return ensureDot(cut.slice(0, space > 0 ? space : max).replace(/[ ,.;:—–-]+$/, ''));
}

/* Old descriptions were truncated with "…" and glued to a sales tail. */
function cleanBase(s) {
  let t = stripTags(s).replace(COMMERCIAL_TAIL, '').trim();
  if (t.includes('…')) {
    const before = t.slice(0, t.indexOf('…')).trim();
    const stop = Math.max(before.lastIndexOf('. '), before.lastIndexOf('! '), before.lastIndexOf('? '));
    t = (stop > 40 ? before.slice(0, stop + 1) : before).trim();
  }
  return t;
}

function plantMeta(slug, html) {
  const curated = PLANT_META[slug];
  if (curated) return { title: curated.title, desc: curated.desc, alt: curated.alt };

  const entry = PLANT_TITLE[slug];
  if (!entry) return null;
  const [titleTpl, alt] = entry;
  const title = titleTpl.replace(' :SUB:', '').replace(/  +/g, ' ') + ' | Batatchudo';

  const hero = (html.match(/<p class="pl-hero-desc">([\s\S]*?)<\/p>/) || [])[1] || '';
  const existingDesc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  let base = cleanBase(hero || existingDesc);
  if (base.length < 90) base = `${base} Фото, описание и правила выращивания.`.trim();
  const desc = trimToSentence(base, DESC_MAX);
  return { title, desc, alt };
}

const files = (await readdir(root)).filter((f) => f.endsWith('.html'));
let updated = 0;

for (const file of files) {
  const slug = file.replace(/\.html$/, '');
  if (only && !only.has(slug)) continue;
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
    const oldTitle = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const oldDesc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
    const flag = (n, lim) => (n > lim ? `  ⚠ >${lim}` : '');
    console.log(
      `\n# ${file}\n` +
        `  OLD T(${oldTitle.length})${flag(oldTitle.length, 60)}: ${oldTitle}\n` +
        `  NEW T(${meta.title.length})${flag(meta.title.length, 60)}: ${meta.title}\n` +
        `  OLD D(${oldDesc.length})${flag(oldDesc.length, 160)}: ${oldDesc}\n` +
        `  NEW D(${meta.desc.length})${flag(meta.desc.length, 160)}: ${meta.desc}`,
    );
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
