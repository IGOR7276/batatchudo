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

/* Build responsive srcset for a card thumbnail image file (e.g. "napoleon.webp").
   Uses pre-generated -400w / -600w variants when available (window.IMG_VARIANTS). */
function cardImgSrcset(imgFile) {
  if (!imgFile) return '';
  const base = imgFile.replace(/\.webp$/i, '');
  const variants = Array.isArray(window.IMG_VARIANTS) ? window.IMG_VARIANTS : [];
  if (variants.indexOf(base) === -1) return '';
  return `img/${base}-400w.webp 400w, img/${base}-600w.webp 600w, img/${imgFile} 900w`;
}

/* Returns ready-to-inline attributes: src + (srcset + sizes) for a card image */
function cardImgAttrs(imgFile, sizes) {
  const src = 'img/' + imgFile;
  const set = cardImgSrcset(imgFile);
  const sizesAttr = sizes || '(max-width: 768px) 90vw, 300px';
  return set
    ? `src="${escapeAttr(src)}" srcset="${escapeAttr(set)}" sizes="${escapeAttr(sizesAttr)}"`
    : `src="${escapeAttr(src)}"`;
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
