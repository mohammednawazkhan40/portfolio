/* ═══════════════════════════════════════════════════════════════
   MAIN.JS — Navigation, Scroll, Tech Filters, Canvas, Forms
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────── UTILITIES ─────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ──────────────── NAVBAR ────────────────────────────────────── */
(function initNavbar() {
  const navbar   = $('#navbar');
  const hamburger = $('#hamburger');
  const overlay  = $('#mobileNavOverlay');
  const closeBtn = $('#mobileNavClose');
  const mobileLinks = $$('.mobile-nav-link');

  // Scroll-triggered glass effect
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu open/close
  function openMenu() {
    overlay.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    overlay.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    overlay.classList.contains('open') ? closeMenu() : openMenu();
  });

  closeBtn.addEventListener('click', closeMenu);

  // Close on link click
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on overlay background click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeMenu();
  });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeMenu();
  });
})();

/* ──────────────── ACTIVE NAV LINK ON SCROLL ────────────────── */
(function initActiveLinks() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px'
  });

  sections.forEach(s => observer.observe(s));
})();

/* ──────────────── SCROLL REVEAL ─────────────────────────────── */
(function initScrollReveal() {
  const animatedEls = $$('[data-animate]');

  if (!animatedEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  animatedEls.forEach(el => observer.observe(el));
})();

/* ──────────────── TIMELINE SCROLL REVEAL ───────────────────── */
(function initTimelineReveal() {
  const items = $$('.timeline-item');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(item => observer.observe(item));
})();

/* ──────────────── BACK TO TOP ───────────────────────────────── */
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ──────────────── TECH STACK FILTERS ───────────────────────── */
(function initTechFilters() {
  const filters  = $$('.tech-filter');
  const tags     = $$('.tech-tag');
  const labels   = $$('.tech-category-label');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      // Update active state
      filters.forEach(f => {
        f.classList.toggle('active', f === btn);
        f.setAttribute('aria-selected', f === btn ? 'true' : 'false');
      });

      if (category === 'all') {
        tags.forEach(tag => {
          tag.classList.remove('hidden');
          tag.style.animationDelay = '';
        });
        labels.forEach(l => l.classList.remove('hidden'));
        return;
      }

      // Hide/show tags
      let visibleCount = 0;
      tags.forEach(tag => {
        const match = tag.dataset.category === category;
        if (match) {
          tag.classList.remove('hidden');
          tag.style.animationDelay = `${visibleCount * 30}ms`;
          tag.classList.add('filtering-in');
          setTimeout(() => tag.classList.remove('filtering-in'), 400);
          visibleCount++;
        } else {
          tag.classList.add('hidden');
        }
      });

      // Hide labels that don't match
      labels.forEach(label => {
        label.classList.toggle('hidden', label.dataset.category !== category);
      });
    });
  });
})();

/* ──────────────── HERO CANVAS ───────────────────────────────── */
(function initHeroCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;

  // Check for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let w, h, nodes, animId;

  const COLORS = {
    node:   'rgba(99, 102, 241, 0.35)',
    line:   'rgba(99, 102, 241, 0.06)',
    node2:  'rgba(255, 255, 255, 0.15)',
  };
  const NODE_COUNT = 55;
  const MAX_DIST   = 180;

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function createNodes() {
    return Array.from({ length: NODE_COUNT }, () => ({
      x:  Math.random() * w,
      y:  Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 2 + 1,
      isAccent: Math.random() < 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.4;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha * 0.18})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.isAccent ? COLORS.node2 : COLORS.node;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    nodes = createNodes();
    if (animId) cancelAnimationFrame(animId);
    draw();
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
  });
  resizeObserver.observe(canvas.parentElement);

  init();

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });
})();

/* ──────────────── TITLE ROTATOR ─────────────────────────────── */
(function initTitleRotator() {
  // CSS animation handles rotation; this adds aria support
  const rotator = $('.title-rotator');
  if (!rotator) return;

  const items = $$('.title-item', rotator);
  const cycleTime = 2400; // ms per title (12s / 5 titles)
  let current = 0;

  // Update ARIA live region
  const liveRegion = document.createElement('span');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)';
  document.body.appendChild(liveRegion);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Show only first item statically
    items.forEach((item, i) => { item.style.display = i === 0 ? 'block' : 'none'; });
    return;
  }

  setInterval(() => {
    current = (current + 1) % items.length;
  }, cycleTime);
})();

