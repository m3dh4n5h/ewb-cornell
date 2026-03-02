'use strict';

// =============================================
// THEME TOGGLE
// =============================================
const html = document.documentElement;

function getTheme() {
  return localStorage.getItem('ewb-theme') || 'dark';
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('ewb-theme', theme);
  // Update all toggle buttons
  document.querySelectorAll('.theme-toggle, .mobile-theme-btn').forEach(btn => {
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  });
}

function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

// Apply on load
applyTheme(getTheme());

// =============================================
// NAVIGATION — SCROLL BEHAVIOR + PARALLAX
// =============================================
const nav = document.getElementById('mainNav');
const heroBg = document.getElementById('heroBg');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (nav) {
    nav.classList.toggle('scrolled', y > 60);
  }
  if (heroBg) {
    heroBg.style.transform = `translateY(${y * 0.32}px)`;
  }
}, { passive: true });

// =============================================
// MARK ACTIVE NAV LINK
// =============================================
(function markActive() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (path === href || (href !== '/' && path.endsWith(href))) {
      a.classList.add('active');
    }
  });
})();

// =============================================
// MOBILE MENU
// =============================================
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileBackdrop = document.getElementById('mobileBackdrop');

function openMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  if (mobileBackdrop) mobileBackdrop.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  if (mobileBackdrop) mobileBackdrop.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});
if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
if (mobileMenu) mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// =============================================
// SCROLL REVEAL (Intersection Observer)
// =============================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), Number(delay));
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));

// =============================================
// COUNTER ANIMATION
// =============================================
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.floor(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => countObserver.observe(el));

// =============================================
// CAROUSEL
// =============================================
(function initCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.c-dot');
  const total = slides.length;
  let current = 0;
  let timer = null;
  let paused = false;

  function go(idx) {
    current = ((idx % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
  }

  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => { if (!paused) next(); }, 5000);
  }

  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startTimer(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); startTimer(); }));

  const wrapper = document.querySelector('.carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => { paused = true; });
    wrapper.addEventListener('mouseleave', () => { paused = false; });

    // Touch swipe
    let tx = 0;
    wrapper.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend', e => {
      const diff = tx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) { diff > 0 ? next() : prev(); startTimer(); }
    }, { passive: true });

    // Keyboard
    wrapper.setAttribute('tabindex', '0');
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { prev(); startTimer(); }
      if (e.key === 'ArrowRight') { next(); startTimer(); }
    });
  }

  go(0);
  startTimer();
})();

// =============================================
// NEWSLETTER SUBMIT
// =============================================
window.handleNewsletter = function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const input = e.target.querySelector('input[type="email"]');
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = '✓ Subscribed!';
  btn.style.background = 'var(--teal)';
  btn.disabled = true;
  if (input) input.value = '';
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.background = '';
    btn.disabled = false;
  }, 3000);
};

// =============================================
// APPLY FORM SUBMIT
// =============================================
window.handleApply = function(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  if (!btn) return;
  const orig = btn.innerHTML;
  btn.innerHTML = '✓ Application Submitted!';
  btn.style.background = 'var(--teal)';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    btn.disabled = false;
  }, 4000);
};

// =============================================
// TYPEWRITER EFFECT
// =============================================
(function initTypewriter() {
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    let phrases;
    try { phrases = JSON.parse(el.getAttribute('data-typewriter')); }
    catch(e) { return; }
    if (!phrases.length) return;

    const textNode = document.createElement('span');
    textNode.className = 'typewriter-text';
    const cursor  = document.createElement('span');
    cursor.className  = 'typewriter-cursor';
    el.innerHTML = '';
    el.appendChild(textNode);
    el.appendChild(cursor);

    let pi = 0, ci = 0, deleting = false;

    function tick() {
      const phrase = phrases[pi];
      if (deleting) {
        textNode.textContent = phrase.slice(0, ci - 1);
        ci--;
      } else {
        textNode.textContent = phrase.slice(0, ci + 1);
        ci++;
      }
      let delay = deleting ? 55 : 85;
      if (!deleting && ci === phrase.length)  { delay = 1900; deleting = true; }
      else if (deleting && ci === 0)          { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
      setTimeout(tick, delay);
    }
    tick();
  });
})();

// =============================================
// MEMBER MODAL
// =============================================
(function initMemberModal() {
  // Create overlay once per page
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'memberModal';
  overlay.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalName">
      <button class="modal-close" onclick="closeMemberModal()" aria-label="Close">&times;</button>
      <div class="modal-header">
        <div class="modal-photo" id="modalPhoto"></div>
        <div class="modal-info">
          <h2 id="modalName"></h2>
          <div class="modal-role" id="modalRole"></div>
          <a class="modal-linkedin" id="modalLinkedin" href="#" target="_blank" rel="noopener" style="display:none;">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </a>
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-field">
          <label>Major</label>
          <p id="modalMajor"></p>
        </div>
        <div class="modal-field">
          <label>Year</label>
          <p id="modalYear"></p>
        </div>
        <div class="modal-field">
          <label>Hometown</label>
          <p id="modalHometown"></p>
        </div>
        <div class="modal-field">
          <label>Campus Involvements</label>
          <p id="modalInvolvements"></p>
        </div>
        <div class="modal-field modal-about">
          <label>About</label>
          <p id="modalAbout"></p>
        </div>
        <div class="modal-field modal-about">
          <label>Interests</label>
          <p id="modalInterests"></p>
        </div>
      </div>
      <div class="modal-footer" id="modalReach">
        <span>📬</span> Reach out at
        <a id="modalNetid" href="#"></a>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeMemberModal();
  });
})();

window.openMemberModal = function(data) {
  const overlay = document.getElementById('memberModal');
  if (!overlay) return;

  document.getElementById('modalName').textContent  = data.name  || '';
  document.getElementById('modalRole').textContent  = data.role  || '';
  document.getElementById('modalMajor').textContent = data.major || '';
  document.getElementById('modalYear').textContent  = data.year  || '';
  document.getElementById('modalHometown').textContent    = data.hometown    || 'N/A';
  document.getElementById('modalInvolvements').textContent = data.involvements || 'EWB Cornell';
  document.getElementById('modalInterests').textContent  = data.interests  || '';
  document.getElementById('modalAbout').textContent      = data.about      || '';

  // Photo
  const photoEl = document.getElementById('modalPhoto');
  if (data.photo) {
    photoEl.innerHTML = `<img src="${data.photo}" alt="${data.name}">`;
  } else {
    const colors = [
      ['#1d4ed8','#0ea5e9'],['#0369a1','#38bdf8'],
      ['#059669','#34d399'],['#7c3aed','#a78bfa'],
      ['#0f766e','#2dd4bf']
    ];
    const idx = (data.name || '').charCodeAt(0) % colors.length;
    photoEl.style.background = `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})`;
    photoEl.textContent = data.initials || (data.name||'?')[0];
  }

  // LinkedIn
  const li = document.getElementById('modalLinkedin');
  if (li) {
    if (data.linkedin) { li.href = data.linkedin; li.style.display = ''; }
    else { li.style.display = 'none'; }
  }

  // NetID email
  const reach  = document.getElementById('modalReach');
  const netidEl = document.getElementById('modalNetid');
  if (netidEl && data.netid) {
    netidEl.href = `mailto:${data.netid}@cornell.edu`;
    netidEl.textContent = `${data.netid}@cornell.edu`;
    if (reach) reach.style.display = '';
  } else if (reach) {
    reach.style.display = 'none';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeMemberModal = function() {
  const overlay = document.getElementById('memberModal');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') window.closeMemberModal();
});
