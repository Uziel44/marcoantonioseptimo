/* main.js — Marco Antonio Séptimo · vanilla JS, sin librerías */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');                       // activa los estados "ocultos" del CSS (.js .reveal)

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isMobile = window.matchMedia('(max-width: 767.98px)');
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const smooth = () => (reduce.matches ? 'auto' : 'smooth');

  /* ───────── 0. Datos de contacto (un solo lugar para completar) ───────── */
  // WhatsApp en formato internacional sin "+", con 9 y sin 0 ni 15 (ej.: 5493515551234). WA_DISPLAY es cómo se muestra el número en la página.
  const WA_NUMBER = '5493512271316';
  const WA_DISPLAY = '+54 9 3512 27-1316';
  // TODO cliente: email de contacto (se muestra y enlaza en Contacto y Footer)
  const CONTACT_EMAIL = '';
  // TODO opcional: endpoint de la plataforma de newsletter (POST JSON { email }). Vacío = se envía por WhatsApp.
  const SUBSCRIBE_ENDPOINT = '';

  const WA_READY = /^\d{10,15}$/.test(WA_NUMBER) && WA_NUMBER !== '5493510000000';
  const waUrl = text => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  // Mientras no haya número real, los botones de WhatsApp llevan al formulario de contacto (no a un chat ajeno).
  if (WA_READY) {
    $$('[data-wa]').forEach(a => {
      a.href = waUrl(a.dataset.wa);
      a.target = '_blank';
      a.rel = 'noopener';
    });
    $$('[data-wa-label]').forEach(el => {
      el.textContent = WA_DISPLAY;
      el.classList.remove('ph');
    });
  }
  if (CONTACT_EMAIL) {
    $$('[data-email]').forEach(a => {
      a.href = `mailto:${CONTACT_EMAIL}`;
      a.textContent = CONTACT_EMAIL;
      a.classList.remove('ph');
    });
  }
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ───────── 1. Nav sticky: cambia al scrollear + se oculta al bajar (solo móvil) ───────── */
  const nav = $('.nav');
  let lastY = window.scrollY;
  let navTick = false;
  const updateNav = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    const menuOpen = document.body.classList.contains('menu-open');
    if (isMobile.matches && !menuOpen && y > 480 && y > lastY + 6) nav.classList.add('is-hidden');
    else if (y < lastY - 6 || y <= 480 || !isMobile.matches) nav.classList.remove('is-hidden');
    lastY = y;
    navTick = false;
  };
  window.addEventListener('scroll', () => {
    if (!navTick) { navTick = true; requestAnimationFrame(updateNav); }
  }, { passive: true });
  updateNav();

  /* ───────── 2. Menú móvil ───────── */
  const burger = $('.nav__burger');
  const menu = $('#menu');
  const setMenu = open => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) { const first = $('a', menu); if (first) first.focus({ preventScroll: true }); }
  };
  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 1180px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  }

  /* ───────── 3. Hero: parallax mínimo de la foto (solo ≥768px y sin reduced-motion) ───────── */
  const heroImg = $('.hero__media img');
  if (heroImg && !reduce.matches && !isMobile.matches) {
    let heroTick = false;
    window.addEventListener('scroll', () => {
      if (heroTick) return;
      heroTick = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        heroImg.style.transform = `translate3d(0, ${(y * 0.08).toFixed(1)}px, 0) scale(1.04)`;
        heroTick = false;
      });
    }, { passive: true });
  }

  /* ───────── 4. Reveal al scrollear (IntersectionObserver) ───────── */
  $$('[data-stagger]').forEach(group =>
    Array.from(group.children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--i', i);
    })
  );
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  /* ───────── 4b. Credenciales: se abren con hover (mouse), o con toque / teclado ───────── */
  $$('.creds__item').forEach(item => {
    const btn = $('.creds__btn', item);
    const set = open => {
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    item.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') set(true); });
    item.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') set(false); });
    // El mouse ya abrió con el hover: el click solo actúa con dedo o teclado (pointerType vacío)
    btn.addEventListener('click', e => { if (e.pointerType !== 'mouse') set(!item.classList.contains('is-open')); });
  });

  /* ───────── 4c. Fotos de Cursos en celular: 2 filas que se mueven solas (arriba hacia la derecha, abajo hacia la izquierda) ───────── */
  const photos = $('.photos');
  if (photos) {
    const phone = window.matchMedia('(max-width: 639.98px)');
    const figs = Array.from(photos.children);          // orden original: es el que usa la grilla en tablet y escritorio
    const build = () => {
      if (photos.classList.contains('is-marquee')) return;
      const half = Math.ceil(figs.length / 2);
      [figs.slice(0, half), figs.slice(half)].forEach((set, n) => {
        // El video va al final de su fila: así nunca se copia y queda un solo <video> en la página
        const v = set.findIndex(f => f.classList.contains('photo--video'));
        const items = v < 0 ? set : set.slice(v + 1).concat(set.slice(0, v + 1));
        const row = document.createElement('div');
        const track = document.createElement('div');
        row.className = 'photos__row';
        track.className = n ? 'photos__track photos__track--left' : 'photos__track';
        items.forEach(f => track.appendChild(f));
        // Copias de las primeras 3 fotos al final de la fila: el recorrido se repite sin saltos
        items.slice(0, 3).forEach(f => {
          const copy = f.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          copy.inert = true;
          track.appendChild(copy);
        });
        row.appendChild(track);
        photos.appendChild(row);
      });
      photos.classList.add('is-marquee');
    };
    const restore = () => {
      if (!photos.classList.contains('is-marquee')) return;
      $$('.photo[aria-hidden]', photos).forEach(copy => copy.remove());
      figs.forEach(f => photos.appendChild(f));
      $$('.photos__row', photos).forEach(row => row.remove());
      photos.classList.remove('is-marquee', 'is-paused');
    };
    const sync = () => (phone.matches ? build() : restore());
    sync();
    phone.addEventListener('change', sync);
    // Las fotos que arrancan fuera de la fila no entran solas en la carga diferida: al acercarse a la sección se cargan todas
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries, obs) => {
        if (!entries.some(en => en.isIntersecting)) return;
        if (photos.classList.contains('is-marquee')) $$('img[loading="lazy"]', photos).forEach(img => { img.loading = 'eager'; });
        obs.disconnect();
      }, { rootMargin: '600px 0px' }).observe(photos);
    }

    // Pausa mientras se toca una fila o se reproduce el video (con el mouse encima o con foco, lo resuelve el CSS)
    let touching = false, playing = false, resume;
    const pause = () => photos.classList.toggle('is-paused', touching || playing);
    photos.addEventListener('pointerdown', () => { clearTimeout(resume); touching = true; pause(); });
    ['pointerup', 'pointercancel'].forEach(type => photos.addEventListener(type, () => {
      clearTimeout(resume);
      resume = setTimeout(() => { touching = false; pause(); }, 1500);
    }));
    const video = $('video', photos);
    if (video) {
      video.addEventListener('play', () => { playing = true; pause(); });
      ['pause', 'ended'].forEach(type => video.addEventListener(type, () => { playing = false; pause(); }));
    }
  }

  /* ───────── 5. Link activo del menú según la sección visible ───────── */
  const links = $$('.nav__link, .menu__link');
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => {
          const on = l.getAttribute('href') === `#${en.target.id}`;
          if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ───────── 6. Carruseles (scroll-snap nativo + flechas + progreso) ───────── */
  $$('[data-carousel]').forEach(car => {
    const track = $('[data-track]', car);
    const slides = $$('[data-slide]', track);
    const prev = $('[data-prev]', car);
    const next = $('[data-next]', car);
    const bar = $('[data-bar]', car);
    const count = $('[data-count]', car);
    if (!track || slides.length < 2) return;

    const pad = n => String(n).padStart(2, '0');
    // Galería y libros en celular: grilla de 2x2 que avanza por páginas de 2 columnas (4 tarjetas). En el resto, una tarjeta por vez.
    const paged = car.matches('.carousel--art, .carousel--books') ? window.matchMedia('(max-width: 639.98px)') : null;
    const isPaged = () => !!paged && paged.matches;
    const step = () => (isPaged() ? 2 : 1) * (slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left);
    const go = dir => track.scrollBy({ left: dir * step(), behavior: smooth() });

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const x = track.scrollLeft;
      const total = isPaged() ? Math.ceil(slides.length / 4) : slides.length;
      if (prev) prev.setAttribute('aria-disabled', String(x <= 2));
      if (next) next.setAttribute('aria-disabled', String(x >= max - 2));
      if (bar) bar.style.transform = `scaleX(${max > 0 ? (x + track.clientWidth) / track.scrollWidth : 1})`;
      if (count) count.textContent = `${pad(Math.min(total, Math.round(x / step()) + 1))} / ${pad(total)}`;
    };

    if (prev) prev.addEventListener('click', () => go(-1));
    if (next) next.addEventListener('click', () => go(1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
    });
    let t;
    track.addEventListener('scroll', () => { cancelAnimationFrame(t); t = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ───────── 7. Etiqueta "Próxima / Realizada" según data-date ───────── */
  const now = new Date();
  $$('[data-date]').forEach(el => {
    const tag = $('[data-when]', el);
    if (!tag) return;
    const past = new Date(`${el.dataset.date}T23:59:59`) < now;
    tag.textContent = past ? 'Realizada' : 'Próxima';
    tag.classList.toggle('is-upcoming', !past);
  });

  /* ───────── 9. Lightbox de obras con <dialog> nativo ───────── */
  const dlg = $('#lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    const big = $('img', dlg);
    const cap = $('figcaption', dlg);
    $$('[data-zoom]').forEach(btn => btn.addEventListener('click', () => {
      big.src = btn.dataset.zoom;
      big.alt = btn.dataset.alt || '';
      cap.textContent = btn.dataset.caption || '';
      dlg.showModal();
    }));
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  }

  /* ───────── 9b. Sinopsis de los libros en tarjeta emergente (botón data-open="id-del-dialog") ───────── */
  $$('[data-open]').forEach(btn => btn.addEventListener('click', () => {
    const d = document.getElementById(btn.dataset.open);
    if (!d || typeof d.showModal !== 'function') return;
    d.showModal();
    d.scrollTop = 0;                                              // el foco inicial cae en "Cerrar" y desplaza al final
  }));
  $$('dialog.syn-dialog').forEach(d =>
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-close]')) d.close(); })
  );

  /* ───────── 10. Formularios (sin backend: el envío se arma por WhatsApp) ───────── */
  const setStatus = (form, msg, isError = false) => {
    const status = $('[role="status"]', form);
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle('is-error', isError);
  };

  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus(form, 'Revisá los campos marcados.', true);
        return;
      }
      const d = new FormData(form);
      if (d.get('web')) return;                                   // honeypot anti-spam
      if (!WA_READY) {
        // TODO cliente: cargar WA_NUMBER arriba (o conectar acá un envío por email).
        setStatus(form, 'El envío está por activarse. Mientras tanto, escribinos por redes.', true);
        return;
      }
      const tel = d.get('telefono') ? ` Mi teléfono: ${d.get('telefono')}.` : '';
      const msg = `Hola Marco, soy ${d.get('nombre')}. Me interesa: ${d.get('interes')}. ${d.get('mensaje')} (Mi email: ${d.get('email')}.${tel})`;
      window.open(waUrl(msg), '_blank', 'noopener');
      setStatus(form, 'Listo. Se abrió WhatsApp con tu mensaje para enviarlo.');
      form.reset();
    });
  }

  /* ───────── 10b. El formulario de consulta se abre en una tarjeta emergente (botón data-open="consulta-dialog") ───────── */
  const consultDlg = $('#consulta-dialog');
  if (form && consultDlg && typeof consultDlg.showModal === 'function') {
    form.classList.add('is-in');                                  // dentro del <dialog> cerrado no se dispara el reveal
    $('.consulta-dialog__body', consultDlg).appendChild(form);
  }

  const sub = $('#subscribe-form');
  if (sub) {
    sub.addEventListener('submit', async e => {
      e.preventDefault();
      if (!sub.checkValidity()) {
        sub.reportValidity();
        setStatus(sub, 'Revisá el email: parece incompleto.', true);
        return;
      }
      const email = new FormData(sub).get('email');
      if (SUBSCRIBE_ENDPOINT) {
        try {
          const res = await fetch(SUBSCRIBE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          if (!res.ok) throw new Error(String(res.status));
          setStatus(sub, 'Gracias por sumarte. Revisá tu correo para confirmar la suscripción.');
          sub.reset();
        } catch {
          setStatus(sub, 'No pudimos registrar tu email. Probá de nuevo.', true);
        }
      } else if (WA_READY) {
        window.open(waUrl(`Hola Marco, quiero recibir tus contenidos y novedades. Mi email: ${email}`), '_blank', 'noopener');
        setStatus(sub, 'Listo. Se abrió WhatsApp para confirmar tu suscripción.');
        sub.reset();
      } else {
        setStatus(sub, 'La suscripción está por activarse. Volvé a probar pronto.', true);
      }
    });
  }
})();
