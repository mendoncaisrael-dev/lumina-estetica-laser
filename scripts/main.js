/* ============================================================
   LÚMINA — Estética a Laser
   main.js — microinterações e animações (vanilla, sem libs)
   trace_id: f1e41f7e-e944-42cb-98c6-46e3277c1960
   ============================================================ */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ano dinâmico no rodapé ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: estado "scrolled" (translúcido) ---------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Menu mobile ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  function closeMobile() {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    mobileNav.classList.remove('is-open');
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
      mobileNav.classList.toggle('is-open', !open);
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobile);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobile();
    });
  }

  /* ---------- Reveal on scroll (fallback p/ navegadores sem animation-timeline) ---------- */
  var supportsScrollTimeline = CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  if (!supportsScrollTimeline && !prefersReduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Contadores animados (métricas) ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    if (prefersReduced) { el.textContent = String(target); return; }
    var duration = 1400;
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); } // easeOutCubic
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var val = Math.round(ease(p) * target);
      el.textContent = String(val);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('.counter');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------- FAQ accordion (acessível) ---------- */
  var triggers = document.querySelectorAll('.faq-trigger');
  triggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var item = btn.closest('.faq-item');
      btn.setAttribute('aria-expanded', String(!expanded));
      if (item) item.classList.toggle('is-open', !expanded);
      if (panel) {
        if (!expanded) { panel.hidden = false; }
        else {
          // mantém acessível: esconde após colapso
          panel.hidden = true;
        }
      }
    });
  });

  /* ---------- Validação básica do formulário ---------- */
  var form = document.getElementById('booking-form');
  if (form) {
    var success = document.getElementById('form-success');
    var successName = document.getElementById('success-name');

    function setError(fieldEl, hasError) {
      var wrap = fieldEl.closest('.field');
      if (wrap) wrap.classList.toggle('has-error', hasError);
      fieldEl.setAttribute('aria-invalid', String(hasError));
    }

    function validatePhone(value) {
      var digits = value.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 13;
    }

    // limpa erro ao digitar
    form.querySelectorAll('input, select').forEach(function (el) {
      el.addEventListener('input', function () { setError(el, false); });
      el.addEventListener('change', function () { setError(el, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.querySelector('#bf-nome');
      var whats = form.querySelector('#bf-whats');
      var area = form.querySelector('#bf-area');
      var valid = true;
      var firstInvalid = null;

      if (!nome.value.trim()) { setError(nome, true); valid = false; firstInvalid = firstInvalid || nome; }
      if (!validatePhone(whats.value)) { setError(whats, true); valid = false; firstInvalid = firstInvalid || whats; }
      if (!area.value) { setError(area, true); valid = false; firstInvalid = firstInvalid || area; }

      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // sucesso (sem backend)
      if (successName) successName.textContent = nome.value.trim().split(' ')[0];
      if (success) {
        success.classList.add('is-visible');
        success.focus && success.focus();
      }
      form.querySelectorAll('input, select').forEach(function (el) {
        if (el.tagName === 'SELECT') el.selectedIndex = 0; else el.value = '';
      });
      if (success && success.scrollIntoView) success.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
    });
  }
})();
