(function () {
  'use strict';

  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  let lang = root.lang === 'es' ? 'es' : 'en';

  const t = (key) => (window.I18N[lang] && window.I18N[lang][key]) || window.I18N.en[key] || key;
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] || v.en : v);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const ICONS = {
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>',
    live: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    docs: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

  /* ---------- Projects ---------- */
  function codePanel(code) {
    const body = code.lines.map(([cls, txt]) => `<span class="c-${cls}">${esc(txt)}</span>`).join('');
    return `<div class="codepanel" aria-hidden="true">
      <div class="codepanel__bar"><span></span><span></span><span></span><em>${esc(code.file)}</em></div>
      <pre><code>${body}</code></pre></div>`;
  }

  function mediaBlock(p) {
    const m = p.media;
    if (m && m.type === 'image') {
      return `<button class="media media--img" type="button" data-view="${p.id}" aria-label="${esc(m.alt)}: ${t('p.video') === 'Ver demo' ? 'ampliar' : 'enlarge'}">
        <img src="${esc(m.src)}" alt="${esc(m.alt)}" decoding="async"
          onerror="this.closest('.media').outerHTML = window.__codeFallback('${p.id}')" />
        <span class="media__hint">${icon('expand')}</span></button>`;
    }
    if (m && m.type === 'video') {
      return `<div class="media"><video src="${esc(m.src)}" ${m.poster ? `poster="${esc(m.poster)}"` : ''} muted loop playsinline preload="metadata"></video></div>`;
    }
    return `<div class="media">${codePanel(p.code)}</div>`;
  }
  window.__codeFallback = (id) => {
    const p = window.PROJECTS.find((x) => x.id === id);
    return `<div class="media">${codePanel(p.code)}</div>`;
  };

  function linkBtn(href, label, ic, primary) {
    return `<a class="btn btn--sm ${primary ? 'btn--primary' : 'btn--ghost'}" href="${esc(href)}" target="_blank" rel="noopener">${icon(ic)}${label}</a>`;
  }

  function renderProjects() {
    const list = $('#projectList');
    list.innerHTML = window.PROJECTS.map((p, i) => {
      const actions = [
        p.live && linkBtn(p.live, t('p.live'), 'live', true),
        linkBtn(p.repo, t('p.code'), 'code', !p.live),
        p.video && `<button class="btn btn--sm btn--ghost" type="button" data-video="${p.id}">${icon('play')}${t('p.video')}</button>`,
        p.docs && linkBtn(p.docs, t('p.docs'), 'docs', false),
      ].filter(Boolean).join('');

      return `<article class="project reveal ${i === 0 ? 'project--featured' : ''}" id="p-${p.id}">
        ${mediaBlock(p)}
        <div class="project__body">
          <div class="project__head">
            <h3>${esc(pick(p.title))}</h3>
            <span class="badge badge--${p.badgeTone}">${esc(pick(p.badge))}</span>
          </div>
          <p class="project__summary">${esc(pick(p.summary))}</p>
          <ul class="project__list">${pick(p.highlights).map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
          <ul class="tags" aria-label="Tech stack">${p.tags.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <div class="project__actions">${actions}</div>
        </div>
      </article>`;
    }).join('') +
      `<a class="more reveal" href="https://github.com/valelop2606?tab=repositories" target="_blank" rel="noopener">${t('p.more')} <span aria-hidden="true">→</span></a>`;
    observeReveals();
  }

  /* ---------- i18n ---------- */
  function applyLang() {
    root.lang = lang;
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $('#langToggle').textContent = lang === 'es' ? 'EN' : 'ES';
    $('#langToggle').setAttribute('aria-label', lang === 'es' ? 'Switch to English' : 'Cambiar a español');
    const cv = `assets/CV_Valeria_Lopez_${lang === 'es' ? 'ES' : 'EN'}.pdf`;
    $('#cvLinkHero').href = cv;
    document.title = lang === 'es' ? 'Valeria López · Desarrolladora Backend' : 'Valeria López · Backend Developer';
    renderProjects();
  }

  $('#langToggle').addEventListener('click', () => {
    lang = lang === 'es' ? 'en' : 'es';
    localStorage.setItem('lang', lang);
    applyLang();
  });

  /* ---------- Theme ---------- */
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches);
  $('#themeToggle').addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  /* ---------- Copy email ---------- */
  const copyBtn = $('#copyEmail');
  let copyTimer;
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.classList.add('is-copied');
      $('#copyStatus').textContent = t('contact.copiedSr');
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => copyBtn.classList.remove('is-copied'), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });

  /* ---------- Media viewer ---------- */
  const viewer = $('#viewer');
  const viewerBody = $('#viewerBody');
  function openViewer(html) {
    viewerBody.innerHTML = html;
    viewer.showModal();
  }
  function closeViewer() {
    viewer.classList.add('is-closing');
    setTimeout(() => {
      viewer.classList.remove('is-closing');
      viewer.close();
      viewerBody.innerHTML = '';
    }, 140);
  }
  $('#viewerClose').addEventListener('click', closeViewer);
  viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });
  viewer.addEventListener('cancel', (e) => { e.preventDefault(); closeViewer(); });

  document.addEventListener('click', (e) => {
    const v = e.target.closest('[data-video]');
    const img = e.target.closest('[data-view]');
    if (v) {
      const p = window.PROJECTS.find((x) => x.id === v.dataset.video);
      const vid = p.video;
      openViewer(
        typeof vid === 'object' && vid.type === 'youtube'
          ? `<iframe src="https://www.youtube-nocookie.com/embed/${esc(vid.id)}?autoplay=1" title="${esc(pick(p.title))} demo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
          : `<video src="${esc(vid)}" controls autoplay playsinline></video>`,
      );
    } else if (img) {
      const p = window.PROJECTS.find((x) => x.id === img.dataset.view);
      openViewer(`<img src="${esc(p.media.src)}" alt="${esc(p.media.alt)}" />`);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = !reduce && 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -60px 0px' })
    : null;
  function observeReveals() {
    $$('.reveal:not(.is-in)').forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));
  }
  $$('.service, .about__bio, .about__side, .contact').forEach((el) => el.classList.add('reveal'));

  /* ---------- Active nav link ---------- */
  const links = $$('.nav__links a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${en.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#contact'));
    }
  }, { passive: true });

  $('#year').textContent = new Date().getFullYear();
  applyLang();
})();
