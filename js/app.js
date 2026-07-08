/* ───── XSS-safe escaping helpers ───── */
function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return escapeHTML(str);
}

function safeSlug(name) {
  return String(name).replace(/[^a-zA-Z0-9\-_]/g, '').slice(0, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    // Close menu on link click (mobile UX)
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }
});

function getColorClass(color) {
  const map = {
    'Желтый': 'yellow',
    'Белый': 'white',
    'Оранжевый': 'orange',
    'Фиолетовый': 'purple',
    'Розовый': 'pink',
    'Красный': 'red',
    'Зеленый': 'green'
  };
  return map[color] || '';
}

function colorLabel(c) { return (c || '').replace(/ый$/, 'ая'); }

function getImgPath(v) {
  if (v.img) return 'img/' + v.img;
  return '';
}

function renderCatalog(items, containerId = 'catalogGrid') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items.map(v => {
    const imgPath = getImgPath(v);
    const safeImg = safeSlug(v.img || '');
    const pageUrl = safeImg ? safeImg.replace('.webp', '.html') : '';
    const colorCls = getColorClass(v.color);
    const colorTag = v.color ? `<span class="tag ${colorCls}">${escapeHTML(v.color)}</span>` : '';
    const typeTag = v.category === 'decor'
      ? '<span class="tag decor-tag">Декоративный</span>'
      : v.type === 'Авторский' ? '<span class="tag author-tag">Авторский</span>' : '';
    const patentTag = v.patent ? '<span class="tag patent-tag">Патентированный</span>' : '';
    const safeName = escapeHTML(v.name);
    const initial = escapeHTML(v.name.charAt(0));
    const imgTag = imgPath
      ? `<img class="catalog-card-img" src="${escapeAttr(imgPath)}" alt="${safeName}" width="300" height="400" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fallbackDisplay = imgPath ? 'display:none;' : '';
    const linkAttrs = pageUrl
      ? `href="${escapeAttr(pageUrl)}"`
      : `href="#" onclick="openModal(${parseInt(v.id, 10) || 0}); return false;"`;
    return `
    <a ${linkAttrs} class="catalog-card">
      ${imgTag}
      <div class="catalog-card-img-fallback" style="${fallbackDisplay}background:linear-gradient(135deg,#d8f3dc,#b7e4c7);align-items:center;justify-content:center;color:var(--green-500);font-size:2.5rem;font-weight:700;">${initial}</div>
      <div class="catalog-card-body">
        <h3>${safeName}</h3>
        <div class="meta">
          ${colorTag}
          ${typeTag}
          ${patentTag}
        </div>
      </div>
    </a>`;
  }).join('');
}

function openModal(id) {
  const v = varieties.find(x => x.id === id);
  if (!v) return;
  const overlay = document.getElementById('varietyModal');
  if (!overlay) return;

  const imgPath = getImgPath(v);
  const safeName = escapeHTML(v.name);
  const initial = escapeHTML(v.name.charAt(0));

  overlay.querySelector('.modal-content').innerHTML = `
    <button class="modal-close" onclick="closeModal()" aria-label="Закрыть">✕</button>
    <div class="modal-grid">
      <div>
        ${imgPath ? `<img src="${escapeAttr(imgPath)}" alt="${safeName}" width="300" height="400" style="width:100%;border-radius:var(--radius-sm);aspect-ratio:3/4;object-fit:cover;background:var(--green-100);display:block" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">` : ''}
        <div style="${imgPath ? 'display:none;' : ''}background:linear-gradient(135deg,#d8f3dc,#b7e4c7);border-radius:var(--radius-sm);aspect-ratio:3/4;align-items:center;justify-content:center;font-size:6rem;font-weight:700;color:var(--green-500)">${initial}</div>
      </div>
      <div>
        <h2>${safeName}</h2>
        <div class="chars">
          <div class="char-item">
            <div class="label">Цвет мякоти</div>
            <div class="value">${escapeHTML(v.color || '')}</div>
          </div>
          <div class="char-item">
            <div class="label">Тип</div>
            <div class="value">${escapeHTML(v.type || 'Столовый')}</div>
          </div>
          ${v.term && v.term !== '—' ? `<div class="char-item"><div class="label">Срок вегетации</div><div class="value">${escapeHTML(v.term)}</div></div>` : ''}
          ${v.yield ? `<div class="char-item"><div class="label">Особенности</div><div class="value">${escapeHTML(v.yield)}</div></div>` : ''}
        </div>
        ${v.desc ? `<div class="description">${escapeHTML(v.desc)}</div>` : ''}
        ${v.rawTaste ? `<div class="description" style="margin-top:12px"><strong>В сыром виде:</strong> ${escapeHTML(v.rawTaste)}</div>` : ''}
        ${v.bakedTaste ? `<div class="description" style="margin-top:8px"><strong>В запеченном виде:</strong> ${escapeHTML(v.bakedTaste)}</div>` : ''}
      </div>
    </div>
  `;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('varietyModal');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function initCatalog() {
  const categoryFilter = document.getElementById('categoryFilter');
  const colorFilter = document.getElementById('colorFilter');
  const searchInput = document.getElementById('searchInput');
  const countEl = document.getElementById('varietyCount');

  let currentCategory = '';
  let currentColor = '';

  // Pill click handlers
  if (categoryFilter) {
    categoryFilter.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      categoryFilter.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.value;
      filter();
    });
  }

  if (colorFilter) {
    colorFilter.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      colorFilter.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentColor = pill.dataset.value;
      filter();
    });
  }

  function filter() {
    let items = [...varieties];
    const search = searchInput?.value?.toLowerCase();

    if (currentCategory) items = items.filter(v => v.category === currentCategory);
    if (currentColor) items = items.filter(v => v.color === currentColor);
    if (currentPatent) items = items.filter(v => v.patent);
    if (search) items = items.filter(v => v.name.toLowerCase().includes(search));

    renderCatalog(items);
    if (countEl) countEl.textContent = items.length;
  }

  // Patent filter
  const patentFilter = document.getElementById('patentFilter');
  let currentPatent = false;

  if (patentFilter) {
    patentFilter.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;
      patentFilter.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentPatent = pill.dataset.value === 'patent';
      filter();
    });
  }

  searchInput?.addEventListener('input', filter);
  filter();
}

/* Lightbox */
(function() {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="lightbox-close">&times;</button><button class="lightbox-prev">&lsaquo;</button><img src="" alt=""><button class="lightbox-next">&rsaquo;</button><div class="lightbox-counter"></div>';
  document.body.appendChild(lightbox);
  const img = lightbox.querySelector('img');
  const counter = lightbox.querySelector('.lightbox-counter');
  let images = [], current = 0;

  function open(idx) {
    current = idx;
    show();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function show() {
    if (images.length === 0) return;
    img.src = images[current];
    counter.textContent = (current + 1) + ' / ' + images.length;
  }

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  });
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
    current = (current - 1 + images.length) % images.length;
    show();
  });
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
    current = (current + 1) % images.length;
    show();
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
    if (e.key === 'ArrowLeft') { current = (current - 1 + images.length) % images.length; show(); }
    if (e.key === 'ArrowRight') { current = (current + 1) % images.length; show(); }
  });

  document.addEventListener('click', (e) => {
    const gal = e.target.closest('.gallery-grid, .chufa-gallery-grid, .pl-gallery-grid');
    if (!gal) return;
    const clicked = e.target.closest('img');
    if (!clicked) return;
    images = Array.from(gal.querySelectorAll('img')).map(i => i.src);
    const idx = images.indexOf(clicked.src);
    if (idx !== -1) open(idx);
  });
})();
