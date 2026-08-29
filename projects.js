/* ═══════════════════════════════════════════════════════════════
   PROJECTS.JS — Project Cards, Architecture Visuals
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────── PROJECT CARD INTERACTIONS ─────────────────── */
(function initProjectCards() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    // Subtle parallax on mouse move
    card.addEventListener('mousemove', e => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width / 2;
      const cy    = rect.top  + rect.height / 2;
      const mx    = e.clientX - cx;
      const my    = e.clientY - cy;
      const rotX  = -(my / rect.height) * 4;
      const rotY  =  (mx / rect.width)  * 4;

      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ──────────────── ARCH NODE CONNECTIONS DRAWING ─────────────── */
(function initAgentDiagram() {
  // Render SVG connector lines for the agent architecture diagram
  const agentArchs = document.querySelectorAll('.agent-arch');

  agentArchs.forEach(diagram => {
    const orchestrator = diagram.querySelector('.agent-orchestrator');
    const nodes        = diagram.querySelectorAll('.agent-node');

    if (!orchestrator || !nodes.length) return;

    // We rely on CSS for visual connections — simple border approach is sufficient
    // Add animated pulse borders to agent nodes on hover
    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        orchestrator.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
        node.style.background = 'rgba(6, 182, 212, 0.12)';
        node.style.borderColor = 'rgba(6, 182, 212, 0.4)';
      });
      node.addEventListener('mouseleave', () => {
        orchestrator.style.boxShadow = '';
        node.style.background = '';
        node.style.borderColor = '';
      });
    });
  });
})();

/* ──────────────── ARCHITECTURE CARD REVEAL ─────────────────── */
(function initArchCards() {
  const cards = document.querySelectorAll('.arch-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms`;
    observer.observe(card);
  });
})();

/* ──────────────── ARCH BOX PULSE ANIMATION ─────────────────── */
(function initArchBoxPulse() {
  const modelBoxes = document.querySelectorAll('.arch-box.model');

  modelBoxes.forEach(box => {
    // Subtle glow cycle on model boxes
    let frame;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        let phase = 0;
        function pulse() {
          phase += 0.02;
          const alpha = 0.08 + 0.04 * Math.sin(phase);
          box.style.background = `rgba(59, 130, 246, ${alpha})`;
          frame = requestAnimationFrame(pulse);
        }
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          pulse();
        }
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    observer.observe(box);
  });
})();

/* ──────────────── EXPERTISE CARD STAGGER ───────────────────── */
(function initExpertiseStagger() {
  const cards = document.querySelectorAll('.expertise-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = [...cards].indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
})();

/* ──────────────── CAPABILITY CARDS STAGGER ─────────────────── */
(function initCapabilityStagger() {
  const cards = document.querySelectorAll('.capability-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = [...cards].indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
})();

/* ──────────────── CERT CARD STAGGER ────────────────────────── */
(function initCertStagger() {
  const cards = document.querySelectorAll('.cert-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = [...cards].indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
})();

/* ──────────────── ACHIEVEMENT CARD STAGGER ─────────────────── */
(function initAchievementStagger() {
  const cards = document.querySelectorAll('.achievement-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = [...cards].indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
})();
