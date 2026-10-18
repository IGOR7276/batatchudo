#!/usr/bin/env node
/* Normalize the site navigation (header nav + footer "Разделы" column) across
   every HTML page. Adds the "Полезное" dropdown (Рецепты / Статьи).

   Usage:
     node tools/normalize-nav.mjs          # rewrite files
     node tools/normalize-nav.mjs --dry    # report only
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY = process.argv.includes('--dry');

const ITEMS = [
  { key: 'home', label: 'Главная', href: 'index.html', home: true },
  { key: 'catalog', label: 'Каталог', href: 'opisanie-sortov-batata.html' },
  { key: 'grow', label: 'Выращивание', href: 'vyrashchivanie-batata.html' },
  { key: 'plants', label: 'Растения', href: 'rasteniya.html' },
  { key: 'price', label: 'Прайс', href: 'price.html' },
  {
    key: 'poleznoe', label: 'Полезное', href: 'poleznoe.html',
    children: [
      { key: 'poleznoe', label: 'Обзор', href: 'poleznoe.html' },
      { key: 'recepty', label: 'Рецепты', href: 'recepty.html' },
      { key: 'stati', label: 'Статьи', href: 'articles.html' },
    ],
  },
  { key: 'kontakty', label: 'Контакты', href: 'kontakty.html' },
  { key: 'about', label: 'О нас', href: 'o-nas.html' },
];

const FOOTER_LINKS = [
  { label: 'Сорта батата', href: 'opisanie-sortov-batata.html' },
  { label: 'Выращивание', href: 'vyrashchivanie-batata.html' },
  { label: 'Растения', href: 'rasteniya.html' },
  { label: 'Прайс', href: 'price.html' },
  { label: 'Рецепты', href: 'recepty.html' },
  { label: 'Статьи', href: 'articles.html' },
  { label: 'О нас', href: 'o-nas.html' },
  { label: 'Контакты', href: 'kontakty.html' },
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'tools') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function relPrefix(file) {
  const rel = path.relative(ROOT, path.dirname(file)).split(path.sep).filter(Boolean);
  return rel.map(() => '../').join('');
}

function keyFromHref(href) {
  const h = String(href).toLowerCase();
  if (/recepty/.test(h)) return 'recepty';
  if (/articles/.test(h) || /poleznoe/.test(h)) return (/(^|[\/])articles/.test(h) ? 'stati' : 'poleznoe');
  if (/index\.html$/.test(h) || /(^|[\/])$/.test(h)) return 'home';
  if (/opisanie-sortov/.test(h)) return 'catalog';
  if (/vyrashchivanie/.test(h)) return 'grow';
  if (/rasteniya/.test(h)) return 'plants';
  if (/price/.test(h)) return 'price';
  if (/kontakty/.test(h)) return 'kontakty';
  if (/o-nas/.test(h)) return 'about';
  return null;
}

function keyFromFile(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (rel === 'index.html') return 'home';
  if (rel.startsWith('recepty')) return 'recepty';
  if (rel.startsWith('articles')) return 'stati';
  if (rel === 'poleznoe.html') return 'poleznoe';
  if (rel === 'articles.html') return 'stati';
  if (rel === 'recepty.html') return 'recepty';
  if (rel === 'opisanie-sortov-batata.html') return 'catalog';
  if (rel === 'vyrashchivanie-batata.html') return 'grow';
  if (rel === 'rasteniya.html') return 'plants';
  if (rel === 'price.html') return 'price';
  if (rel === 'kontakty.html') return 'kontakty';
  if (rel === 'o-nas.html') return 'about';
  return null;
}

function detectActive(html, file) {
  const fromFile = keyFromFile(file);
  if (fromFile) return fromFile;
  const nav = html.match(/<nav class="nav"[^>]*>[\s\S]*?<\/nav>/);
  if (nav) {
    for (const m of nav[0].matchAll(/<a\b[^>]*>/gi)) {
      const tag = m[0];
      if (!/\bactive\b/.test(tag) || /nav-drop/.test(tag)) continue;
      const href = tag.match(/href="([^"]+)"/i);
      if (!href) continue;
      const k = keyFromHref(href[1]);
      if (k) return k;
    }
  }
  return 'unknown';
}

function a(href, label, active, indent = 6, extraClass = '') {
  const cls = [extraClass, active ? 'active' : ''].filter(Boolean).join(' ');
  const classAttr = cls ? ` class="${cls}"` : '';
  return `${' '.repeat(indent)}<a href="${href}"${classAttr}>${label}</a>`;
}

function renderNav(active, prefix) {
  const lines = ['    <nav class="nav" id="site-navigation">'];
  for (const item of ITEMS) {
    const href = item.home ? (prefix ? `${prefix}index.html` : '/') : `${prefix}${item.href}`;
    if (item.children) {
      const parentActive = active === 'poleznoe' || item.children.some((c) => c.key === active);
      const cls = ['nav-drop', parentActive ? 'nav-drop--current' : ''].filter(Boolean).join(' ');
      lines.push(`      <div class="nav-dropdown">`);
      lines.push(`        <a href="${href}" class="${cls}" aria-haspopup="true" aria-expanded="false">${item.label}<span class="nav-caret" aria-hidden="true"></span></a>`);
      lines.push(`        <div class="nav-dropdown-menu">`);
      for (const child of item.children) {
        lines.push(a(`${prefix}${child.href}`, child.label, active === child.key, 10));
      }
      lines.push(`        </div>`);
      lines.push(`      </div>`);
    } else {
      lines.push(a(href, item.label, active === item.key));
    }
  }
  lines.push('    </nav>');
  return lines.join('\n');
}

function renderFooter(prefix) {
  const lines = ['      <div>', '        <h4>Разделы</h4>'];
  for (const l of FOOTER_LINKS) lines.push(`        <a href="${prefix}${l.href}">${l.label}</a>`);
  lines.push('      </div>');
  return lines.join('\n');
}

const NAV_RE = /[ \t]*<nav class="nav"[^>]*>[\s\S]*?<\/nav>/;
const FOOTER_RE = /[ \t]*<div>\s*<h4>Разделы<\/h4>[\s\S]*?<\/div>/;

const files = walk(ROOT);
let changed = 0, noNav = 0, noFooter = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const hasNav = NAV_RE.test(html);
  const hasFooter = FOOTER_RE.test(html);
  if (!hasNav && !hasFooter) continue;

  const prefix = relPrefix(file);
  const active = detectActive(html, file);
  let out = html;
  if (hasNav) out = out.replace(NAV_RE, renderNav(active, prefix));
  if (hasFooter) out = out.replace(FOOTER_RE, renderFooter(prefix));
  else noFooter++;

  if (out !== html) {
    changed++;
    if (DRY) console.log(`would update: ${path.relative(ROOT, file)} (active=${active})`);
    else fs.writeFileSync(file, out, 'utf8');
  }
  if (!hasNav) noNav++;
}

console.log(`${DRY ? '[dry] ' : ''}files scanned: ${files.length}, updated: ${changed}, without nav: ${noNav}, without footer column: ${noFooter}`);
