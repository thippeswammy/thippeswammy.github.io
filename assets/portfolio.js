/* Renders data/portfolio.json and adds the motion layer (Lenis + GSAP).
   All content lives in data/portfolio.json; this file only knows layout. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_GSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var HEADER_OFFSET = -96;
  var lenis = null;

  var ICON = {
    link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
    resume: '<svg viewBox="0 0 24 24"><path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 2h14v2H5v-2z"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .5z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 110-4.2 2.1 2.1 0 010 4.2zM7.1 20.5H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function ext(url) { return /^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ''; }
  function copyBtn(id, label) { return '<button class="copy" data-copy="' + esc(id) + '" title="Copy link to ' + esc(label) + '" aria-label="Copy link to ' + esc(label) + '">' + ICON.link + '</button>'; }
  function tags(list) { return '<div class="tags">' + list.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>'; }

  /* ---------- render ---------- */
  function renderFeature(p) {
    var h = '<article class="card feature reveal" id="' + esc(p.id) + '">';
    h += '<div class="f-top"><h3 class="f-title">' + esc(p.title) + '</h3><div class="f-actions">';
    if (p.status) h += '<span class="badge ' + esc(p.status.kind) + '">' + esc(p.status.label) + '</span>';
    h += copyBtn(p.id, p.title) + '</div></div>';
    h += '<p class="tagline">' + p.tagline + '</p>';
    if (p.media) h += '<figure class="media"><img src="' + esc(p.media.src) + '" alt="' + esc(p.media.alt) + '" loading="lazy" decoding="async">' +
      (p.media.caption ? '<figcaption>' + esc(p.media.caption) + '</figcaption>' : '') + '</figure>';
    h += '<ul>' + p.bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') + '</ul>';
    if (p.metrics && p.metrics.length) h += '<div class="metrics">' + p.metrics.map(function (m) { return '<div class="metric"><b>' + esc(m.value) + '</b>' + esc(m.label) + '</div>'; }).join('') + '</div>';
    h += tags(p.tags);
    if (p.links && p.links.length) h += '<div class="f-links">' + p.links.map(function (l) { return '<a href="' + esc(l.url) + '"' + ext(l.url) + '>' + esc(l.label) + '</a>'; }).join('') + '</div>';
    return h + '</article>';
  }

  function repoName(it) {
    var n = it.url ? '<a href="' + esc(it.url) + '"' + ext(it.url) + '>' + esc(it.name) + '</a>' : '<span>' + esc(it.name) + '</span>';
    if (it.private) n += '<span class="badge private sm">Private</span>';
    return n;
  }

  function renderGroup(g, open) {
    var count = g.items.reduce(function (n, it) { return n + 1 + (it.also ? it.also.length : 0); }, 0);
    var h = '<div class="card group reveal' + (open ? ' open' : '') + '" id="' + esc(g.id) + '">';
    h += '<button class="g-head" aria-expanded="' + (open ? 'true' : 'false') + '"><div><div class="g-title">' + esc(g.title) + '</div><div class="g-desc">' + esc(g.desc) + '</div></div>';
    h += '<div class="g-meta"><span class="g-count">' + count + ' repos</span><span class="chev">' + ICON.chev + '</span></div></button>';
    h += '<div class="g-body"><div class="g-inner"><div class="items">';
    g.items.forEach(function (it) {
      h += '<div class="item" id="repo-' + slug(it.name) + '"><div class="i-name">' + repoName(it);
      (it.also || []).forEach(function (a) { h += '<span class="sep">·</span>' + repoName(a); });
      h += '</div><div class="i-desc">' + it.desc + (it.tech ? '<span class="i-tech">' + esc(it.tech) + '</span>' : '') + '</div></div>';
    });
    return h + '</div></div></div></div>';
  }

  function partHead(num, kicker, title, id, intro, jumps) {
    var h = '<div class="part-head reveal"><div class="part-num">' + esc(num) + '</div><div>';
    h += '<div class="part-kicker">' + esc(kicker) + '</div>';
    h += '<h2 class="part-title">' + esc(title) + copyBtn(id, title) + '</h2>';
    if (intro) h += '<p class="part-intro">' + intro + '</p>';
    if (jumps && jumps.length) h += '<div class="jump">' + jumps.map(function (j) { return '<a href="#' + esc(j.id) + '">' + esc(j.label) + '</a>'; }).join('') + '</div>';
    return h + '</div></div>';
  }

  function shortTitle(t) { return t.split(':')[0]; }

  function render(d) {
    var P = d.profile, h = '';
    var n = 0;
    function next() { n += 1; return (n < 10 ? '0' : '') + n; }

    // hero
    h += '<section class="hero" id="top"><div>';
    h += '<div class="eyebrow h-anim">' + esc(P.eyebrow) + '</div>';
    h += '<h1 class="h-anim">' + esc(P.headline) + '</h1>';
    h += '<p class="lead h-anim">' + P.summary + '</p>';
    h += '<div class="btns h-anim">';
    h += '<a class="btn primary" href="' + esc(P.resume) + '" target="_blank" rel="noopener">' + ICON.resume + 'Resume (PDF)</a>';
    h += '<a class="btn" href="' + esc(P.github) + '" target="_blank" rel="noopener">' + ICON.github + 'GitHub</a>';
    h += '<a class="btn" href="' + esc(P.linkedin) + '" target="_blank" rel="noopener">' + ICON.linkedin + 'LinkedIn</a>';
    h += '<a class="btn" href="mailto:' + esc(P.email) + '">' + ICON.mail + 'Email</a>';
    h += '</div><div class="scroll-hint h-anim"><i></i>scroll to explore</div></div>';
    h += '<div class="avatar-ring h-anim"><img src="' + esc(P.avatar) + '" alt="' + esc(P.name) + '"></div></section>';

    h += '<div class="facts">' + d.facts.map(function (f) {
      var tag = f.href ? 'a' : 'div';
      return '<' + tag + ' class="fact reveal"' + (f.href ? ' href="' + esc(f.href) + '"' : '') + '><b>' + esc(f.title) + '</b><span>' + esc(f.text) + '</span></' + tag + '>';
    }).join('') + '</div>';

    // experience (standard order: experience first)
    h += '<section class="part" id="experience">' + partHead(next(), 'Career', 'Experience', 'experience');
    h += '<div class="timeline">' + d.experience.map(function (j) {
      var s = '<div class="card job reveal"><span class="dot"></span><div class="j-head"><div><div class="j-role">' + esc(j.role) + '</div><div class="j-org">' + esc(j.org) + '</div></div><div class="j-when">' + esc(j.when) + '</div></div>';
      s += '<ul>' + j.points.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>';
      if (j.note) s += '<p class="j-note">' + esc(j.note) + '</p>';
      return s + '</div>';
    }).join('') + '</div></section>';

    // project parts
    d.parts.forEach(function (part) {
      h += '<section class="part" id="' + esc(part.id) + '">';
      h += partHead(next(), 'Projects', part.title, part.id, part.intro,
        part.featured.map(function (f) { return { id: f.id, label: shortTitle(f.title) }; })
          .concat(part.groups.map(function (g) { return { id: g.id, label: g.title }; })));
      part.featured.forEach(function (f) { h += renderFeature(f); });
      if (part.groups.length) {
        h += '<div class="groups">' + part.groups.map(function (g, i) { return renderGroup(g, i === 0); }).join('') + '</div>';
      }
      h += '</section>';
    });

    // publication
    var pub = d.publication;
    h += '<section class="part" id="publication">' + partHead(next(), 'Research', 'Publication', 'publication');
    h += '<article class="card pub reveal"><span class="badge paper">' + esc(pub.venue) + '</span>';
    h += '<h3 class="p-title">' + (pub.url ? '<a href="' + esc(pub.url) + '" target="_blank" rel="noopener">' + esc(pub.title) + '</a>' : esc(pub.title)) + '</h3>';
    h += '<div class="p-venue">' + pub.authors + '</div><p class="p-abs">' + esc(pub.abstract) + '</p></article></section>';

    // skills
    h += '<section class="part" id="skills">' + partHead(next(), 'Toolbox', 'Skills', 'skills');
    h += '<div class="skills">' + d.skills.map(function (s) { return '<div class="card skill reveal"><h4>' + esc(s.title) + '</h4>' + tags(s.items) + '</div>'; }).join('') + '</div></section>';

    // education
    h += '<section class="part" id="education">' + partHead(next(), 'Background', 'Education', 'education');
    h += '<div class="edu">' + d.education.map(function (e) { return '<div class="card reveal"><div><b>' + esc(e.title) + '</b><br><span>' + esc(e.place) + '</span></div><span>' + esc(e.when) + '</span></div>'; }).join('') + '</div></section>';

    // more work (bottom)
    var mw = d.more_work;
    h += '<section class="part" id="more-work">' + partHead(next(), 'Beyond the focus', 'More work', 'more-work', esc(mw.intro), mw.groups.map(function (g) { return { id: g.id, label: g.title }; }));
    h += '<div class="groups">' + mw.groups.map(function (g) { return renderGroup(g, false); }).join('') + '</div></section>';

    // contact
    h += '<section class="part" id="contact"><div class="card contact reveal"><h2>Let\'s talk</h2><p>I\'m looking for ' + esc(P.looking_for) + '.</p><div class="btns">';
    h += '<a class="btn primary" href="mailto:' + esc(P.email) + '">' + ICON.mail + esc(P.email) + '</a>';
    h += '<a class="btn" href="' + esc(P.linkedin) + '" target="_blank" rel="noopener">' + ICON.linkedin + 'LinkedIn</a>';
    h += '<a class="btn" href="' + esc(P.github) + '" target="_blank" rel="noopener">' + ICON.github + 'GitHub</a>';
    h += '<a class="btn" href="' + esc(P.resume) + '" target="_blank" rel="noopener">' + ICON.resume + 'Resume</a>';
    h += '</div></div></section>';

    document.getElementById('app').innerHTML = h;

    // nav
    var nav = [{ id: 'experience', label: 'Experience' }]
      .concat(d.parts.map(function (p) { return { id: p.id, label: p.nav }; }))
      .concat([{ id: 'publication', label: 'Publication' }, { id: 'skills', label: 'Skills' },
        { id: 'education', label: 'Education' }, { id: 'more-work', label: 'More work' }]);
    document.getElementById('nav').innerHTML = nav.map(function (l) { return '<a href="#' + l.id + '" data-nav="' + l.id + '">' + esc(l.label) + '</a>'; }).join('') +
      '<a href="#contact" class="cta-nav" data-nav="contact">Contact</a>';

    document.getElementById('footer').innerHTML = '© ' + new Date().getFullYear() + ' ' + esc(P.name) +
      ' · <a href="explorer.html">Browse every repository and GitHub activity →</a>';
  }

  /* ---------- behaviour ---------- */
  function scrollToEl(el, instant) {
    if (!el) return;
    if (lenis && !instant) lenis.scrollTo(el, { offset: HEADER_OFFSET, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET, behavior: instant || REDUCED ? 'auto' : 'smooth' });
  }

  function openAncestorGroup(el) {
    var g = el.closest('.group');
    if (g && !g.classList.contains('open')) toggleGroup(g, true);
  }

  function flash(el) {
    var target = el.classList.contains('item') || el.classList.contains('card') ? el : el.querySelector('.card');
    if (!target) return;
    target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash');
  }

  function goToHash(hash, opts) {
    opts = opts || {};
    var id = decodeURIComponent((hash || '').replace(/^#/, ''));
    if (!id) return;
    if (id === 'top') { if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    var el = document.getElementById(id);
    if (!el) return;
    openAncestorGroup(el);
    // wait for accordion height to settle before measuring
    setTimeout(function () {
      if (lenis) lenis.resize();
      scrollToEl(el, opts.instant);
      if (!el.matches('section.part')) setTimeout(function () { flash(el); }, opts.instant ? 50 : 700);
    }, el.closest('.group') ? 320 : 0);
  }

  function toggleGroup(g, force) {
    var open = typeof force === 'boolean' ? force : !g.classList.contains('open');
    g.classList.toggle('open', open);
    g.querySelector('.g-head').setAttribute('aria-expanded', String(open));
    setTimeout(function () { if (lenis) lenis.resize(); if (HAS_GSAP) ScrollTrigger.refresh(); }, 650);
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  function copyLink(id) {
    var url = location.origin + location.pathname + '#' + id;
    history.replaceState(null, '', '#' + id);
    var done = function () { toast('Link copied: #' + id); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, function () { toast(url); });
    else { var ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { toast(url); } ta.remove(); }
  }

  function bindEvents() {
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-copy]');
      if (c) { e.preventDefault(); copyLink(c.getAttribute('data-copy')); return; }
      var gh = e.target.closest('.g-head');
      if (gh) { toggleGroup(gh.closest('.group')); return; }
      var a = e.target.closest('a[href^="#"]');
      if (a) {
        var hash = a.getAttribute('href');
        if (hash.length < 2) return;
        e.preventDefault();
        history.pushState(null, '', hash);
        goToHash(hash);
      }
    });
    window.addEventListener('popstate', function () { goToHash(location.hash); });

    // mouse glow
    document.addEventListener('mousemove', function (e) {
      var card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    // header hide / progress / back-to-top / active nav
    var header = document.getElementById('header'), bar = document.getElementById('progress'), top = document.getElementById('to-top');
    var last = window.scrollY, ticking = false;
    top.addEventListener('click', function () { history.replaceState(null, '', location.pathname); if (lenis) lenis.scrollTo(0, { duration: 1.6 }); else window.scrollTo({ top: 0, behavior: 'smooth' }); });
    function onScroll() {
      var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      if (y <= 30) header.classList.remove('hidden');
      else if (Math.abs(y - last) > 6) header.classList.toggle('hidden', y > last && y > 140);
      header.classList.toggle('scrolled', y > 50);
      top.classList.toggle('show', y > 900);
      last = y; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

    var navLinks = document.querySelectorAll('[data-nav]');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          navLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('data-nav') === en.target.id && !l.classList.contains('cta-nav')); });
          var act = document.querySelector('[data-nav].active');
          if (act && act.scrollIntoView && window.innerWidth < 920) act.parentNode.scrollTo({ left: act.offsetLeft - 40, behavior: 'smooth' });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll('section.part').forEach(function (s) { io.observe(s); });
    }
  }

  function initMotion() {
    if (REDUCED || !HAS_GSAP) return;
    gsap.registerPlugin(ScrollTrigger);
    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      window.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    // hero entrance
    gsap.from('.h-anim', { opacity: 0, y: 28, duration: 1.1, ease: 'power3.out', stagger: 0.12, delay: 0.1 });
    // parallax blobs
    gsap.to('.blob-1', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.blob-2', { yPercent: -40, ease: 'none', scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.blob-3', { xPercent: -30, yPercent: 20, ease: 'none', scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom top', scrub: true } });
    // staggered reveals, batched so siblings step in one after another
    gsap.set('.reveal', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.reveal', {
      start: 'top 90%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true }); }
    });
    // part numbers drift slightly with scroll
    gsap.utils.toArray('.part-num').forEach(function (el) {
      gsap.fromTo(el, { yPercent: 25 }, { yPercent: -15, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  function revealAllNow() {
    // used for deep links: content above the target must not be invisible when we land
    if (!HAS_GSAP || REDUCED) return;
    var id = decodeURIComponent(location.hash.replace(/^#/, ''));
    var el = id && document.getElementById(id);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY;
    document.querySelectorAll('.reveal').forEach(function (r) {
      if (r.getBoundingClientRect().top + window.scrollY <= y + window.innerHeight) gsap.set(r, { opacity: 1, y: 0 });
    });
  }

  fetch('data/portfolio.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      render(data);
      bindEvents();
      initMotion();
      if (location.hash) {
        revealAllNow();
        requestAnimationFrame(function () { goToHash(location.hash, { instant: true }); });
      }
    })
    .catch(function (err) {
      document.getElementById('app').innerHTML = '<div class="loading">Could not load data/portfolio.json (' + esc(err.message) + '). See <a href="https://github.com/thippeswammy">github.com/thippeswammy</a>.</div>';
    });
})();