/* ──────────────── CONTACT FORM ──────────────────────────────── */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const nameInput    = $('#contactName');
  const emailInput   = $('#contactEmail');
  const messageInput = $('#contactMessage');
  const submitBtn    = $('#submitBtn');

  function setError(inputEl, errorId, msg) {
    inputEl.classList.add('error');
    const errEl = $(`#${errorId}`);
    if (errEl) errEl.textContent = msg;
  }

  function clearError(inputEl, errorId) {
    inputEl.classList.remove('error');
    const errEl = $(`#${errorId}`);
    if (errEl) errEl.textContent = '';
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  // Live validation on blur
  nameInput.addEventListener('blur', () => {
    if (!nameInput.value.trim()) {
      setError(nameInput, 'nameError', 'Please enter your name.');
    } else {
      clearError(nameInput, 'nameError');
    }
  });

  emailInput.addEventListener('blur', () => {
    if (!emailInput.value.trim()) {
      setError(emailInput, 'emailError', 'Please enter your email.');
    } else if (!validateEmail(emailInput.value.trim())) {
      setError(emailInput, 'emailError', 'Please enter a valid email address.');
    } else {
      clearError(emailInput, 'emailError');
    }
  });

  messageInput.addEventListener('blur', () => {
    if (!messageInput.value.trim()) {
      setError(messageInput, 'messageError', 'Please enter a message.');
    } else {
      clearError(messageInput, 'messageError');
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;

    if (!nameInput.value.trim()) {
      setError(nameInput, 'nameError', 'Please enter your name.');
      valid = false;
    } else {
      clearError(nameInput, 'nameError');
    }

    if (!emailInput.value.trim()) {
      setError(emailInput, 'emailError', 'Please enter your email.');
      valid = false;
    } else if (!validateEmail(emailInput.value.trim())) {
      setError(emailInput, 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput, 'emailError');
    }

    if (!messageInput.value.trim()) {
      setError(messageInput, 'messageError', 'Please enter a message.');
      valid = false;
    } else {
      clearError(messageInput, 'messageError');
    }

    if (!valid) return;

    // Show sending state
    const btnText = submitBtn.querySelector('.btn-text');
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending…';

    // Simulate send (replace with real backend call)
    setTimeout(() => {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';

      // Show success
      const successMsg = document.createElement('p');
      successMsg.className = 'form-success-msg';
      successMsg.style.cssText = `
        color: #4ade80;
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        padding: 12px 20px;
        background: rgba(74, 222, 128, 0.08);
        border: 1px solid rgba(74, 222, 128, 0.2);
        border-radius: 8px;
        margin-top: 12px;
      `;
      successMsg.innerHTML = '✓ Message ready — please send it to <a href="mailto:mohammednawazkhan40@gmail.com" style="color:#60a5fa">mohammednawazkhan40@gmail.com</a> directly, or integrate a backend service.';
      form.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 8000);

      form.reset();
    }, 800);
  });
})();

/* ──────────────── SMOOTH SCROLL for anchor links ───────────── */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = $(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

/* ──────────────── COUNTER ANIMATION (metrics) ──────────────── */
(function initCounters() {
  // Metric values are text; animate them once when strip enters view
  const strip = $('.metrics-strip');
  if (!strip) return;

  const metricValues = $$('.metric-value', strip);

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      metricValues.forEach(el => {
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 200);
      });
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(strip);
})();

/* ──────────────── LAZY LOAD IMAGES ──────────────────────────── */
(function initLazyLoad() {
  const images = $$('img[loading="lazy"]');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  images.forEach(img => observer.observe(img));
})();

/* ──────────────── WORKFLOW STEPS ANIMATION ─────────────────── */
(function initWorkflowAnimation() {
  const steps = $$('.workflow-step');
  if (!steps.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        steps.forEach((step, i) => {
          setTimeout(() => {
            step.style.transition = `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`;
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
          }, i * 80);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.2 });

  steps.forEach(step => {
    step.style.opacity = '0';
    step.style.transform = 'translateY(16px)';
  });

  const workflowSection = $('.workflow-steps');
  if (workflowSection) observer.observe(workflowSection);
})();
