/* ============================================
   FinVision - Stock Market Analytics Platform
   Pure JavaScript (External File)
   ============================================ */

// ============================================
// PARTICLE CANVAS ANIMATION
// ============================================
(function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let sinWave = 0;

  // Configuration
  const PARTICLE_COUNT = 800;
  const TORUS_RADIUS = 120;
  const TUBE_RADIUS = 50;
  const P = 2; // p parameter for torus knot
  const Q = 3; // q parameter for torus knot

  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Track mouse
  document.addEventListener('mousemove', function(e) {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
  });

  // Create particle
  function createParticle() {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const r = TUBE_RADIUS * (0.3 + Math.random() * 0.7);

    return {
      u: u,
      v: v,
      r: r,
      baseSize: 1 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    };
  }

  // Initialize particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(createParticle());
  }

  // Get torus knot position
  function getTorusKnotPosition(u, v, r, time) {
    // Auto-rotation
    const rotY = time * 0.15 + mouseX * 2;
    const rotX = mouseY * 2;

    // Torus knot parametric equations
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    const cosQU = Math.cos(Q * u);
    const sinQU = Math.sin(Q * u);

    // Base torus knot
    const x0 = (TORUS_RADIUS + r * Math.cos(v)) * cosQU;
    const y0 = (TORUS_RADIUS + r * Math.cos(v)) * sinQU;
    const z0 = r * Math.sin(v);

    // Rotate around Y axis
    const cosRY = Math.cos(rotY);
    const sinRY = Math.sin(rotY);
    const x1 = x0 * cosRY - z0 * sinRY;
    const z1 = x0 * sinRY + z0 * cosRY;

    // Rotate around X axis
    const cosRX = Math.cos(rotX);
    const sinRX = Math.sin(rotX);
    const y1 = y0 * cosRX - z1 * sinRX;
    const z2 = y0 * sinRX + z1 * cosRX;

    return { x: x1, y: y1, z: z2 };
  }

  // Project 3D to 2D
  function project(x, y, z) {
    const fov = 400;
    const scale = fov / (fov + z + 300);
    const px = x * scale + canvas.width / 2;
    const py = y * scale + canvas.height / 2;
    return { x: px, y: py, scale: scale, z: z };
  }

  // Color interpolation (teal to blue)
  function getColor(y, alpha) {
    const t = (y + TORUS_RADIUS) / (TORUS_RADIUS * 2);
    const clampedT = Math.max(0, Math.min(1, t));

    // Teal: 0, 229, 204 -> Blue: 59, 130, 246
    const r = Math.round(0 + (59 - 0) * clampedT);
    const g = Math.round(229 + (130 - 229) * clampedT);
    const b = Math.round(204 + (246 - 204) * clampedT);

    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // Animation loop
  let startTime = Date.now();

  function animate() {
    const elapsed = (Date.now() - startTime) / 1000;
    sinWave += 0.08;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i];

      // Animate v parameter for flowing effect
      p.v += 0.002;
      if (p.v > Math.PI * 2) p.v -= Math.PI * 2;

      // Get 3D position
      const pos = getTorusKnotPosition(p.u, p.v, p.r, elapsed);

      // Sinusoidal wave effect (every 5th particle)
      let sizeMultiplier = 1;
      let opacityMultiplier = 1;

      if (i % 5 === 0) {
        const distance = (Math.sin(sinWave + pos.x * 0.015) + 1) * 0.5;
        sizeMultiplier = 0.3 + distance * 1.5;
        opacityMultiplier = 0.3 + distance * 0.7;
      }

      // Project to 2D
      const projected = project(pos.x, pos.y, pos.z);

      // Calculate opacity based on depth
      const depthOpacity = Math.max(0.1, Math.min(1, (projected.z + 200) / 400));
      const finalOpacity = depthOpacity * opacityMultiplier;

      // Size based on depth
      const size = p.baseSize * projected.scale * sizeMultiplier;

      // Draw particle
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
      ctx.fillStyle = getColor(pos.y, finalOpacity);
      ctx.fill();

      // Glow effect for bright particles
      if (finalOpacity > 0.5) {
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = getColor(pos.y, finalOpacity * 0.15);
        ctx.fill();
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  animate();
})();

// ============================================
// SCROLL-TRIGGERED FADE-IN ANIMATIONS
// ============================================
(function() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(function(el) {
    observer.observe(el);
  });
})();

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
(function() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
})();

// ============================================
// MOBILE MENU TOGGLE
// ============================================
(function() {
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener('click', function() {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });

  // Close menu when clicking a link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('open');
    });
  });
})();

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
})();
