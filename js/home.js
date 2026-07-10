const FAVORITES = ['Борегард','Победа 100','Белый НБС','Ковингтон','Бенихарука','Порто-Амарелло','Медовое Чудо','Карамельный','Сладкий №1'];

// Escaping wrappers (fall back to local impl if app.js not loaded)
function esc(s) {
  if (typeof escapeHTML === 'function') return escapeHTML(s);
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function attr(s) { return esc(s); }

function badgeClassFor(text) {
  const t = (text || '').toLowerCase();
  if (/ранний/.test(t)) return 'orange';
  if (/авторский/.test(t)) return 'pink';
  if (/патентован/.test(t)) return 'blue';
  if (/урожай/.test(t)) return 'green';
  if (/хранит|лежк/.test(t)) return 'blue';
  if (/популяр/.test(t)) return 'red';
  if (/декоратив/.test(t)) return 'purple';
  if (/новинк/.test(t)) return 'teal';
  if (/нович/.test(t)) return 'yellow';
  if (/сыроед/.test(t)) return 'green';
  if (/архив/.test(t)) return 'gray';
  if (/японская коллекция/.test(t)) return 'purple';
  return '';
}

function getBadges(v) {
  const original = Array.isArray(v.advantages) ? v.advantages : [];
  let list = original.filter(x => x !== 'Популярный');
  // Promote "Популярный" to the front if variety is popular
  const isPopular = original.includes('Популярный') || FAVORITES.includes(v.name);
  if (isPopular) list.unshift('Популярный');
  // Remove "Ранний" — уже показан в quick-chip "⏱ Ранний (80-90)" с конкретными днями
  if (v.term) list = list.filter(x => x !== 'Ранний');
  // Mark decorative variety even if not in advantages array
  if ((v.category === 'decor' || v.type === 'Декоративный') && !list.includes('Декоративный')) list.push('Декоративный');
  return list.slice(0, 3).map(text => ({ text, cls: badgeClassFor(text) }));
}

function getQuickChips(v) {
  const chips = [];
  const adv = Array.isArray(v.advantages) ? v.advantages : [];
  // Term chip — unique info (конкретные дни), не дублирует бейдж "Ранний"
  if (v.term) chips.push('⏱ ' + v.term);
  // Sweetness chip
  if (v.category === 'food' && v.sweetness) chips.push('Сладость ' + v.sweetness + '/10');
  // Status — берём только то, чего ещё нет в бейджах
  const knownStatus = ['Ранний', 'Авторский', 'Патентованный', 'Для новичков', 'Для сыроедения', 'Архивный', 'Популярный', 'Новинка', 'Высокая урожайность', 'Декоративный', 'Столовый', 'Отлично хранится', 'Японская коллекция'];
  const status = adv.find(a => !knownStatus.includes(a) && !FAVORITES.includes(a));
  if (status) chips.push(status);
  return chips.slice(0, 4);
}

function getOtherStatus(v) {
  const known = ['Ранний', 'Авторский', 'Патентованный', 'Для новичков', 'Для сыроедения', 'Архивный', 'Популярный', 'Новинка', 'Высокая урожайность', 'Декоративный', 'Столовый', 'Отлично хранится', 'Японская коллекция'];
  if (!Array.isArray(v.advantages)) return '';
  return v.advantages.filter(a => !known.includes(a) && !FAVORITES.includes(a)).join(', ');
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderVarietyCard(v) {
  const imgPath = v.img ? 'img/' + v.img : '';
  const pageUrl = v.img ? v.img.replace('.webp', '.html') : '';
  const overlays = [];
  if ((Array.isArray(v.advantages) && v.advantages.includes('Популярный')) || FAVORITES.includes(v.name)) overlays.push('<span class="st-card-overlay-badge popular">Популярный</span>');
  if (v.type === 'Японская коллекция') overlays.push('<span class="st-card-overlay-badge japanese">Японская коллекция</span>');
  if (Array.isArray(v.advantages) && v.advantages.includes('Новинка')) overlays.push('<span class="st-card-overlay-badge new">Новинка</span>');
  if (v.category === 'decor' || v.type === 'Декоративный') overlays.push('<span class="st-card-overlay-badge decor">Декоративный</span>');
  if (Array.isArray(v.advantages) && v.advantages.includes('Для новичков')) overlays.push('<span class="st-card-overlay-badge beginner">Для новичков</span>');
  if (Array.isArray(v.advantages) && v.advantages.includes('Патентованный')) overlays.push('<span class="st-card-overlay-badge patented">Патентованный</span>');
  if (Array.isArray(v.advantages) && v.advantages.includes('Для сыроедения')) overlays.push('<span class="st-card-overlay-badge raw">Для сыроедения</span>');
  if (Array.isArray(v.advantages) && v.advantages.includes('Архивный')) overlays.push('<span class="st-card-overlay-badge archive">Архивный</span>');
  const overlayHtml = overlays.length ? '<div class="st-card-overlay">' + overlays.join('') + '</div>' : '';
  const safeName = esc(v.name);
  const initial = esc((v.name || '').charAt(0));
  const imgHtml = imgPath
    ? '<div class="st-card-img-wrap">' + overlayHtml + '<img class="st-card-img" ' + cardImgAttrs(v.img) + ' alt="' + attr(v.name) + '" width="400" height="333" loading="lazy" decoding="async" onerror="this.outerHTML=\'<div class=st-card-fallback>' + initial + '</div>\'"></div>'
    : '<div class="st-card-img-wrap">' + overlayHtml + '<div class="st-card-fallback">' + initial + '</div></div>';
  const quickChips = getQuickChips(v);
  const status = getOtherStatus(v);
  if (status) quickChips.push(status);
  const quickHtml = quickChips.length ? '<div class="st-card-quick">' + quickChips.map(text => '<span class="st-card-quick-chip">' + esc(text) + '</span>').join('') + '</div>' : '';
  return '<div class="st-card" data-id="' + esc(v.id) + '">'
    + imgHtml
    + '<div class="st-card-body">'
    + '<div class="st-card-name">' + safeName + '</div>'
    + '<div class="st-card-color"><span class="color-dot ' + esc(getColorClass(v.color)) + '"></span> ' + esc(colorLabel(v.color)) + ' мякоть</div>'
    + quickHtml
    + '</div>'
    + '<div class="st-card-footer">'
    + '<a href="' + attr(pageUrl || 'opisanie-sortov-batata.html') + '" class="st-card-detail" style="grid-column:1/-1;">Подробнее</a>'
    + '</div>'
    + '</div>';
}

function getVarietiesWithImages() {
  return (typeof varieties !== 'undefined' ? varieties : []).filter(v => v.img && v.img.trim());
}

function renderHomeVarieties() {
  const container = document.getElementById('homeVarieties');
  if (!container) return;
  const available = getVarietiesWithImages();
  if (!available.length) return;
  const picks = shuffle(available).slice(0, 6);
  container.innerHTML = picks.map(renderVarietyCard).join('');
}

const PLANT_TAG_LABELS = { easy: '🌱 Новичкам', edible: '🍴 Съедобное', south: '☀ Южные', greenhouse: '🏠 Теплица', winter: '❄ Зимует' };
const PLANT_BADGE_LABELS = { popular: '🔥 Популяр', recommend: '🏆 Рекомендуем', new: '⭐ Новинка' };

function renderPlantCard(p) {
  const imgPath = p.img ? 'img/' + p.img : '';
  const pageUrl = p.page ? p.slug + '.html' : 'rasteniya.html';
  const badgeHtml = p.badge ? '<div class="home-plant-badge ' + esc(p.badge) + '">' + (PLANT_BADGE_LABELS[p.badge] || '') + '</div>' : '';
  const initial = esc((p.name || '').charAt(0));
  const imgHtml = imgPath
    ? '<div class="st-card-img-wrap">' + badgeHtml + '<img class="st-card-img" ' + cardImgAttrs(p.img) + ' alt="' + attr(p.name) + '" width="400" height="300" loading="lazy" decoding="async" onerror="this.outerHTML=\'<div class=st-card-fallback>' + initial + '</div>\'"></div>'
    : '<div class="st-card-img-wrap">' + badgeHtml + '<div class="st-card-fallback">' + initial + '</div></div>';
  const tagsHtml = (p.tags || []).slice(0, 2).map(t => '<span class="home-plant-tag ' + esc(t) + '">' + (PLANT_TAG_LABELS[t] || esc(t)) + '</span>').join('');
  return '<div class="home-plant-card" data-slug="' + attr(p.slug) + '">'
    + imgHtml
    + '<div class="st-card-body">'
    + '<div class="st-card-name">' + esc(p.name) + '</div>'
    + '<div class="st-card-color">' + (p.height ? '📏 ' + esc(p.height) : 'Экзотическая культура') + '</div>'
    + (tagsHtml ? '<div class="home-plant-tags">' + tagsHtml + '</div>' : '')
    + '</div>'
    + '<div class="st-card-footer">'
    + '<a href="' + attr(pageUrl) + '" class="st-card-detail" style="grid-column:1/-1;">Подробнее</a>'
    + '</div>'
    + '</div>';
}

function renderHomePlants() {
  const container = document.getElementById('homePlants');
  if (!container) return;
  const plants = Array.isArray(window.plantsCatalog) ? window.plantsCatalog.filter(p => p.img && p.img.trim()) : [];
  if (!plants.length) return;
  const picks = shuffle(plants).slice(0, 6);
  container.innerHTML = picks.map(renderPlantCard).join('');
}

function shuffleHomeAll() {
  renderHomeVarieties();
  renderHomePlants();
}

document.addEventListener('DOMContentLoaded', () => {
  renderHomeVarieties();
  if (Array.isArray(window.plantsCatalog)) renderHomePlants();
});
