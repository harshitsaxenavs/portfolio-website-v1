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
    const sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm0-15a1 1 0 0 0 1 1h0a1 1 0 0 0 0-2h0a1 1 0 0 0-1 1Zm0 20a1 1 0 0 0 1 1h0a1 1 0 0 0 0-2h0a1 1 0 0 0-1 1Zm10-10a1 1 0 0 0-1 1h0a1 1 0 0 0 2 0h0a1 1 0 0 0-1-1ZM2 12a1 1 0 0 0-1 1h0a1 1 0 0 0 2 0h0a1 1 0 0 0-1-1Zm17.66-5.66a1 1 0 0 0 1.41 0h0a1 1 0 0 0 0-1.41h0a1 1 0 0 0-1.41 1.41Zm-14.14 14.14a1 1 0 0 0 1.41 0h0a1 1 0 0 0 0-1.41h0a1 1 0 0 0-1.41 1.41Zm0-14.14a1 1 0 0 0 0 1.41h0a1 1 0 0 0 1.41-1.41h0a1 1 0 0 0-1.41 0ZM19.07 19.07a1 1 0 0 0 0 1.41h0a1 1 0 0 0 1.41-1.41h0a1 1 0 0 0-1.41 0Z"/></svg>';
    const moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M21.64 13a1 1 0 0 0-1.05-.14 8.05 8.05 0 0 1-3.37.73 8.15 8.15 0 0 1-8.14-8.1 8.59 8.59 0 0 1 .25-2 1 1 0 0 0-1.33-1.13 10.14 10.14 0 1 0 13.64 10.64Z"/></svg>';

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
        anchor.addEventListener('click', function(e) {
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
        const phrases = ["AI/ML Engineer.", "Data Scientist.", "Web Developer.", "UI/UX Designer."];
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