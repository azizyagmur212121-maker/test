document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    // ==========================================
    // 1. HERO ALANI ANİMASYONU
    // ==========================================
    const drawLines = document.querySelectorAll('.draw-line');
    drawLines.forEach(line => {
        const length = line.getTotalLength ? line.getTotalLength() : 2000;
        line.style.strokeDasharray = length;
        line.style.strokeDashoffset = length;
    });

    const masterTl = gsap.timeline();

    masterTl.from(".site-header", { y: -100, autoAlpha: 0, duration: 1, ease: "power3.out" })
        .from(".nav-container > a, .nav-item, .nav-actions button", { y: -15, autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: "power2.out" }, "-=0.5")
        .from(".hero-anim", { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "-=0.2")
        .to(".draw-line", { strokeDashoffset: 0, duration: 2, stagger: 0.1, ease: "power2.inOut" }, "-=0.5")
        .to(".cad-text", { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "-=0.5")
        .to(".hero-line", { width: 60, duration: 0.8, ease: "power2.out" }, "-=0.5");


    // ==========================================
    // 2. SAYAÇLAR
    // ==========================================
    if (document.querySelector('.about-stats-section')) {
        gsap.fromTo(".stat-reveal",
            { y: 40, autoAlpha: 0 },
            {
                y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power2.out",
                scrollTrigger: { trigger: ".about-stats-section", start: "top 85%" }
            }
        );

        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const suffix = stat.getAttribute('data-suffix');
            let counter = { val: 0 };

            gsap.to(counter, {
                val: target, duration: 2.5, ease: "power3.out",
                scrollTrigger: { trigger: ".about-stats-section", start: "top 85%" },
                onUpdate: function () { stat.innerHTML = Math.ceil(counter.val) + suffix; }
            });
        });
    }

    // ==========================================
    // 3. KALİTE VE SERTİFİKALAR
    // ==========================================
    if (document.querySelector('.about-cert-section')) {
        gsap.fromTo(".cert-reveal",
            { y: 40, autoAlpha: 0 },
            {
                y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power2.out",
                scrollTrigger: { trigger: ".about-cert-section", start: "top 85%" }
            }
        );
    }

    // ==========================================
    // 4. VİZYON VE MİSYON (KUSURSUZ DARK MODE ZONU)
    // ==========================================
    if (document.querySelector('.about-vision-section')) {

        // F5 ve SPA çakışmalarını kökünden çözen TEK VE AKILLI tetikleyici
        setTimeout(() => {
            ScrollTrigger.create({
                trigger: ".about-vision-section",
                start: "top 50%", // Vizyon bölümü %50'ye gelince karanlık başlar
                endTrigger: ".about-insta-section",
                end: "top 75%", // Sosyal medya bölümü %75'e gelince karanlık biter
                toggleClass: { targets: document.body, className: "dark-mode" }
            });
        }, 100);

        gsap.fromTo(".vision-reveal",
            { y: 50, autoAlpha: 0 },
            {
                y: 0, autoAlpha: 1, duration: 1, stagger: 0.2, ease: "power3.out",
                scrollTrigger: { trigger: ".about-vision-section", start: "top 75%" }
            }
        );
    }

    // ==========================================
    // 5. SOSYAL MEDYA (SADECE KAÇAN BUTON KALDI)
    // ==========================================
    if (document.querySelector('.about-insta-section')) {

        const btnHayir = document.getElementById('insta-btn-hayir');
        const actionArea = document.getElementById('insta-action-area');

        if (btnHayir && actionArea) {
            let currentX = 0;
            let currentY = 0;

            const runAway = () => {
                const isMobile = window.innerWidth <= 768;
                const minX = isMobile ? 60 : 150;
                const maxX = isMobile ? 100 : 280;
                const minY = isMobile ? 50 : 60;
                const maxY = isMobile ? 80 : 100;

                let randomX, randomY;
                let attempts = 0;

                do {
                    const dirX = Math.random() < 0.5 ? -1 : 1;
                    const dirY = Math.random() < 0.5 ? -1 : 1;
                    randomX = dirX * (Math.random() * (maxX - minX) + minX);
                    randomY = dirY * (Math.random() * (maxY - minY) + minY);
                    attempts++;
                } while (Math.abs(randomX - currentX) < (isMobile ? 50 : 120) && Math.abs(randomY - currentY) < (isMobile ? 40 : 70) && attempts < 10);

                currentX = randomX;
                currentY = randomY;

                gsap.to(btnHayir, {
                    x: randomX,
                    y: randomY,
                    duration: 0.15,
                    ease: "power4.out",
                    overwrite: "auto"
                });
            };

            btnHayir.addEventListener('mouseenter', runAway);
            btnHayir.addEventListener('touchstart', (e) => {
                e.preventDefault();
                runAway();
            }, { passive: false });
        }
    }

    // ==========================================
    // 6. SIKÇA SORULAN SORULAR (SCROLLHEIGHT METODU)
    // ==========================================
    if (document.querySelector('.about-faq-section')) {

        // Ekrana girerken yukarı doğru kayarak belirmesi
        gsap.fromTo(".faq-reveal",
            { y: 30, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: ".about-faq-section", start: "top 85%" } }
        );

        // Akordeon Tıklama Mantığı
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const currentItem = question.closest('.faq-item');
                const currentAnswer = currentItem.querySelector('.faq-answer');
                const isActive = currentItem.classList.contains('active');

                // Önce açık olan diğer tüm kutuları kapat
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = null;
                });

                // Eğer tıkladığımız zaten açık değilse, onu aç
                if (!isActive) {
                    currentItem.classList.add('active');
                    // scrollHeight, o div'in içindeki yazının tam yüksekliğini piksel olarak hesaplar
                    currentAnswer.style.maxHeight = currentAnswer.scrollHeight + "px";
                }
            });
        });
    }

    // ==========================================
    // 7. HİZMETLERİMİZ (BİLGİ KARTLARI) ANİMASYONU
    // ==========================================
    if (document.querySelector('.about-services-section')) {
        gsap.fromTo(".service-reveal",
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: ".about-services-section", start: "top 85%" } }
        );
    }

    // ==========================================
    // 8. BÖLGESEL SEO HARİTASI ANİMASYONU
    // ==========================================
    if (document.querySelector('.about-locations-section')) {

        // Metinlerin ve kutuların belirmesi
        gsap.fromTo(".loc-reveal",
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: ".about-locations-section", start: "top 80%" } }
        );

        // Haritadaki kesik çizgilerin lazer gibi çizilmesi
        const mapLines = document.querySelectorAll('.map-line');
        mapLines.forEach(line => {
            const length = line.getTotalLength ? line.getTotalLength() : 500;
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;

            gsap.to(line, {
                strokeDashoffset: 0,
                duration: 2,
                ease: "power2.inOut",
                scrollTrigger: { trigger: ".locations-map", start: "top 85%" }
            });
        });
    }

    // ==========================================
    // 9. FİNAL CTA (SATIŞ KAPATMA) ANİMASYONU
    // ==========================================
    if (document.querySelector('.about-cta-section')) {
        gsap.fromTo(".cta-reveal",
            { y: 50, autoAlpha: 0, scale: 0.95 },
            { y: 0, autoAlpha: 1, scale: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".about-cta-section", start: "top 85%" } }
        );
    }

});