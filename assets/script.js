document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ── PROGRESS BAR & NAV SCROLL ── */
  const prog = document.getElementById('progress');
  const navEl = document.getElementById('nav');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const d = document.documentElement;
        // Calculate scroll percentage safely (prevents NaN if height is too small to scroll)
        const maxScroll = d.scrollHeight - d.clientHeight;
        const scrollPercent = maxScroll > 0 ? (d.scrollTop / maxScroll) * 100 : 0;
        prog.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
        
        // Toggle nav shadow
        navEl.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ── PERSISTENT DARK MODE ── */
  const body = document.body;
  const themeBtn = document.getElementById('themeBtn');
  const drawerThemeBtn = document.getElementById('drawerThemeBtn');
  
  // Check memory first, fallback to OS preference
  const savedTheme = localStorage.getItem('theme');
  let isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const applyTheme = (dark) => {
    isDark = dark;
    body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const label = isDark ? 'Light' : 'Dark';
    themeBtn.textContent = label;
    drawerThemeBtn.textContent = label;
  };

  // Init theme
  applyTheme(isDark);
  
  const toggleTheme = () => applyTheme(!isDark);
  themeBtn.addEventListener('click', toggleTheme);
  drawerThemeBtn.addEventListener('click', toggleTheme);

  /* ── MOBILE DRAWER ── */
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawerClose');
  const overlay = document.getElementById('drawerOverlay');

  const openDrawer = () => {
    body.classList.add('menu-open');
    drawer.classList.add('open');
    overlay.classList.add('open');
    body.style.overflow = 'hidden'; // Prevent background scrolling
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const closeDrawer = () => {
    body.classList.remove('menu-open');
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => body.classList.contains('menu-open') ? closeDrawer() : openDrawer());
  drawerClose.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('.drawer-links a').forEach(a => a.addEventListener('click', closeDrawer));
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) closeDrawer();
  });

  /* ── INTERSECTION OBSERVER: REVEAL ANIMATIONS ── */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ── INTERSECTION OBSERVER: NUMBER COUNTERS ── */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || '';
    const isFloat = !Number.isInteger(target);
    const fmt = (v) => (isFloat ? v.toFixed(2) : Math.round(v)) + suffix;
    if (reduceMotion) { el.textContent = fmt(target); return; }
    let cur = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = fmt(cur);
      if (cur >= target) clearInterval(timer);
    }, 16);
  };

  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in'); // drives the CGPA ring fill
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.acad-ring').forEach(el => countObserver.observe(el));

  /* ── INTERSECTION OBSERVER: ACTIVE NAV LINKS ── */
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  
  // Root margin tweaked heavily to prevent flickering when scrolling between sections
  const activeNavObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { threshold: 0, rootMargin: "-20% 0px -79% 0px" });
  
  sections.forEach(sec => activeNavObserver.observe(sec));

  /* ── ASYNC CONTACT FORM HANDLER ── */
  const contactForm = document.getElementById('my-form');
  const statusText = document.getElementById('my-form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      // 1. STOPS the browser from redirecting to Formspree
      e.preventDefault(); 
      
      const btn = document.getElementById('submitBtn');
      const originalText = btn.textContent;
      
      // 2. Change button to show loading state
      btn.textContent = 'Sending...';
      btn.style.pointerEvents = 'none';

      try {
        // 3. Send the data to Formspree in the background
        const response = await fetch(e.target.action, {
          method: contactForm.method,
          body: new FormData(e.target),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // 4. On Success: Change button, reset form, show message
          btn.textContent = 'Message Sent ✓';
          btn.style.backgroundColor = '#16a34a'; // Turn button green
          contactForm.reset();
          statusText.textContent = "Thanks! I'll get back to you soon.";
          statusText.style.color = "#16a34a"; 
        } else {
          throw new Error('Network error');
        }
      } catch (error) {
        // 5. On Error
        btn.textContent = originalText;
        statusText.textContent = "Oops! Something went wrong.";
        statusText.style.color = "#ef4444"; 
      } finally {
        // 6. Reset everything back to normal after 5 seconds
        setTimeout(() => { 
          btn.textContent = originalText; 
          btn.style.backgroundColor = ''; // Restore original color
          statusText.textContent = "";
          btn.style.pointerEvents = 'auto';
        }, 5000);
      }
    });
  }
});