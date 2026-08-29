/* ═══════════════════════════════════════════════════════════════
   HERO3D.JS — Premium 3D Animated Hero
   Features:
   - Rotating 3D neural network sphere
   - Floating geometric 3D shapes (cubes, pyramids)
   - Depth-layered particle streams
   - Mouse parallax on hero content
   - Animated connection lines between nodes
   - Pulsing ring system
   ═══════════════════════════════════════════════════════════════ */

'use strict';

(function initHero3D() {
  const canvas  = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, cx, cy, frame, mouse = { x: 0, y: 0 };
  let nodes3D = [], connections = [], particles = [], rings = [], floaters = [];

  /* ── resize ── */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cx = W / 2; cy = H / 2;
    if (!reduced) initScene();
  }

  /* ── 3D projection ── */
  const FOV = 600;
  function project(x, y, z) {
    const scale = FOV / (FOV + z);
    return { x: cx + x * scale, y: cy + y * scale, scale };
  }

  /* ── rotation matrices ── */
  function rotX(p, a) {
    return { x: p.x, y: p.y * Math.cos(a) - p.z * Math.sin(a), z: p.y * Math.sin(a) + p.z * Math.cos(a) };
  }
  function rotY(p, a) {
    return { x: p.x * Math.cos(a) + p.z * Math.sin(a), y: p.y, z: -p.x * Math.sin(a) + p.z * Math.cos(a) };
  }

  /* ── NEURAL SPHERE NODES ── */
  function initScene() {
    nodes3D = [];
    connections = [];
    particles = [];
    rings = [];
    floaters = [];

    const sphereR   = Math.min(W, H) * 0.22;
    const nodeCount = 80;

    // Fibonacci sphere distribution
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < nodeCount; i++) {
      const y  = 1 - (i / (nodeCount - 1)) * 2;
      const r  = Math.sqrt(1 - y * y);
      const theta = golden * i;
      nodes3D.push({
        ox: Math.cos(theta) * r * sphereR,
        oy: y * sphereR,
        oz: Math.sin(theta) * r * sphereR,
        size: Math.random() * 2.5 + 1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        bright: Math.random() > 0.85,
      });
    }

    // Connect nearby nodes
    for (let i = 0; i < nodes3D.length; i++) {
      for (let j = i + 1; j < nodes3D.length; j++) {
        const a = nodes3D[i], b = nodes3D[j];
        const dist = Math.hypot(a.ox - b.ox, a.oy - b.oy, a.oz - b.oz);
        if (dist < sphereR * 0.55) {
          connections.push({ a: i, b: j, dist });
        }
      }
    }

    // Particles streaming from sphere
    for (let i = 0; i < 60; i++) {
      particles.push(createParticle(sphereR));
    }

    // Concentric rings
    for (let i = 0; i < 3; i++) {
      rings.push({
        r: sphereR * (1.2 + i * 0.25),
        tilt: (Math.PI / 4) + i * 0.3,
        rotZ: Math.random() * Math.PI * 2,
        speed: (0.003 + i * 0.002) * (i % 2 === 0 ? 1 : -1),
        alpha: 0.15 - i * 0.04,
      });
    }

    // Floating 3D cubes / diamonds
    for (let i = 0; i < 8; i++) {
      floaters.push({
        x: (Math.random() - 0.5) * W * 0.85,
        y: (Math.random() - 0.5) * H * 0.85,
        z: Math.random() * 300 - 100,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        drx: (Math.random() - 0.5) * 0.012,
        dry: (Math.random() - 0.5) * 0.014,
        drz: (Math.random() - 0.5) * 0.008,
        size: 12 + Math.random() * 20,
        type: i % 2 === 0 ? 'cube' : 'diamond',
        alpha: 0.12 + Math.random() * 0.15,
      });
    }
  }

  function createParticle(sphereR) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = sphereR * (0.9 + Math.random() * 0.3);
    return {
      x: cx + Math.sin(phi) * Math.cos(theta) * r * 0.6,
      y: cy + Math.cos(phi) * r * 0.6,
      z: Math.sin(phi) * Math.sin(theta) * r,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      vz: (Math.random() - 0.5) * 0.4,
      life: Math.random(),
      maxLife: 0.008 + Math.random() * 0.006,
      size: Math.random() * 2 + 0.5,
      color: Math.random() > 0.6 ? '#a5b4fc' : Math.random() > 0.5 ? '#c4b5fd' : '#7dd3fc',
    };
  }

  /* ── DRAW FLOATING 3D CUBE ── */
  function drawFloater(f) {
    const corners = [];
    const s = f.size;
    const verts = f.type === 'cube'
      ? [[-s,-s,-s],[ s,-s,-s],[ s, s,-s],[-s, s,-s],[-s,-s, s],[ s,-s, s],[ s, s, s],[-s, s, s]]
      : [[ 0,-s*1.4, 0],[ s, 0,-s],[ s, 0, s],[-s, 0, s],[-s, 0,-s],[0, s*1.4, 0]];

    for (const v of verts) {
      let p = { x: v[0], y: v[1], z: v[2] };
      p = rotX(p, f.rx); p = rotY(p, f.ry); p = rotX(p, f.rz);
      p.x += f.x; p.y += f.y; p.z += f.z;
      const proj = project(p.x - cx, p.y - cy, p.z);
      corners.push({ sx: proj.x, sy: proj.y, scale: proj.scale });
    }

    const edges = f.type === 'cube'
      ? [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
      : [[0,1],[0,2],[0,3],[0,4],[5,1],[5,2],[5,3],[5,4],[1,2],[2,3],[3,4],[4,1]];

    ctx.save();
    ctx.strokeStyle = `rgba(99,102,241,${f.alpha})`;
    ctx.lineWidth = 0.8;
    for (const [a, b] of edges) {
      if (!corners[a] || !corners[b]) continue;
      ctx.beginPath();
      ctx.moveTo(corners[a].sx, corners[a].sy);
      ctx.lineTo(corners[b].sx, corners[b].sy);
      ctx.stroke();
    }
    // Draw vertices
    for (const c of corners) {
      ctx.beginPath();
      ctx.arc(c.sx, c.sy, 1.5 * c.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(165,180,252,${f.alpha * 1.5})`;
      ctx.fill();
    }
    ctx.restore();
  }

  /* ── MAIN RENDER ── */
  let angleX = 0, angleY = 0;
  const sphereOffX = W > 900 ? W * 0.18 : 0;

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    const t    = ts * 0.001;
    angleX     = 0.12 + (mouse.y - cy) / cy * 0.04;
    angleY     = t * 0.18 + (mouse.x - cx) / cx * 0.06;

    /* ── BACKGROUND GRADIENT ── */
    const bg = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy, Math.max(W, H) * 0.75);
    bg.addColorStop(0,   'rgba(30,27,75,0.35)');
    bg.addColorStop(0.5, 'rgba(15,23,42,0.15)');
    bg.addColorStop(1,   'transparent');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* ── RINGS ── */
    for (const ring of rings) {
      ring.rotZ += ring.speed;
      drawRing(ring);
    }

    /* ── FLOATERS ── */
    for (const f of floaters) {
      f.rx += f.drx; f.ry += f.dry; f.rz += f.drz;
      drawFloater(f);
    }

    /* ── PROJECT NODES ── */
    const projected = nodes3D.map(n => {
      let p = { x: n.ox, y: n.oy, z: n.oz };
      p = rotX(p, angleX); p = rotY(p, angleY);
      p.x += sphereOffX;
      const proj = project(p.x, p.y, p.z);
      n.pulse += n.pulseSpeed;
      const pulseFactor = 0.85 + 0.15 * Math.sin(n.pulse);
      return { ...proj, pulseFactor, bright: n.bright, size: n.size, rawZ: p.z };
    });

    /* ── CONNECTION LINES ── */
    for (const c of connections) {
      const a = projected[c.a], b = projected[c.b];
      const avgZ    = (a.rawZ + b.rawZ) * 0.5;
      const alpha   = Math.max(0, 0.18 * (1 + avgZ / 250));
      const avgScale = (a.scale + b.scale) * 0.5;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(99,102,241,${alpha * avgScale})`;
      ctx.lineWidth   = 0.6 * avgScale;
      ctx.stroke();
    }

    /* ── NODES ── */
    for (const p of projected) {
      const r     = p.size * p.scale * p.pulseFactor;
      const alpha = Math.max(0.2, 0.3 + 0.7 * ((p.rawZ + 250) / 500));

      if (p.bright) {
        // Glowing bright node
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
        grd.addColorStop(0,   `rgba(196,181,253,${alpha})`);
        grd.addColorStop(0.3, `rgba(139,92,246,${alpha * 0.4})`);
        grd.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, r), 0, Math.PI * 2);
      ctx.fillStyle = p.bright
        ? `rgba(216,180,254,${alpha})`
        : `rgba(165,180,252,${alpha * 0.85})`;
      ctx.fill();
    }

    /* ── PARTICLES ── */
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      p.life += p.maxLife;
      if (p.life > 1) {
        particles[i] = createParticle(Math.min(W, H) * 0.22);
        continue;
      }
      const a     = Math.sin(p.life * Math.PI) * 0.6;
      const proj  = project(p.x - cx, p.y - cy, p.z);
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, p.size * proj.scale, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace(')', `,${a})`).replace('rgb', 'rgba');
      ctx.fill();
    }

    /* ── SCAN LINE EFFECT ── */
    const scanY = (t * 60) % (H + 100) - 50;
    const scanGrd = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
    scanGrd.addColorStop(0,   'transparent');
    scanGrd.addColorStop(0.5, 'rgba(99,102,241,0.04)');
    scanGrd.addColorStop(1,   'transparent');
    ctx.fillStyle = scanGrd;
    ctx.fillRect(0, scanY - 40, W, 80);

    frame = requestAnimationFrame(draw);
  }

  /* ── RING DRAW ── */
  function drawRing(ring) {
    const steps = 120;
    const pts   = [];
    for (let i = 0; i <= steps; i++) {
      const a   = (i / steps) * Math.PI * 2;
      const x3  = Math.cos(a) * ring.r;
      const y3  = Math.sin(a) * ring.r * Math.cos(ring.tilt);
      const z3  = Math.sin(a) * ring.r * Math.sin(ring.tilt);
      let p     = { x: x3, y: y3, z: z3 };
      p         = rotY(p, ring.rotZ);
      p.x      += sphereOffX;
      const pr  = project(p.x, p.y, p.z);
      pts.push({ ...pr, behind: p.z < 0 });
    }

    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const pt    = pts[i];
      const alpha = ring.alpha * pt.scale * (pt.behind ? 0.35 : 1);
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.strokeStyle = `rgba(139,92,246,${ring.alpha})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
  }

  /* ── MOUSE PARALLAX ── */
  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Parallax hero content layers
    const dx = (e.clientX - window.innerWidth  / 2) / window.innerWidth;
    const dy = (e.clientY - window.innerHeight / 2) / window.innerHeight;

    const heroContent = document.querySelector('.hero-content');
    const heroImg     = document.querySelector('.hero-image-wrapper');

    if (heroContent) heroContent.style.transform = `translate(${dx * -8}px, ${dy * -5}px)`;
    if (heroImg)     heroImg.style.transform     = `translate(${dx * 14}px, ${dy * 10}px)`;
  });

  /* ── INIT ── */
  if (reduced) return;

  const ro = new ResizeObserver(() => resize());
  ro.observe(canvas.parentElement);
  resize();
  frame = requestAnimationFrame(draw);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else frame = requestAnimationFrame(draw);
  });

})();
