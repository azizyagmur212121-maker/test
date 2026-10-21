// ==========================================
// İLETİŞİM SAYFASI ANİMASYONLARI
// ==========================================
if (document.querySelector('.page-iletisim')) {
    const contactTl = gsap.timeline();

    // Hero Yazıları
    contactTl.from(".page-iletisim .breadcrumb, .page-iletisim .subpage-title, .page-iletisim .subpage-desc", {
        y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out"
    });

    // Sol Taraf İletişim Kartları (Scroll tetiklemeli)
    gsap.from(".info-card, .contact-social", {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: ".contact-main-section", start: "top 80%" }
    });

    // Sağ Taraf Form (Scroll tetiklemeli)
    gsap.from(".balci-contact-form", {
        x: 40, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-main-section", start: "top 80%" }
    });

    // Harita üzerindeki yol tarifi kartı
    gsap.from(".map-overlay-card", {
        y: 50, opacity: 0, duration: 0.8, ease: "back.out(1.2)",
        scrollTrigger: { trigger: ".contact-map-section", start: "top 70%" }
    });

    // Form Gönderim Engellemesi (SPA'da sayfa yenilenmesin diye)
    const contactForm = document.getElementById('balciContactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Sayfanın F5 atmasını engeller
            const btn = contactForm.querySelector('.btn-submit');
            const originalText = btn.innerHTML;

            btn.innerHTML = 'Gönderiliyor...';
            btn.style.opacity = '0.7';

            // 1.5 saniye sonra sahte başarı mesajı gösterimi (Buraya PHP/AJAX eklenecek sonra)
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                contactForm.reset();
                document.getElementById('formSuccessMessage').style.display = 'block';

                setTimeout(() => {
                    document.getElementById('formSuccessMessage').style.display = 'none';
                }, 5000);
            }, 1500);
        });
    }
}