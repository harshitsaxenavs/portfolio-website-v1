document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const header = document.querySelector('.main-header');

    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,#0084ff,#83bfff);z-index:1001;transform:scaleX(0);transform-origin:0 50%;transition:transform 0.1s ease-out;pointer-events:none;';
    body.appendChild(progressBar);

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateScrollVisuals() {
        const currentScrollY = window.scrollY;

        if (header) {
            header.classList.toggle('scrolled', currentScrollY > 50);
            header.style.transform = (currentScrollY > lastScrollY && currentScrollY > 100)
                ? 'translateY(-100%)'
                : 'translateY(0)';
        }

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFraction = maxScroll > 0 ? currentScrollY / maxScroll : 0;
        progressBar.style.transform = `scaleX(${scrollFraction})`;

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollVisuals);
            ticking = true;
        }
    }, { passive: true });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.classList.add('is-revealed');

                if (target.classList.contains('skill-item')) {
                    const bar = target.querySelector('.skill-bar-fill');
                    if (bar && bar.dataset.percentage) {
                        setTimeout(() => bar.style.width = bar.dataset.percentage + '%', 200);
                    }
                }
                obs.unobserve(target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-element, .skill-item').forEach(el => observer.observe(el));

    const toggleBtn = document.getElementById('dark-mode-toggle');
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    function setTheme(theme) {
        body.classList.toggle('dark-mode', theme === 'dark');
        localStorage.setItem('portfolio-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme === 'dark' ? '#0c151d' : '#f8fafc';
        if (toggleBtn) toggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    }

    let currentTheme = localStorage.getItem('portfolio-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(currentTheme);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(currentTheme);
        });
    }

    const menuBtn = document.getElementById('mobile-menu-button');
    const menu = document.querySelector('.header-nav');

    if (menuBtn && menu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = menu.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && !menu.contains(e.target) && e.target !== menuBtn) {
                menu.classList.remove('active');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (menu && menu.classList.contains('active')) {
                menu.classList.remove('active');
                if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
            }

            if (target && header) {
                const headerHeight = header.offsetHeight;
                const top = target.offsetTop - headerHeight - 20;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    const typeEl = document.getElementById('typing-text');
    if (typeEl) {
        const phrases = ["AI/ML Engineer.", "LLM & RAG Developer.", "Data Scientist.", "Web Developer."];
        let pIdx = 0, cIdx = 0, isDeleting = false;

        function typeLoop() {
            const current = phrases[pIdx];
            typeEl.textContent = current.substring(0, cIdx);

            if (!isDeleting && cIdx < current.length) {
                cIdx++;
                setTimeout(typeLoop, 100);
            } else if (isDeleting && cIdx > 0) {
                cIdx--;
                setTimeout(typeLoop, 50);
            } else {
                isDeleting = !isDeleting;
                if (!isDeleting) pIdx = (pIdx + 1) % phrases.length;
                setTimeout(typeLoop, isDeleting ? 1500 : 500);
            }
        }
        typeLoop();
    }
});