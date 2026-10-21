document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // ÇÖKME HATASINI BİTİREN GÜVENLİ EKLENTİ YÜKLEMESİ
    // ==========================================
    if (typeof gsap !== 'undefined') {
        if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
        if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);
    } else {
        console.warn("GSAP henüz yüklenmedi, animasyonlar gecikebilir.");
    }

    // ==========================================
    // DARK MODE VE FOOTER İKON ZIRHI
    // ==========================================
    if (!document.getElementById('spa-darkmode-fix')) {
        const dmStyle = document.createElement('style');
        dmStyle.id = 'spa-darkmode-fix';
        dmStyle.textContent = `
            body.page-about,
            body.page-about #page-content,
            body.page-about #spa-container {
                transition: background-color 0.6s ease, color 0.6s ease;
            }
            body.page-about #page-content,
            body.page-about #spa-container {
                background-color: transparent !important;
            }
            body.dark-mode,
            body.page-about.dark-mode,
            body.dark-mode #page-content,
            body.dark-mode #spa-container,
            body.dark-mode .about-vision-section,
            body.dark-mode .about-cert-section,
            body.dark-mode .about-insta-section {
                background-color: #0f1317 !important;
                color: #ffffff !important;
            }
            /* Footer ve WhatsApp İkonlarının Büyümesini Engelleyen Kilit */
            .site-footer .footer-contact ul li {
                display: flex !important;
                align-items: flex-start !important;
                gap: 12px !important;
            }
            .site-footer .footer-contact svg {
                width: 20px !important;
                height: 20px !important;
                min-width: 20px !important;
                max-width: 20px !important;
                max-height: 20px !important;
                flex-shrink: 0 !important;
                margin-top: 3px;
            }
            .site-footer .social-icons a {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            .site-footer .social-icons svg {
                width: 20px !important;
                height: 20px !important;
                min-width: 20px !important;
                max-width: 20px !important;
                flex-shrink: 0 !important;
            }
            .floating-whatsapp svg {
                width: 28px !important;
                height: 28px !important;
                min-width: 28px !important;
                max-width: 28px !important;
                flex-shrink: 0 !important;
            }
        `;
        document.head.appendChild(dmStyle);
    }

    const mainPageElementsSelector = '.hero-section, .seo-section, .services-section, .about-section, .process-section, .quality-section, .reviews-section, .faq-section, .social-interactive, .compare-section, .sticky-next-bar:not(#spa-container .sticky-next-bar)';

    // =========================================================================
    // KENDİ KENDİNİ ONARMA MOTORU VE DEMİRBAŞ (FIXTURE) MİMARİSİ
    // =========================================================================
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.zIndex = '9999';
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';

        overlay.innerHTML = `
            <div class="overlay-dark" style="position:absolute; top:0; left:0; width:100%; height:100%; background:#111; transform:scaleY(0); transform-origin:bottom;"></div>
            <div class="overlay-accent" style="position:absolute; top:0; left:0; width:100%; height:100%; background:#d69a36; transform:scaleY(0); transform-origin:bottom;"></div>
            <div class="transition-content" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#fff; opacity:0; font-family:sans-serif; font-weight:bold;"></div>
        `;
        document.body.appendChild(overlay);
    }

    const globalFooter = document.querySelector('.site-footer');

    // Hakkımızda gibi #page-content kapsayıcısı olmayan alt sayfalarda otomatik sarmalayıcı oluşturur
    const hasMainHero = document.querySelector('.hero-section') !== null;
    if (!hasMainHero && !document.getElementById('page-content')) {
        const autoPageContent = document.createElement('div');
        autoPageContent.id = 'page-content';
        const childrenToWrap = Array.from(document.body.children).filter(el => {
            const tag = el.tagName.toLowerCase();
            return tag !== 'header' &&
                tag !== 'footer' &&
                tag !== 'script' &&
                !el.classList.contains('site-header') &&
                !el.classList.contains('site-footer') &&
                !el.classList.contains('page-transition-overlay') &&
                !el.classList.contains('floating-whatsapp') &&
                el.id !== 'spa-container';
        });
        if (globalFooter) {
            globalFooter.parentNode.insertBefore(autoPageContent, globalFooter);
        } else {
            document.body.appendChild(autoPageContent);
        }
        childrenToWrap.forEach(el => autoPageContent.appendChild(el));
    }

    let spaContainer = document.getElementById('spa-container');
    if (!spaContainer) {
        spaContainer = document.createElement('div');
        spaContainer.id = 'spa-container';
        if (globalFooter) {
            globalFooter.parentNode.insertBefore(spaContainer, globalFooter);
        } else {
            document.body.appendChild(spaContainer);
        }
    } else if (globalFooter && spaContainer.nextElementSibling !== globalFooter) {
        globalFooter.parentNode.insertBefore(spaContainer, globalFooter);
    }

    let isTransitioning = false;
    let isTransitionCooldown = false;
    let isSubpageLoaded = false;
    let lastScrollY = 0;
    const navHistoryStack = [];

    // ==========================================
    // MOBİL MENÜ VE OTOMATİK NAVBAR ONARICI
    // ==========================================
    const mobileToggle = document.querySelector(".mobile-toggle");
    const mobileCloseBtn = document.querySelector(".mobile-close-btn");
    const mainNav = document.querySelector(".main-nav");

    const toggleMenu = () => {
        if (mobileToggle) mobileToggle.classList.toggle("active");
        if (mainNav) mainNav.classList.toggle("menu-active");

        if (typeof gsap !== 'undefined' && mainNav) {
            if (mainNav.classList.contains("menu-active")) {
                gsap.timeline().to(".main-nav .menu-header, .main-nav #menu-honeycomb", { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power4.out" });
            } else {
                gsap.to(".main-nav .menu-header, .main-nav #menu-honeycomb", { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" });
            }
        }
    };

    if (mobileToggle) mobileToggle.addEventListener("click", toggleMenu);
    if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", toggleMenu);

    // Alt sayfalardaki eksik veya eski kalmış menü linklerini otomatik onarır ve çiftlenenleri siler
    function repairNavbarLinks() {
        const navLinksContainer = document.querySelector('.nav-links');
        if (!navLinksContainer) return;

        const links = Array.from(navLinksContainer.querySelectorAll('.nav-link'));
        let iletisimCount = 0;
        let galeriLi = null;

        links.forEach(link => {
            const text = link.innerText.trim().toLocaleLowerCase('tr-TR');
            const href = (link.getAttribute('href') || '').toLowerCase();

            if (text.includes('hakkımızda') || href.includes('hakkimizda') || href.includes('biz-kimiz')) {
                link.setAttribute('href', 'hakkimizda/index.html');
            } else if (text.includes('galeri') || href.includes('galeri')) {
                link.setAttribute('href', 'galeri/index.html');
                galeriLi = link.closest('li');
            } else if (text.includes('iletişim') || text.includes('iletisim') || href.includes('iletisim')) {
                iletisimCount++;
                if (iletisimCount > 1) {
                    const parentLi = link.closest('li');
                    if (parentLi) parentLi.remove();
                } else {
                    link.setAttribute('href', 'iletisim/index.html');
                }
            }
        });

        if (iletisimCount === 0 && galeriLi) {
            const iletisimLi = document.createElement('li');
            iletisimLi.className = 'nav-item';
            iletisimLi.innerHTML = `<a href="iletisim/index.html" class="nav-link spa-link">İletişim</a>`;
            galeriLi.parentNode.insertBefore(iletisimLi, galeriLi.nextSibling);
        }

        document.querySelectorAll(".nav-link").forEach(link => {
            link.onclick = () => {
                if (mainNav && mainNav.classList.contains("menu-active")) {
                    toggleMenu();
                }
            };
        });
    }

    repairNavbarLinks();

    const updateNavbar = () => {
        const currentNavLinks = document.querySelectorAll(".nav-link");
        currentNavLinks.forEach(link => link.classList.remove('active'));
        const currentUrl = window.location.href.toLowerCase();

        let targetText = 'Ana Sayfa';
        if (currentUrl.includes('hakkimizda')) targetText = 'Hakkımızda';
        else if (currentUrl.includes('galeri')) targetText = 'Galeri';
        else if (currentUrl.includes('iletisim')) targetText = 'İletişim';
        else if (currentUrl.includes('pimapen') || currentUrl.includes('cambalkon') || currentUrl.includes('aluminyum') || currentUrl.includes('giyotin') || currentUrl.includes('panjur')) targetText = 'Hizmetler';

        const activeLink = Array.from(currentNavLinks).find(l => l.innerText.trim() === targetText);
        if (activeLink) activeLink.classList.add('active');
    };

    const initialUrl = window.location.href.toLowerCase();
    const isSubpageInit = initialUrl.includes('pimapen') || initialUrl.includes('cambalkon') || initialUrl.includes('aluminyum') || initialUrl.includes('panjur') || initialUrl.includes('giyotin') || initialUrl.includes('hakkimizda') || initialUrl.includes('galeri') || initialUrl.includes('iletisim');

    if (isSubpageInit || document.querySelector('.detail-section') || document.querySelector('.page-iletisim') || document.querySelector('.page-about')) {
        isSubpageLoaded = true;
        updateNavbar();
    } else {
        updateNavbar();
    }

    // İLK AÇILIŞTA GEÇMİŞ DURUMUNU KAYDET VE URL'DEKİ INDEX.HTML YAZISINI TEMİZLE
    const initialCleanUrl = window.location.href.replace(/\/index\.html(\#.*)?$/i, '/$1');
    window.history.replaceState({
        path: window.location.href,
        title: document.title,
        isSubpage: isSubpageLoaded
    }, '', initialCleanUrl);

    // ==========================================
    // 1. ANA SAYFA ANİMASYON MERKEZİ
    // ==========================================
    function initMainPageAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        document.body.classList.remove('dark-mode', 'page-about');

        if (document.querySelector('.hero-title')) {
            gsap.set(".brand-logo, .nav-link, .header-line, .nav-actions, .subtitle-wrapper, .hero-title, .hero-desc, .btn-whatsapp, .hc-stroke, .b-track, .b-track-inner, .b-frame, .b-detail, .fill-path, .glass-fill, #logo-glow-circle", { clearProps: "all" });

            const tlHero = gsap.timeline({ defaults: { ease: "power4.out" } });
            tlHero.from(".brand-logo", { opacity: 0, y: 15, duration: 1 })
                .from(".nav-link", { y: "100%", opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.7")
                .from(".header-line", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, "-=0.8")
                .from(".nav-actions", { opacity: 0, x: 15, duration: 0.8 }, "-=0.9")
                .from(".subtitle-wrapper, .hero-title, .hero-desc", { y: 30, opacity: 0, duration: 1, stagger: 0.15 }, "-=0.5")
                .fromTo(".btn-whatsapp", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
                .to(".hc-stroke", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", stagger: 0.08 }, "-=1.0")
                .to(".b-track, .b-track-inner", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut", stagger: 0.1 }, "-=1.0")
                .to(".b-frame, .b-detail", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", stagger: 0.15 }, "-=0.8")
                .add(() => { document.getElementById("animated-logo-svg")?.classList.add("completed"); }, "-=0.2")
                .to(".fill-path, .glass-fill, #logo-glow-circle", { opacity: 1, duration: 1.2, stagger: 0.08, ease: "power2.out" }, "-=0.4");
        }

        const compareSlider = document.querySelector('.slider-input');
        const sliderWrapper = document.querySelector('.slider-wrapper');
        if (compareSlider && sliderWrapper) {
            compareSlider.addEventListener('input', (e) => {
                sliderWrapper.style.setProperty('--position', `${e.target.value}%`);
            });
        }

        if (document.getElementById('biz-kimiz')) {
            gsap.set(".about-section .subtitle-wrapper, .about-section .section-title, .about-section .section-desc, .about-section .about-actions .btn, #animated-company-svg .about-draw-path, #animated-company-svg .company-pane", { clearProps: "all" });
            const tlBizKimiz = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
            tlBizKimiz.from(".about-section .subtitle-wrapper, .about-section .section-title, .about-section .section-desc", { y: 30, opacity: 0, duration: 1, stagger: 0.15 })
                .fromTo(".about-section .about-actions .btn", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.6")
                .to("#animated-company-svg .about-draw-path", { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", stagger: 0.05 }, "-=1.0")
                .add(() => { document.getElementById("animated-company-svg")?.classList.add("completed"); }, "-=0.2")
                .to("#animated-company-svg .company-pane", { opacity: 1, duration: 1.2, stagger: 0.1, ease: "power2.out" }, "-=0.4");
            ScrollTrigger.create({ trigger: "#biz-kimiz", start: "top 60%", onEnter: () => tlBizKimiz.play() });
        }

        if (document.getElementById('nasil-calisiyoruz')) {
            gsap.set(".process-section .subtitle-wrapper, .process-section .section-title, .p-step, .p-line-path", { clearProps: "all" });
            const tlProcess = gsap.timeline({ scrollTrigger: { trigger: "#nasil-calisiyoruz", start: "top 70%" }, defaults: { ease: "power3.out" } });
            tlProcess.from(".process-section .subtitle-wrapper, .process-section .section-title", { y: 30, opacity: 0, duration: 0.8, stagger: 0.15 });
            const steps = document.querySelectorAll('.p-step');
            const arrows = document.querySelectorAll('.p-line-path');
            steps.forEach((step, index) => {
                tlProcess.from(step, { y: 40, opacity: 0, duration: 0.3 }, "-=0.2");
                if (arrows[index]) tlProcess.to(arrows[index], { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, "-=0.1");
            });
        }

        if (document.getElementById('teknoloji')) {
            gsap.set(".quality-section .subtitle-wrapper, .quality-section .section-title, .quality-card", { clearProps: "all" });
            const tlQuality = gsap.timeline({ scrollTrigger: { trigger: "#teknoloji", start: "top 75%" }, defaults: { ease: "power3.out" } });
            tlQuality.from(".quality-section .subtitle-wrapper, .quality-section .section-title", { y: 30, opacity: 0, duration: 0.8, stagger: 0.15 })
                .from(".quality-card", { y: 40, opacity: 0, duration: 0.8, stagger: 0.15 }, "-=0.4");
        }

        const reviewsSection = document.querySelector('.reviews-section');
        if (reviewsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) { entry.target.classList.add('in-view'); }
                    else { entry.target.classList.remove('in-view'); }
                });
            }, { threshold: 0.1 });
            observer.observe(reviewsSection);
        }

        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            if (question && answer) {
                question.onclick = () => {
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                            otherItem.querySelector('.faq-answer').style.maxHeight = null;
                        }
                    });
                    item.classList.toggle('active');
                    if (item.classList.contains('active')) {
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    } else {
                        answer.style.maxHeight = null;
                    }
                };
            }
        });

        const btnHayir = document.getElementById('btn-hayir');
        const actionArea = document.getElementById('social-action-area');
        if (btnHayir && actionArea && typeof gsap !== 'undefined') {
            let currentX = 0; let currentY = 0;
            const runAway = () => {
                const isMobile = window.innerWidth <= 768;
                const minX = isMobile ? 60 : 150; const maxX = isMobile ? 100 : 280;
                const minY = isMobile ? 50 : 60; const maxY = isMobile ? 80 : 100;
                let randomX, randomY; let attempts = 0;
                do {
                    const dirX = Math.random() < 0.5 ? -1 : 1; const dirY = Math.random() < 0.5 ? -1 : 1;
                    randomX = dirX * (Math.random() * (maxX - minX) + minX);
                    randomY = dirY * (Math.random() * (maxY - minY) + minY);
                    attempts++;
                } while (Math.abs(randomX - currentX) < (isMobile ? 50 : 120) && Math.abs(randomY - currentY) < (isMobile ? 40 : 70) && attempts < 10);
                currentX = randomX; currentY = randomY;
                gsap.to(btnHayir, { x: randomX, y: randomY, duration: 0.15, ease: "power4.out", overwrite: "auto" });
            };
            btnHayir.addEventListener('mouseenter', runAway);
            btnHayir.addEventListener('touchstart', (e) => { e.preventDefault(); runAway(); }, { passive: false });
        }

        if (document.querySelector('.footer-top-line') && typeof gsap !== 'undefined') {
            gsap.set(".footer-top-line", { clearProps: "all" });
            gsap.to(".footer-top-line", {
                scrollTrigger: { trigger: ".site-footer", start: "top 90%" },
                scaleX: 1, duration: 1.5, ease: "power3.out"
            });
        }

        const mainStickyBar = document.querySelector('.sticky-next-bar:not(#spa-container .sticky-next-bar)');
        if (mainStickyBar && !isSubpageLoaded && typeof gsap !== 'undefined') {
            ScrollTrigger.create({
                trigger: "#sss",
                start: "top 80%",
                onEnter: () => mainStickyBar.classList.add('is-visible'),
                onLeaveBack: () => mainStickyBar.classList.remove('is-visible')
            });
        }

        if (document.getElementById('izmir-seo') && typeof gsap !== 'undefined') {
            gsap.set(".seo-content > *, .loc-tag, .radar-map-wrapper, .glass-seo-card", { clearProps: "all" });
            const seoTl = gsap.timeline({ scrollTrigger: { trigger: "#izmir-seo", start: "top 75%", defaults: { ease: "power3.out" } } });
            seoTl.to(".seo-content > *", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 })
                .to(".loc-tag", { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.5)" }, "-=0.4")
                .to(".radar-map-wrapper", { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.8")
                .to(".glass-seo-card", { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" }, "-=0.4");
        }

        ScrollTrigger.refresh();
    }


    // ==========================================
    // 2. ALT SAYFALARIN (SPA) ANİMASYON MERKEZİ
    // ==========================================
    function initSubPageAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        document.body.classList.remove('dark-mode', 'page-about');

        // PİMAPEN
        if (document.querySelector('.page-pimapen')) {
            const visualTl = gsap.timeline();
            gsap.set(".detail-info > *", { y: 30, opacity: 0 });
            gsap.set(".architectural-draw", { scale: 0.95, opacity: 0 });

            const svgElements = document.querySelectorAll(".subpage-svg path, .subpage-svg rect, .subpage-svg circle, .subpage-svg line, .subpage-svg polyline");
            svgElements.forEach(el => {
                const fixedLength = 4000;
                el.style.strokeDasharray = fixedLength;
                el.style.strokeDashoffset = fixedLength;
                el.style.strokeOpacity = 0;
            });

            visualTl.addLabel("drawing")
                .to(".architectural-draw", { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }, "drawing")
                .to(".detail-info > *", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "drawing")
                .to(svgElements, { strokeOpacity: 1, duration: 0.1 }, "drawing+=0.2")
                .to(svgElements, { strokeDashoffset: 0, duration: 3.5, ease: "power2.inOut", stagger: 0.1 }, "drawing+=0.2")
                .addLabel("drawingEnd", ">")
                .add(() => {
                    const card = document.querySelector('.architectural-draw');
                    if (card) card.classList.add('is-3d');
                }, "drawingEnd");

            if (document.getElementById('pimapen-faydalar')) {
                gsap.set(".benefits-section .section-header > *", { y: 30, opacity: 0 });
                gsap.set(".benefit-card", { y: 40, opacity: 0 });
                const benefitsTl = gsap.timeline({ scrollTrigger: { trigger: "#pimapen-faydalar", start: "top 85%", defaults: { ease: "power4.out" } } });
                benefitsTl.to(".benefits-section .section-header > *", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 })
                    .to(".benefit-card", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }, "-=0.4");
            }

            const anatomiSection = document.getElementById('pimapen-anatomi');
            if (anatomiSection) {
                gsap.set(".anatomy-section .section-header > *", { y: 30, opacity: 0 });
                gsap.set(".hud-btn", { x: 30, opacity: 0 });
                gsap.set(".hud-display-panel", { opacity: 0, y: 20 });
                gsap.to(".blueprint-3d-container", { y: -15, duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut" });

                const anatomiTl = gsap.timeline({ scrollTrigger: { trigger: "#pimapen-anatomi", start: "top 80%", defaults: { ease: "power2.out" } } });
                anatomiTl.to(".anatomy-section .section-header > *", { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 })
                    .fromTo("#blueprint-model", { scale: 0.85, opacity: 0, rotationY: -15 }, { scale: 1, opacity: 1, rotationY: 0, duration: 1.5, ease: "sine.out" }, "-=0.8")
                    .to(".hud-btn", { x: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "-=1.2")
                    .to(".hud-display-panel", { opacity: 1, y: 0, duration: 1.2 }, "-=1.0");

                const hudBtns = document.querySelectorAll('.hud-btn');
                const infoCards = document.querySelectorAll('.a-info-card');
                const svgParts = document.querySelectorAll('.svg-part');
                gsap.set(svgParts, { opacity: 0.4 });
                gsap.set("#svg-odaciklar", { opacity: 1, filter: "url(#gold-glow)" });

                hudBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const targetId = btn.getAttribute('data-target');
                        const targetSvgId = btn.getAttribute('data-svg');
                        const rotX = btn.getAttribute('data-rotx');
                        const rotY = btn.getAttribute('data-roty');
                        const scale = btn.getAttribute('data-scale');

                        hudBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        infoCards.forEach(card => {
                            if (card.id === targetId) {
                                card.style.display = 'block';
                                gsap.fromTo(card, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" });
                            } else {
                                card.style.display = 'none';
                            }
                        });

                        gsap.to(".blueprint-3d-container", { rotationX: rotX, rotationZ: rotY, scale: scale, duration: 1, ease: "power3.inOut" });
                        gsap.to(svgParts, { opacity: 0.3, filter: "none", duration: 0.4 });
                        if (targetSvgId) gsap.to(`#${targetSvgId}`, { opacity: 1, filter: "url(#gold-glow)", duration: 0.4, delay: 0.2 });
                    });
                });
            }

            if (document.getElementById('pimapen-renkler')) {
                const pConfigTl = gsap.timeline({ scrollTrigger: { trigger: "#pimapen-renkler", start: "top 75%", defaults: { ease: "power4.out" } } });
                gsap.set(".pimapen-header > *", { y: 30, opacity: 0 });
                gsap.set(".p-window-model", { scale: 0.8, opacity: 0 });
                gsap.set(".p-left-controls .p-color-pill-btn", { x: -40, opacity: 0 });
                gsap.set(".p-right-controls .p-color-pill-btn", { x: 40, opacity: 0 });

                pConfigTl.to(".pimapen-header > *", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 })
                    .to(".p-window-model", { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.2)" }, "-=0.4")
                    .to(".p-left-controls .p-color-pill-btn", { x: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.6")
                    .to(".p-right-controls .p-color-pill-btn", { x: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.6");

                const pProfileBtns = document.querySelectorAll('#pimapen-profile-colors .p-color-pill-btn');
                const pGlassBtns = document.querySelectorAll('#pimapen-glass-colors .p-color-pill-btn');
                const root = document.documentElement;

                pProfileBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        pProfileBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        root.style.setProperty('--pimapen-preview-profile', btn.dataset.color);
                    });
                });

                pGlassBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        pGlassBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        root.style.setProperty('--pimapen-preview-glass', btn.dataset.color);
                    });
                });
            }
        }

        // CAM BALKON
        else if (document.querySelector('.page-cambalkon')) {
            const visualTl = gsap.timeline();
            gsap.set(".detail-info > *", { y: 30, opacity: 0 });
            gsap.set(".blueprint-card", { scale: 0.95, opacity: 0 });

            const svgElements = document.querySelectorAll(".subpage-svg path, .subpage-svg rect, .subpage-svg circle, .subpage-svg line, .subpage-svg polyline");
            svgElements.forEach(el => {
                const fixedLength = 4000;
                el.style.strokeDasharray = fixedLength;
                el.style.strokeDashoffset = fixedLength;
                el.style.strokeOpacity = 0;
            });

            visualTl.addLabel("drawing")
                .to(".blueprint-card", { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }, "drawing")
                .to(".detail-info > *", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "drawing")
                .to(svgElements, { strokeOpacity: 1, duration: 0.1 }, "drawing+=0.2")
                .to(svgElements, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", stagger: 0.05 }, "drawing+=0.2");

            visualTl.addLabel("depth", "+=0.2")
                .add(() => {
                    const depthLayer = document.getElementById('blueprint-glass-depth');
                    if (depthLayer) depthLayer.classList.add('bp-active');
                }, "depth")
                .to(".bp-glass-fill", { opacity: 1, duration: 1, stagger: 0.15 }, "depth")
                .to(".bp-glass-fill-persp", { opacity: 1, duration: 0.8 }, "depth+=0.3")
                .to(".tech-specs-mini", { borderTopColor: "rgba(214, 154, 54, 0.4)", duration: 0.5 }, "depth+=0.5");

            if (document.getElementById('cambalkon-faydalar')) {
                gsap.set("#cambalkon-faydalar .section-header > *", { y: 30, opacity: 0 });
                gsap.set("#cambalkon-faydalar .benefit-card", { y: 40, opacity: 0 });
                const cbBenefitsTl = gsap.timeline({ scrollTrigger: { trigger: "#cambalkon-faydalar", start: "top 85%", defaults: { ease: "power4.out" } } });
                cbBenefitsTl.to("#cambalkon-faydalar .section-header > *", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 })
                    .to("#cambalkon-faydalar .benefit-card", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }, "-=0.4");
            }

            if (document.getElementById('renkler')) {
                const configTl = gsap.timeline({ scrollTrigger: { trigger: "#renkler", start: "top 80%", defaults: { ease: "power4.out" } } });
                gsap.set(".custom-header > *", { y: 30, opacity: 0 });
                gsap.set(".showcase-visual", { scale: 0.9, opacity: 0 });
                gsap.set(".color-btn", { x: (i, target) => target.closest('.profile-controls') ? -30 : 30, opacity: 0 });

                configTl.to(".custom-header > *", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 })
                    .to(".showcase-visual", { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.2)" }, "-=0.4")
                    .to(".color-btn", { x: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.8");

                const profileBtns = document.querySelectorAll('#profile-colors .color-btn');
                const glassBtns = document.querySelectorAll('#glass-colors .color-btn');
                const root = document.documentElement;

                profileBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        profileBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        root.style.setProperty('--preview-profile', btn.dataset.color);
                    });
                });

                glassBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        glassBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        root.style.setProperty('--preview-glass', btn.dataset.color);
                    });
                });
            }
        }

        // ALÜMİNYUM DOĞRAMA
        else if (document.querySelector('.page-aluminyum')) {
            const aluTl = gsap.timeline();
            gsap.set(".page-aluminyum .detail-info > *", { y: 30, opacity: 0 });
            gsap.set(".page-aluminyum .blueprint-card", { scale: 0.95, opacity: 0 });
            gsap.set(".page-aluminyum .alu-metal-fill, .page-aluminyum .alu-glass-fill, .page-aluminyum .alu-handle-fill, .page-aluminyum .alu-arrows", { opacity: 0 });

            const aluSvgLines = document.querySelectorAll(".page-aluminyum .alu-svg .alu-stroke, .page-aluminyum .alu-svg .alu-stroke-thin");
            aluSvgLines.forEach(el => {
                const fixedLength = 4000;
                el.style.strokeDasharray = fixedLength;
                el.style.strokeDashoffset = fixedLength;
                el.style.strokeOpacity = 0;
            });

            aluTl.addLabel("drawingStart")
                .to(".page-aluminyum .blueprint-card", { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out" }, "drawingStart")
                .to(".page-aluminyum .detail-info > *", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "drawingStart")
                .to(aluSvgLines, { strokeOpacity: 1, duration: 0.2 }, "drawingStart+=0.2")
                .to(aluSvgLines, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", stagger: 0.02 }, "drawingStart+=0.2")
                .addLabel("colorAnd3D", "-=0.4")
                .add(() => {
                    const card = document.querySelector('.page-aluminyum .blueprint-card');
                    if (card) card.classList.add('is-3d');
                }, "colorAnd3D")
                .to(".page-aluminyum .alu-glass-fill", { opacity: 0.9, duration: 2.5, ease: "sine.inOut" }, "colorAnd3D")
                .to(".page-aluminyum .alu-metal-fill", { opacity: 0.85, duration: 2.5, ease: "sine.inOut" }, "colorAnd3D")
                .to(".page-aluminyum .alu-handle-fill", { opacity: 0.9, duration: 2.5, ease: "sine.inOut" }, "colorAnd3D")
                .to(".page-aluminyum .alu-arrows", { opacity: 0.8, duration: 1.5, ease: "power2.out" }, "colorAnd3D+=0.5");

            if (document.querySelector('.alu-features')) {
                const revealTl = gsap.timeline({ scrollTrigger: { trigger: ".alu-features", start: "top 75%", defaults: { ease: "power4.out" } } });
                revealTl.from(".alu-features .reveal-target > *", { y: 30, opacity: 0, duration: 0.8, stagger: 0.15 })
                    .from(".alu-features .reveal-card", { y: 40, opacity: 0, duration: 0.8, stagger: 0.15 }, "-=0.4");
            }

            if (document.querySelector('.alu-compare-section')) {
                const cmpTl = gsap.timeline({ scrollTrigger: { trigger: ".alu-compare-section", start: "top 75%", defaults: { ease: "power4.out" } } });
                cmpTl.from(".alu-compare-section .compare-reveal", { y: 40, opacity: 0, duration: 0.8, stagger: 0.2 });

                const aluSliderInput = document.querySelector('.alu-slider-input');
                const aluSliderWrapper = document.querySelector('.alu-slider-wrapper');
                if (aluSliderInput && aluSliderWrapper) {
                    gsap.to(aluSliderWrapper, {
                        "--position": "60%", duration: 1, ease: "power2.inOut", delay: 1,
                        onComplete: () => { gsap.to(aluSliderWrapper, { "--position": "50%", duration: 1, ease: "power2.inOut" }); }
                    });
                    aluSliderInput.addEventListener('input', (e) => {
                        aluSliderWrapper.style.setProperty('--position', `${e.target.value}%`);
                    });
                }
            }

            if (document.querySelector('.alu-faq-section')) {
                gsap.from(".alu-faq-section .faq-reveal", { y: 40, opacity: 0, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: ".alu-faq-section", start: "top 75%", defaults: { ease: "power4.out" } } });
                const accItems = document.querySelectorAll('.alu-accordion-item');
                accItems.forEach(item => {
                    const btn = item.querySelector('.alu-accordion-btn');
                    const content = item.querySelector('.alu-accordion-content');
                    btn.addEventListener('click', () => {
                        const isActive = item.classList.contains('active');
                        accItems.forEach(el => {
                            el.classList.remove('active');
                            el.querySelector('.alu-accordion-content').style.maxHeight = null;
                        });
                        if (!isActive) {
                            item.classList.add('active');
                            content.style.maxHeight = content.scrollHeight + "px";
                        }
                    });
                });
            }

            if (document.querySelector('.alu-eco-section')) {
                const ecoTl = gsap.timeline({ scrollTrigger: { trigger: ".alu-eco-section", start: "top 75%", defaults: { ease: "power4.out" } } });
                ecoTl.from(".alu-eco-section .section-header > *", { y: 30, opacity: 0, duration: 0.8, stagger: 0.15 })
                    .from(".alu-eco-section .eco-card", { y: 40, opacity: 0, duration: 0.8, stagger: 0.2 }, "-=0.4");
            }

            if (document.querySelector('.alu-cta-section')) {
                gsap.from(".alu-cta-section .cta-reveal", { y: 50, opacity: 0, duration: 1, scrollTrigger: { trigger: ".alu-cta-section", start: "top 80%", defaults: { ease: "power3.out" } } });
            }

            if (document.querySelector('.alu-gallery-section')) {
                gsap.from(".alu-gallery-section .gallery-reveal", { y: 40, opacity: 0, duration: 0.8, stagger: 0.2, scrollTrigger: { trigger: ".alu-gallery-section", start: "top 75%", defaults: { ease: "power4.out" } } });
                const galleryItems = document.querySelectorAll('.alu-gallery-section .gallery-item');
                galleryItems.forEach(item => {
                    item.addEventListener('mouseenter', () => {
                        galleryItems.forEach(el => el.classList.remove('active'));
                        item.classList.add('active');
                    });
                    item.addEventListener('click', () => {
                        galleryItems.forEach(el => el.classList.remove('active'));
                        item.classList.add('active');
                    });
                });
            }
        }

        // İLETİŞİM SAYFASI
        else if (document.querySelector('.page-iletisim')) {
            const contactTl = gsap.timeline();

            contactTl.fromTo(".page-iletisim .breadcrumb, .page-iletisim .subpage-title, .page-iletisim .subpage-desc",
                { y: 30, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
            );

            gsap.fromTo(".info-card, .contact-social",
                { y: 40, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".contact-main-section", start: "top 80%" } }
            );

            gsap.fromTo(".map-overlay-card",
                { autoAlpha: 0, scale: 0.8 },
                { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)", scrollTrigger: { trigger: ".contact-map-section", start: "top 70%" } }
            );
        }

        // GALERİ SAYFASI, FİLTRELEME VE LIGHTBOX SİSTEMİ
        else if (document.querySelector('.page-galeri')) {
            const galleryTl = gsap.timeline();

            galleryTl.fromTo(".page-galeri .breadcrumb, .page-galeri .subpage-title, .page-galeri .subpage-desc",
                { y: 30, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
            );

            ScrollTrigger.batch(".gallery-grid-item", {
                onEnter: batch => gsap.fromTo(batch,
                    { y: 40, autoAlpha: 0, scale: 0.95 },
                    { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", overwrite: true }
                ),
                start: "top 85%"
            });

            const filterBtns = document.querySelectorAll('.filter-btn');
            const galleryItems = Array.from(document.querySelectorAll('.gallery-grid-item'));

            if (filterBtns.length > 0) {
                filterBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        filterBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');

                        const filterValue = btn.getAttribute('data-filter');

                        galleryItems.forEach(item => {
                            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                                item.style.display = 'block';
                                setTimeout(() => {
                                    item.style.opacity = '1';
                                    item.style.transform = 'scale(1)';
                                }, 50);
                            } else {
                                item.style.opacity = '0';
                                item.style.transform = 'scale(0.9)';
                                setTimeout(() => { item.style.display = 'none'; }, 300);
                            }
                        });

                        setTimeout(() => { ScrollTrigger.refresh(); }, 400);
                    });
                });
            }

            // LIGHTBOX OLUŞTURMA VE YÖNETİMİ
            document.getElementById('gallery-lightbox')?.remove();
            const lightbox = document.createElement('div');
            lightbox.id = 'gallery-lightbox';
            lightbox.className = 'gallery-lightbox';
            lightbox.innerHTML = `
                <div class="lb-counter">1 / 1</div>
                <button class="lb-btn lb-close" aria-label="Kapat">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <button class="lb-btn lb-prev" aria-label="Önceki Görsel">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <div class="lb-content">
                    <img src="" alt="Proje Görseli" class="lb-img">
                </div>
                <button class="lb-btn lb-next" aria-label="Sonraki Görsel">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            `;
            document.body.appendChild(lightbox);

            const lbImg = lightbox.querySelector('.lb-img');
            const lbCounter = lightbox.querySelector('.lb-counter');
            const btnClose = lightbox.querySelector('.lb-close');
            const btnPrev = lightbox.querySelector('.lb-prev');
            const btnNext = lightbox.querySelector('.lb-next');

            let visibleItems = [];
            let currentIndex = 0;

            const updateVisibleItems = () => {
                visibleItems = galleryItems.filter(item => item.style.display !== 'none');
            };

            const showImage = (index) => {
                if (visibleItems.length === 0) return;
                currentIndex = (index + visibleItems.length) % visibleItems.length;
                const targetImg = visibleItems[currentIndex].querySelector('img');
                if (!targetImg) return;

                lbImg.style.opacity = '0.3';
                setTimeout(() => {
                    lbImg.src = targetImg.src;
                    lbImg.alt = targetImg.alt || 'Balcı Cam Balkon Proje';
                    lbCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
                    lbImg.style.opacity = '1';
                }, 120);
            };

            const openLightbox = (clickedItem) => {
                updateVisibleItems();
                const idx = visibleItems.indexOf(clickedItem);
                if (idx === -1) return;
                currentIndex = idx;
                const targetImg = clickedItem.querySelector('img');
                if (targetImg) {
                    lbImg.src = targetImg.src;
                    lbImg.alt = targetImg.alt || '';
                    lbCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
                }
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            const closeLightbox = () => {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            };

            galleryItems.forEach(item => {
                item.addEventListener('click', () => openLightbox(item));
            });

            btnClose.addEventListener('click', closeLightbox);
            btnPrev.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
            btnNext.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox || e.target.classList.contains('lb-content')) {
                    closeLightbox();
                }
            });

            if (window.lbKeyHandler) window.removeEventListener('keydown', window.lbKeyHandler);
            window.lbKeyHandler = (e) => {
                if (!lightbox.classList.contains('active')) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') showImage(currentIndex + 1);
                if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
            };
            window.addEventListener('keydown', window.lbKeyHandler);

            let lbTouchStartX = 0;
            lightbox.addEventListener('touchstart', (e) => {
                lbTouchStartX = e.touches[0].clientX;
            }, { passive: true });

            lightbox.addEventListener('touchend', (e) => {
                const diffX = lbTouchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diffX) > 45) {
                    if (diffX > 0) showImage(currentIndex + 1);
                    else showImage(currentIndex - 1);
                }
            }, { passive: true });
        }

        // HAKKIMIZDA SAYFASI (DARK MODE KESİN ÇÖZÜMÜ)
        else if (document.querySelector('.page-hakkimizda') || document.querySelector('.about-vision-section') || window.location.href.toLowerCase().includes('hakkimizda')) {

            document.body.classList.add('page-about');
            document.body.classList.remove('dark-mode');

            if (document.querySelector('.hero-anim')) {
                const drawLines = document.querySelectorAll('.draw-line');
                drawLines.forEach(line => {
                    const length = line.getTotalLength ? line.getTotalLength() : 2000;
                    line.style.strokeDasharray = length;
                    line.style.strokeDashoffset = length;
                });
                const masterTl = gsap.timeline();
                masterTl.fromTo(".hero-anim", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2 })
                    .to(".draw-line", { strokeDashoffset: 0, duration: 2, stagger: 0.1, ease: "power2.inOut" }, "-=0.5")
                    .to(".cad-text", { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "-=0.5")
                    .to(".hero-line", { width: 60, duration: 0.8, ease: "power2.out" }, "-=0.5");
            }

            if (document.querySelector('.about-stats-section')) {
                gsap.fromTo(".stat-reveal", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".about-stats-section", start: "top 85%" } });
                const statNumbers = document.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    const suffix = stat.getAttribute('data-suffix') || '';
                    let counter = { val: 0 };
                    gsap.to(counter, { val: target, duration: 2.5, ease: "power3.out", scrollTrigger: { trigger: ".about-stats-section", start: "top 85%" }, onUpdate: function () { stat.innerHTML = Math.ceil(counter.val) + suffix; } });
                });
            }

            if (document.querySelector('.about-cert-section')) {
                gsap.fromTo(".cert-reveal", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: ".about-cert-section", start: "top 85%" } });
            }

            if (document.querySelector('.about-vision-section')) {
                const setDarkMode = (active) => {
                    if (active) {
                        document.body.classList.add('page-about', 'dark-mode');
                    } else {
                        document.body.classList.remove('dark-mode');
                    }
                };

                ScrollTrigger.create({
                    trigger: ".about-vision-section",
                    start: "top 55%",
                    endTrigger: ".about-insta-section",
                    end: "top 75%",
                    toggleClass: { targets: document.body, className: "dark-mode" },
                    onEnter: () => setDarkMode(true),
                    onLeave: () => setDarkMode(false),
                    onEnterBack: () => setDarkMode(true),
                    onLeaveBack: () => setDarkMode(false),
                    invalidateOnRefresh: true
                });

                gsap.fromTo(".vision-reveal", { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: ".about-vision-section", start: "top 75%" } });

                setTimeout(() => { ScrollTrigger.refresh(); }, 250);
            }

            if (document.querySelector('.about-insta-section')) {
                const btnHayir = document.getElementById('insta-btn-hayir');
                if (btnHayir) {
                    let currentX = 0; let currentY = 0;
                    const runAway = () => {
                        const isMobile = window.innerWidth <= 768;
                        const minX = isMobile ? 60 : 150; const maxX = isMobile ? 100 : 280;
                        const minY = isMobile ? 50 : 60; const maxY = isMobile ? 80 : 100;
                        let randomX, randomY; let attempts = 0;
                        do {
                            const dirX = Math.random() < 0.5 ? -1 : 1; const dirY = Math.random() < 0.5 ? -1 : 1;
                            randomX = dirX * (Math.random() * (maxX - minX) + minX);
                            randomY = dirY * (Math.random() * (maxY - minY) + minY);
                            attempts++;
                        } while (Math.abs(randomX - currentX) < (isMobile ? 50 : 120) && Math.abs(randomY - currentY) < (isMobile ? 40 : 70) && attempts < 10);
                        currentX = randomX; currentY = randomY;
                        gsap.to(btnHayir, { x: randomX, y: randomY, duration: 0.15, ease: "power4.out", overwrite: "auto" });
                    };
                    btnHayir.addEventListener('mouseenter', runAway);
                    btnHayir.addEventListener('touchstart', (e) => { e.preventDefault(); runAway(); }, { passive: false });
                }
            }

            if (document.querySelector('.about-services-section')) {
                gsap.fromTo(".service-reveal", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: ".about-services-section", start: "top 85%" } });
            }

            if (document.querySelector('.about-locations-section')) {
                gsap.fromTo(".loc-reveal", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: ".about-locations-section", start: "top 80%" } });
                const mapLines = document.querySelectorAll('.map-line');
                mapLines.forEach(line => {
                    const length = line.getTotalLength ? line.getTotalLength() : 500;
                    line.style.strokeDasharray = length;
                    line.style.strokeDashoffset = length;
                    gsap.to(line, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut", scrollTrigger: { trigger: ".locations-map", start: "top 85%" } });
                });
            }

            if (document.querySelector('.about-faq-section')) {
                gsap.fromTo(".faq-reveal", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: ".about-faq-section", start: "top 85%" } });
                const faqQuestions = document.querySelectorAll('.about-faq-section .faq-question');
                faqQuestions.forEach(question => {
                    question.addEventListener('click', () => {
                        const currentItem = question.closest('.faq-item');
                        const currentAnswer = currentItem.querySelector('.faq-answer');
                        const isActive = currentItem.classList.contains('active');
                        document.querySelectorAll('.about-faq-section .faq-item').forEach(item => {
                            item.classList.remove('active');
                            item.querySelector('.faq-answer').style.maxHeight = null;
                        });
                        if (!isActive) {
                            currentItem.classList.add('active');
                            currentAnswer.style.maxHeight = currentAnswer.scrollHeight + "px";
                        }
                    });
                });
            }

            if (document.querySelector('.about-cta-section') || document.querySelector('.about-cta-final')) {
                gsap.fromTo(".cta-reveal", { y: 50, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".about-cta-section, .about-cta-final", start: "top 85%" } });
            }
        }

        // ==========================================
        // ORTAK BÖLÜM ANİMASYONLARI
        // ==========================================
        if (document.getElementById('neden')) {
            const psTl = gsap.timeline({ scrollTrigger: { trigger: "#neden", start: "top 75%", defaults: { ease: "power4.out" } } });
            gsap.set(".ps-img", { scale: 1.2 });
            gsap.set(".ps-content > *", { y: 30, opacity: 0, filter: "blur(5px)" });
            gsap.set(".tech-hotspot", { scale: 0, opacity: 0 });

            psTl.to(".ps-reveal-mask", { width: "0%", duration: 1.4, ease: "expo.inOut" })
                .to(".ps-img", { scale: 1, duration: 1.8, ease: "power3.out" }, "-=1.1")
                .to(".ps-content > *", { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.1 }, "-=1.2")
                .to(".tech-hotspot", { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" }, "-=0.5");

            const hotspots = document.querySelectorAll('.tech-hotspot');
            hotspots.forEach(hotspot => {
                hotspot.addEventListener('click', (e) => {
                    hotspots.forEach(h => { if (h !== hotspot) h.classList.remove('active') });
                    hotspot.classList.toggle('active');
                    e.stopPropagation();
                });
            });
            document.addEventListener('click', () => { hotspots.forEach(h => h.classList.remove('active')); });
        }

        const subFaqItems = document.querySelectorAll('.sub-faq-item');
        if (subFaqItems.length > 0) {
            subFaqItems.forEach(item => {
                const btn = item.querySelector('.sub-faq-question');
                const ans = item.querySelector('.sub-faq-answer');
                btn.onclick = () => {
                    const isAlreadyActive = item.classList.contains('active');
                    subFaqItems.forEach(el => {
                        el.classList.remove('active');
                        el.querySelector('.sub-faq-answer').style.maxHeight = null;
                    });
                    if (!isAlreadyActive) {
                        item.classList.add('active');
                        ans.style.maxHeight = ans.scrollHeight + "px";
                    }
                };
            });
        }

        const gPanels = document.querySelectorAll('.g-panel');
        if (gPanels.length > 0) {
            gPanels.forEach(panel => {
                panel.addEventListener('mouseenter', () => {
                    if (window.innerWidth > 768) {
                        gPanels.forEach(p => p.classList.remove('active'));
                        panel.classList.add('active');
                    }
                });
                panel.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        gPanels.forEach(p => p.classList.remove('active'));
                        panel.classList.add('active');
                    }
                });
            });
        }

        if (document.getElementById('surdurulebilirlik')) {
            const ecoTl = gsap.timeline({ scrollTrigger: { trigger: "#surdurulebilirlik", start: "top 80%", defaults: { ease: "power3.out" } } });
            gsap.set(".eco-card", { y: 40, opacity: 0 });
            ecoTl.from(".eco-header > *", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 })
                .to(".eco-card", { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }, "-=0.4");
        }

        const subStickyBar = document.querySelector('#spa-container .sticky-next-bar') || document.querySelector('#page-content .sticky-next-bar');
        if (subStickyBar && typeof isSubpageLoaded !== 'undefined' && isSubpageLoaded) {
            subStickyBar.classList.remove('is-visible');
            const triggerElement = document.querySelector('.cb-gallery-section') || document.querySelector('.architectural-draw') || document.querySelector('.site-footer') || document.body;
            if (triggerElement) {
                ScrollTrigger.create({
                    trigger: triggerElement,
                    start: "top 70%",
                    onEnter: () => subStickyBar.classList.add('is-visible'),
                    onLeaveBack: () => subStickyBar.classList.remove('is-visible')
                });
            }
        }

        document.querySelectorAll('body > .z-bar-wrapper').forEach(bar => bar.remove());
        const zNextBar = document.querySelector('#page-content .z-bar-wrapper') || document.querySelector('#spa-container .z-bar-wrapper');

        if (zNextBar) {
            document.body.appendChild(zNextBar);
            zNextBar.classList.remove('is-visible');

            const triggerElement = document.querySelector('.gallery-section');
            if (triggerElement) {
                ScrollTrigger.create({
                    trigger: triggerElement,
                    start: "top 60%",
                    onEnter: () => zNextBar.classList.add('is-visible'),
                    onLeaveBack: () => zNextBar.classList.remove('is-visible')
                });
            }
        }
    }

    // =========================================================================
    // EVRENSEL KÖK DİZİN VE SPA YÖNLENDİRME MOTORU
    // =========================================================================

    function getRootUrl() {
        let path = window.location.pathname;
        const subpageFolders = ['/pimapen', '/cambalkon', '/aluminyum-dograma', '/aluminyum', '/panjur', '/giyotin', '/galeri', '/iletisim', '/hakkimizda', '/policies'];
        for (const folder of subpageFolders) {
            const idx = path.toLowerCase().indexOf(folder);
            if (idx !== -1) {
                path = path.substring(0, idx);
                break;
            }
        }
        path = path.replace(/\/index\.html$/i, '');
        if (!path.endsWith('/')) path += '/';
        return window.location.origin + path;
    }

    function resolveTargetUrl(rawHref) {
        if (!rawHref) return null;
        const root = getRootUrl();
        const lower = rawHref.toLowerCase().trim();

        if (lower.includes('pimapen')) return { url: root + 'pimapen/index.html', isSubpage: true };
        if (lower.includes('cambalkon')) return { url: root + 'cambalkon/index.html', isSubpage: true };
        if (lower.includes('aluminyum')) return { url: root + 'aluminyum-dograma/index.html', isSubpage: true };
        if (lower.includes('giyotin')) return { url: root + 'giyotin/index.html', isSubpage: true };
        if (lower.includes('panjur')) return { url: root + 'panjur/index.html', isSubpage: true };
        if (lower.includes('hakkimizda')) return { url: root + 'hakkimizda/index.html', isSubpage: true };
        if (lower.includes('galeri') || lower.includes('projeler')) return { url: root + 'galeri/index.html', isSubpage: true };
        if (lower.includes('iletisim') && !lower.startsWith('#')) return { url: root + 'iletisim/index.html', isSubpage: true };

        let hash = '';
        if (rawHref.includes('#')) {
            hash = '#' + rawHref.split('#')[1];
        }
        return { url: root + 'index.html' + hash, isSubpage: false, hash: hash };
    }

    // İLK YÜKLEMEDE ANA SAYFA YA DA ALT SAYFAYI ATEŞLE
    if (isSubpageLoaded) {
        initSubPageAnimations();
    } else {
        initMainPageAnimations();
    }

    const loadNextPage = async (url, title, isBackwards = false, isPopState = false) => {
        if (isTransitioning || !url) return;

        const currentClean = window.location.href.split('#')[0].replace(/\/$/, '/index.html');
        const targetClean = url.split('#')[0].replace(/\/$/, '/index.html');
        if (!isPopState && currentClean === targetClean) return;

        // Açık kalan Lightbox varsa kapat
        document.getElementById('gallery-lightbox')?.classList.remove('active');
        document.body.style.overflow = '';

        if (!isPopState) {
            navHistoryStack.push({
                url: window.location.href,
                title: document.title,
                isSubpage: isSubpageLoaded
            });
        }

        document.body.classList.remove('dark-mode', 'page-about');

        isTransitioning = true;
        isTransitionCooldown = true;
        lastScrollY = window.scrollY;

        try {
            const anyActiveSticky = document.querySelector('.sticky-next-bar.is-visible, .z-bar-wrapper.is-visible');
            if (anyActiveSticky) anyActiveSticky.classList.remove('is-visible');

            if (typeof gsap !== 'undefined') gsap.set('.overlay-accent, .overlay-dark', { scaleY: 0, transformOrigin: 'bottom' });

            overlay.style.display = 'block';

            if (typeof gsap !== 'undefined') {
                const tlCover = gsap.timeline();
                tlCover.to('.overlay-accent', { scaleY: 1, duration: 0.6, ease: 'expo.inOut', transformOrigin: 'bottom' })
                    .to('.overlay-dark', { scaleY: 1, duration: 0.6, ease: 'expo.inOut', transformOrigin: 'bottom' }, "-=0.45")
                    .fromTo('.transition-content', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
                await tlCover;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("Sayfa yüklenemedi: " + url);

            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const fetchedTitle = doc.querySelector('title') ? doc.querySelector('title').innerText : title;
            document.title = fetchedTitle;

            // Arka planda index.html dosyasını çeker ama adres çubuğunda temiz URL (/galeri/ vb.) gösterir
            const cleanDisplayUrl = url.replace(/\/index\.html$/i, '/');
            if (!isPopState) {
                window.history.pushState({ path: url, title: fetchedTitle, isSubpage: true }, '', cleanDisplayUrl);
            }

            const newStyles = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
            const currentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.href);

            const cssLoadPromises = newStyles.map(link => {
                const absoluteHref = new URL(link.getAttribute('href'), response.url).href;
                if (!currentStyles.includes(absoluteHref)) {
                    return new Promise((resolve) => {
                        const newLink = document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.href = absoluteHref;
                        newLink.onload = resolve;
                        newLink.onerror = resolve;
                        document.head.appendChild(newLink);
                    });
                }
                return Promise.resolve();
            });

            await Promise.all(cssLoadPromises);

            document.querySelectorAll('script[data-spa-script="true"]').forEach(s => s.remove());
            const newScripts = Array.from(doc.querySelectorAll('script[src]'));
            const currentScripts = Array.from(document.querySelectorAll('script[src]:not([data-spa-script="true"])')).map(script => script.src);

            for (const oldScript of newScripts) {
                const absoluteSrc = new URL(oldScript.getAttribute('src'), response.url).href;
                if (!currentScripts.includes(absoluteSrc)) {
                    try {
                        const scriptRes = await fetch(absoluteSrc);
                        const scriptText = await scriptRes.text();
                        const inlineScript = document.createElement('script');
                        inlineScript.textContent = scriptText;
                        inlineScript.setAttribute('data-spa-script', 'true');
                        document.body.appendChild(inlineScript);
                    } catch (e) {
                        console.error("Alt sayfa scripti çalıştırılamadı:", absoluteSrc, e);
                    }
                }
            }

            let newContent = doc.getElementById('page-content');
            if (!newContent) {
                const tempDiv = document.createElement('div');
                Array.from(doc.body.children).forEach(el => {
                    const tag = el.tagName.toLowerCase();
                    if (tag !== 'header' && tag !== 'footer' && !el.classList.contains('site-header') && !el.classList.contains('site-footer') && tag !== 'script' && !el.classList.contains('page-transition-overlay') && !el.classList.contains('floating-whatsapp') && el.id !== 'spa-container') {
                        tempDiv.appendChild(el.cloneNode(true));
                    }
                });
                newContent = tempDiv;
            } else {
                newContent.querySelectorAll('.site-footer, .site-header').forEach(el => el.remove());
            }

            if (newContent) {
                // Alt sayfalardaki göreceli görsel yollarını (örn: galeri/img/...) kırılmaması için tam adrese çevir
                newContent.querySelectorAll('img[src]').forEach(img => {
                    const rawSrc = img.getAttribute('src');
                    if (rawSrc && !rawSrc.startsWith('http') && !rawSrc.startsWith('data:')) {
                        img.setAttribute('src', new URL(rawSrc, response.url).href);
                    }
                });

                const hasMainShell = document.querySelector('.hero-section') !== null;
                const spaCont = document.getElementById('spa-container');
                const pageCont = document.getElementById('page-content');

                if (hasMainShell && spaCont) {
                    document.querySelectorAll(mainPageElementsSelector).forEach(el => el.style.display = 'none');
                    if (pageCont && pageCont !== spaCont) pageCont.remove();
                    spaCont.innerHTML = newContent.innerHTML;
                } else if (pageCont) {
                    pageCont.innerHTML = newContent.innerHTML;
                } else if (spaCont) {
                    spaCont.innerHTML = newContent.innerHTML;
                }
            }

            if (isBackwards) setTimeout(() => { window.scrollTo(0, document.body.scrollHeight); }, 50);
            else window.scrollTo(0, 0);

            updateNavbar();

            if (typeof gsap !== 'undefined') {
                const tlReveal = gsap.timeline();
                tlReveal.to('.transition-content', { opacity: 0, duration: 0.3 })
                    .to('.overlay-dark', { yPercent: -100, duration: 0.6, ease: 'expo.inOut' })
                    .to('.overlay-accent', { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, "-=0.45")
                    .call(() => {
                        overlay.style.display = 'none';
                        gsap.set('.overlay-accent, .overlay-dark', { scaleY: 0, yPercent: 0, transformOrigin: 'bottom' });

                        isSubpageLoaded = true;
                        setTimeout(() => {
                            initSubPageAnimations();
                            ScrollTrigger.refresh();
                        }, 50);

                        isTransitioning = false;
                        setTimeout(() => { isTransitionCooldown = false; }, 1500);
                    });
            } else {
                overlay.style.display = 'none';
                isSubpageLoaded = true;
                isTransitioning = false;
                isTransitionCooldown = false;
            }

        } catch (error) {
            console.error("Geçiş Hatası Yakalandı:", error);
            if (typeof gsap !== 'undefined') {
                gsap.to('.overlay-dark, .overlay-accent', {
                    yPercent: -100, duration: 0.6, ease: 'expo.inOut', onComplete: () => {
                        if (overlay) overlay.style.display = 'none';
                        gsap.set('.overlay-accent, .overlay-dark', { scaleY: 0, yPercent: 0 });
                        isTransitioning = false;
                        isTransitionCooldown = false;
                    }
                });
            } else {
                if (overlay) overlay.style.display = 'none';
                isTransitioning = false;
                isTransitionCooldown = false;
            }
        }
    };

    const goBackToMain = async (targetId = null, mainUrlOverride = null, isPopState = false) => {
        if (isTransitioning) return;

        document.getElementById('gallery-lightbox')?.classList.remove('active');
        document.body.style.overflow = '';

        document.body.classList.remove('dark-mode', 'page-about');
        document.title = "Balcı Cam Balkon | İzmir";

        const rootMainUrl = getRootUrl() + 'index.html';
        const cleanMainUrl = getRootUrl() + (targetId ? targetId : '');

        if (!document.querySelector('.hero-section')) {
            if (typeof gsap !== 'undefined') {
                gsap.set('.overlay-accent, .overlay-dark', { scaleY: 0, transformOrigin: 'bottom' });
                overlay.style.display = 'block';
                const tlCover = gsap.timeline();
                tlCover.to('.overlay-accent', { scaleY: 1, duration: 0.6, ease: 'expo.inOut', transformOrigin: 'bottom' })
                    .to('.overlay-dark', { scaleY: 1, duration: 0.6, ease: 'expo.inOut', transformOrigin: 'bottom' }, "-=0.45")
                    .call(() => {
                        window.location.href = cleanMainUrl;
                    });
            } else {
                window.location.href = cleanMainUrl;
            }
            return;
        }

        isTransitioning = true;
        isTransitionCooldown = true;

        try {
            overlay.style.display = 'block';

            if (typeof gsap !== 'undefined') {
                const tlCover = gsap.timeline();
                tlCover.to('.overlay-accent', { scaleY: 1, duration: 0.6, ease: 'expo.inOut', transformOrigin: 'bottom' })
                    .to('.overlay-dark', { scaleY: 1, duration: 0.6, ease: 'expo.inOut', transformOrigin: 'bottom' }, "-=0.45")
                    .fromTo('.transition-content', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
                await tlCover;
            }

            document.querySelectorAll(mainPageElementsSelector).forEach(el => el.style.display = '');
            if (spaContainer) spaContainer.innerHTML = '';

            const oldContent = document.getElementById('page-content');
            if (oldContent && oldContent !== spaContainer) {
                oldContent.remove();
            }

            document.querySelectorAll('body > .z-bar-wrapper').forEach(bar => bar.remove());

            if (!isPopState) {
                window.history.pushState({ path: rootMainUrl, title: 'Ana Sayfa', isSubpage: false }, '', cleanMainUrl);
            }
            updateNavbar();

            if (targetId) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) window.scrollTo(0, targetEl.offsetTop - 100);
            } else if (lastScrollY > 0) {
                window.scrollTo(0, lastScrollY);
            } else {
                window.scrollTo(0, 0);
            }

            if (typeof gsap !== 'undefined') {
                const tlReveal = gsap.timeline();
                tlReveal.to('.transition-content', { opacity: 0, duration: 0.3 })
                    .to('.overlay-dark', { yPercent: 100, duration: 0.6, ease: 'expo.inOut' })
                    .to('.overlay-accent', { yPercent: 100, duration: 0.6, ease: 'expo.inOut' }, "-=0.45")
                    .call(() => {
                        overlay.style.display = 'none';
                        gsap.set('.overlay-accent, .overlay-dark', { scaleY: 0, yPercent: 0 });
                        isSubpageLoaded = false;

                        setTimeout(() => {
                            initMainPageAnimations();
                            ScrollTrigger.refresh();
                        }, 50);

                        isTransitioning = false;
                        setTimeout(() => { isTransitionCooldown = false; }, 1500);
                    });
            } else {
                overlay.style.display = 'none';
                isSubpageLoaded = false;
                isTransitioning = false;
                isTransitionCooldown = false;
            }

        } catch (error) {
            isTransitioning = false;
            isTransitionCooldown = false;
        }
    };

    const navigateUp = () => {
        if (isTransitioning) return;
        const currentUrl = window.location.href.toLowerCase();
        const root = getRootUrl();

        if (currentUrl.includes('aluminyum')) {
            loadNextPage(root + 'pimapen/index.html', 'Pimapen Sistemleri', true);
        } else if (currentUrl.includes('pimapen')) {
            loadNextPage(root + 'cambalkon/index.html', 'Cam Balkon Sistemleri', true);
        } else if (navHistoryStack.length > 0) {
            const prevPage = navHistoryStack.pop();
            if (prevPage && prevPage.isSubpage) {
                loadNextPage(prevPage.url, prevPage.title, true);
            } else {
                goBackToMain(null, root + 'index.html');
            }
        } else {
            goBackToMain(null, root + 'index.html');
        }
    };

    // TÜM LİNK TIKLAMALARINI YAKALAYAN MERKEZİ DENETLEYİCİ
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href').trim();
        if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;

        // NO-SPA VE POLICIES İSTİSNALARI
        if (link.classList.contains('lang-mobile') || link.classList.contains('lang-desktop') || link.classList.contains('no-spa') || href.includes('policies')) return;
        if (link.getAttribute('target') === '_blank') return;

        // Sadece # ile başlayan sayfa içi veya ana sayfa bölüm linkleri
        if (href.startsWith('#')) {
            if (href === '#') return;
            e.preventDefault();

            if (isSubpageLoaded && (href === '#hizmetler' || href === '#anasayfa' || href === '#biz-kimiz')) {
                goBackToMain(href === '#anasayfa' ? null : href);
                return;
            }

            const targetEl = document.querySelector(href);
            if (targetEl) {
                if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
                    gsap.to(window, { duration: 1, scrollTo: { y: targetEl, offsetY: 100 }, ease: "power3.inOut" });
                } else {
                    window.scrollTo({ top: targetEl.offsetTop - 100, behavior: 'smooth' });
                }
            } else if (isSubpageLoaded) {
                goBackToMain(href);
            }
            return;
        }

        e.preventDefault();

        const resolved = resolveTargetUrl(href);
        if (!resolved) return;

        if (!resolved.isSubpage) {
            goBackToMain(resolved.hash || null, resolved.url);
        } else {
            const title = link.querySelector('.next-title') ? link.querySelector('.next-title').innerText : (link.querySelector('h3') ? link.querySelector('h3').innerText : 'Detaylar');
            loadNextPage(resolved.url, title, false, false);
        }
    });

    let wheelTimeout;
    window.addEventListener('wheel', (e) => {
        if (isTransitioning || isTransitionCooldown || Math.abs(e.deltaY) < 40) return;
        if (document.getElementById('gallery-lightbox')?.classList.contains('active')) return;

        if (wheelTimeout) clearTimeout(wheelTimeout);

        wheelTimeout = setTimeout(() => {
            if (isSubpageLoaded && window.scrollY <= 50 && e.deltaY <= -40) {
                navigateUp();
            }

            if (e.deltaY >= 40) {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 150) {
                    let activeSticky = isSubpageLoaded ? (document.querySelector('#spa-container .sticky-next-bar') || document.querySelector('#page-content .sticky-next-bar') || document.querySelector('body > .z-bar-wrapper')) : document.querySelector('.sticky-next-bar:not(#spa-container .sticky-next-bar):not(#page-content .sticky-next-bar)');
                    if (activeSticky) {
                        const resolved = resolveTargetUrl(activeSticky.getAttribute('href'));
                        if (resolved && resolved.isSubpage) {
                            const title = activeSticky.querySelector('.next-title') ? activeSticky.querySelector('.next-title').innerText : (activeSticky.querySelector('h3') ? activeSticky.querySelector('h3').innerText : "Detaylar");
                            loadNextPage(resolved.url, title, false, false);
                        }
                    }
                }
            }
        }, 50);
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY, { passive: true });

    let touchTimeout;
    window.addEventListener('touchend', e => {
        if (document.getElementById('gallery-lightbox')?.classList.contains('active')) return;

        let touchEndY = e.changedTouches[0].clientY;
        let deltaY = touchStartY - touchEndY;

        if (isTransitioning || isTransitionCooldown || Math.abs(deltaY) < 50) return;

        if (touchTimeout) clearTimeout(touchTimeout);

        touchTimeout = setTimeout(() => {
            if (isSubpageLoaded && window.scrollY <= 50 && deltaY <= -50) navigateUp();

            if (deltaY >= 50) {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 150) {
                    let activeSticky = isSubpageLoaded ? (document.querySelector('#spa-container .sticky-next-bar') || document.querySelector('#page-content .sticky-next-bar') || document.querySelector('body > .z-bar-wrapper')) : document.querySelector('.sticky-next-bar:not(#spa-container .sticky-next-bar):not(#page-content .sticky-next-bar)');
                    if (activeSticky) {
                        const resolved = resolveTargetUrl(activeSticky.getAttribute('href'));
                        if (resolved && resolved.isSubpage) {
                            const title = activeSticky.querySelector('.next-title') ? activeSticky.querySelector('.next-title').innerText : (activeSticky.querySelector('h3') ? activeSticky.querySelector('h3').innerText : "Detaylar");
                            loadNextPage(resolved.url, title, false, false);
                        }
                    }
                }
            }
        }, 50);
    }, { passive: true });

    // TARAYICI GERİ / İLERİ TUŞU YÖNETİCİSİ
    window.addEventListener('popstate', (e) => {
        const targetPath = (e.state && e.state.path) ? e.state.path : window.location.href;
        const resolved = resolveTargetUrl(targetPath);

        if ((e.state && e.state.isSubpage) || (resolved && resolved.isSubpage)) {
            const targetUrl = resolved ? resolved.url : targetPath;
            const targetTitle = (e.state && e.state.title) ? e.state.title : 'Detaylar';
            loadNextPage(targetUrl, targetTitle, false, true);
        } else {
            const hash = window.location.hash || null;
            goBackToMain(hash, resolved ? resolved.url : null, true);
        }
    });

});