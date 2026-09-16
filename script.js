/**
 * PAOLA GUEDES — ESTÉTICA AVANÇADA
 * script.js · v1.2 (corrigido)
 *
 * Arquitetura: Módulos IIFE isolados, zero dependências externas.
 * Performance: rAF para animações, pointer events unificados,
 * IntersectionObserver para scroll, passive listeners onde possível.
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   UTILITÁRIOS GLOBAIS
───────────────────────────────────────────────────────────── */

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);


/* ─────────────────────────────────────────────────────────────
   1. NAVBAR INTELIGENTE — SMART SCROLL
───────────────────────────────────────────────────────────── */
const initSmartNav = () => {
    const header = document.querySelector('.site-header');
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-menu .btn');

    if (!header) return;

    let lastScrollY = 0;
    let ticking = false;
    const SCROLL_THRESHOLD = 80;

    const updateNav = () => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;
        const isAtTop = currentScrollY < SCROLL_THRESHOLD;

        header.classList.toggle('scrolled', !isAtTop);

        if (!isAtTop) {
            if (scrollingDown) {
                header.style.transform = 'translateY(-100%)';
                header.style.transition = 'transform 0.4s cubic-bezier(0.7, 0, 0.84, 0)';
            } else {
                header.style.transform = 'translateY(0)';
                header.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    }, { passive: true });

    const openMenu = () => {
        mobileMenu.hidden = false;
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';

        const lines = hamburger.querySelectorAll('.hamburger-line');
        lines[0].style.transform = 'translateY(6px) rotate(45deg)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'translateY(-6px) rotate(-45deg)';
    };

    const closeMenu = () => {
        mobileMenu.hidden = true;
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';

        const lines = hamburger.querySelectorAll('.hamburger-line');
        lines[0].style.transform = '';
        lines[1].style.opacity = '';
        lines[2].style.transform = '';
    };

    hamburger?.addEventListener('click', () => {
        const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
        isOpen ? closeMenu() : openMenu();
    });

    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
};


/* ─────────────────────────────────────────────────────────────
   2. SECTION ZOOM REVEAL — IntersectionObserver
───────────────────────────────────────────────────────────── */
const initSectionReveal = () => {
    const sections = document.querySelectorAll('.premium-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.05,
        }
    );

    sections.forEach(section => observer.observe(section));
};


/* ─────────────────────────────────────────────────────────────
   3. TEXT REVEAL CINEMATOGRÁFICO
───────────────────────────────────────────────────────────── */
const initTextReveal = () => {
    const targets = document.querySelectorAll([
        '.hero-heading',
        '.hero-subheading',
        '.hero-signature',
        '.section-title',
        '.section-label',
        '.section-subtitle',
        '.why-intro',
        '.why-detail',
        '.about-bio',
        '.about-subtitle',
        '.booking-description',
        '.booking-trust-item',
        '.testimonial-text',
        '.differential-card-title',
        '.treatments-description',
    ].join(', '));

    const maskStyle = document.createElement('style');
    maskStyle.textContent = `
    .reveal-mask {
      overflow: hidden;
      display: block;
    }
    .reveal-inner {
      display: block;
      transform: translateY(60px);
      opacity: 0;
      transition:
        transform 0.85s cubic-bezier(0.16, 1, 0.3, 1),
        opacity 0.85s ease;
      will-change: transform, opacity;
    }
    .reveal-inner.revealed {
      transform: translateY(0);
      opacity: 1;
    }
    @media (prefers-reduced-motion: reduce) {
      .reveal-inner {
        transform: none;
        opacity: 1;
        transition: none;
      }
    }
  `;
    document.head.appendChild(maskStyle);

    targets.forEach((el) => {
        const siblings = el.parentElement?.querySelectorAll('[data-reveal-index]') || [];
        el.setAttribute('data-reveal-index', siblings.length);

        const mask = document.createElement('span');
        const inner = document.createElement('span');

        mask.className = 'reveal-mask';
        inner.className = 'reveal-inner';

        const delay = (parseInt(el.getAttribute('data-reveal-index') || 0) % 4) * 80;
        inner.style.transitionDelay = `${delay}ms`;

        el.parentNode.insertBefore(mask, el);
        inner.appendChild(el);
        mask.appendChild(inner);
    });

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            rootMargin: '0px 0px -5% 0px',
            threshold: 0.1,
        }
    );

    document.querySelectorAll('.reveal-inner').forEach(el => {
        revealObserver.observe(el);
    });
};


/* ─────────────────────────────────────────────────────────────
   4. INFINITE CAROUSEL — Autoplay + Drag (Pointer Events)
───────────────────────────────────────────────────────────── */
const initInfiniteCarousel = () => {
    const slider = document.querySelector('.infinite-carousel-slider');
    if (!slider) return;

    const originalItems = Array.from(slider.children);
    originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        slider.appendChild(clone);
    });

    let isDragging = false;
    let startX = 0;
    let currentOffset = 0;
    let animOffset = 0;
    let rafId = null;

    const getCurrentTranslateX = () => {
        const style = window.getComputedStyle(slider);
        const matrix = new DOMMatrix(style.transform);
        return matrix.m41;
    };

    const pauseAutoplay = () => {
        const currentX = getCurrentTranslateX();
        slider.style.animationPlayState = 'paused';
        slider.style.transform = `translateX(${currentX}px)`;
        slider.style.animation = 'none';
        currentOffset = currentX;
        animOffset = currentX;
        slider.classList.add('is-grabbing');
    };

    const resumeAutoplay = () => {
        slider.classList.remove('is-grabbing');
        setTimeout(() => {
            if (isDragging) return;
            slider.style.transform = '';
            slider.style.animation = '';
            slider.style.animationPlayState = 'running';
        }, 1200);
    };

    const dragLoop = () => {
        if (!isDragging) return;
        animOffset = lerp(animOffset, currentOffset, 0.12);
        slider.style.transform = `translateX(${animOffset}px)`;
        rafId = requestAnimationFrame(dragLoop);
    };

    slider.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX;
        pauseAutoplay();
        slider.setPointerCapture(e.pointerId);
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(dragLoop);
    });

    slider.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const delta = e.clientX - startX;
        currentOffset = animOffset + delta;
    });

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(rafId);
        resumeAutoplay();
    };

    slider.addEventListener('pointerup', endDrag);
    slider.addEventListener('pointercancel', endDrag);
    slider.addEventListener('dragstart', (e) => e.preventDefault());
};


/* ─────────────────────────────────────────────────────────────
   5. IMAGE COMPARISON SLIDER — Antes & Depois
   ✦ CORREÇÕES APLICADAS v1.2:
     - Largura da .img-after img agora é calculada em px via JS,
       relativa ao container externo — resolve o "sumiço" da imagem
       depois quando a div pai encolhe
     - ResizeObserver atualiza a largura-base ao redimensionar a janela
     - Touch events adicionados (touchstart/move/end) para mobile
     - Removido o lerp/smoothLoop do drag: movimento agora é direto
       (sem delay), mais responsivo e profissional
     - Hint animation corrigida para não travar se o usuário
       interagir antes do timeout
     - setPointerCapture dentro de try/catch (evita erro em alguns
       browsers mobile)
───────────────────────────────────────────────────────────── */
const initComparisonSliders = () => {
    const sliders = document.querySelectorAll('.image-comparison-slider');
    if (!sliders.length) return;

    sliders.forEach(container => {
        const imgAfter     = container.querySelector('.img-after');
        const afterImg     = imgAfter?.querySelector('img');
        const handle       = container.querySelector('.slider-handle');
        if (!imgAfter || !handle) return;

        let isActive   = false;
        let hintActive = false;
        let hintRaf    = null;

        /* ── Calcula a largura total do container e atualiza a imagem ── */
        const updateAfterImgWidth = () => {
            if (afterImg) {
                // A imagem dentro de .img-after precisa ter a largura
                // do container PAI (.image-comparison-slider), não da
                // div .img-after que encolhe conforme o handle move.
                const containerW = container.offsetWidth;
                afterImg.style.width = `${containerW}px`;
            }
        };

        /* ── Atualiza posição do handle + clip da div .img-after ── */
        const setPosition = (pct) => {
            pct = clamp(pct, 0, 100);
            imgAfter.style.width = `${pct}%`;
            handle.style.left    = `${pct}%`;
            handle.setAttribute('aria-valuenow', Math.round(pct));
            // Re-aplica a largura absoluta da imagem para compensar o clip
            updateAfterImgWidth();
        };

        /* ── Converte clientX em percentual do container ── */
        const getPercent = (clientX) => {
            const rect = container.getBoundingClientRect();
            return ((clamp(clientX - rect.left, 0, rect.width)) / rect.width) * 100;
        };

        // Estado inicial
        setPosition(50);

        /* ── Pointer Events (desktop + tablet + stylus) ── */
        container.addEventListener('pointerdown', (e) => {
            isActive = true;
            hintActive = false; // cancela hint se estava rodando
            try { container.setPointerCapture(e.pointerId); } catch(_) {}
            setPosition(getPercent(e.clientX));
        });

        container.addEventListener('pointermove', (e) => {
            if (!isActive) return;
            setPosition(getPercent(e.clientX));
        });

        const stopDrag = () => { isActive = false; };
        container.addEventListener('pointerup',     stopDrag);
        container.addEventListener('pointercancel', stopDrag);

        /* ── Touch Events (fallback para mobile antigo / Safari) ── */
        container.addEventListener('touchstart', (e) => {
            isActive = true;
            setPosition(getPercent(e.touches[0].clientX));
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!isActive) return;
            e.preventDefault(); // evita scroll da página durante o drag
            setPosition(getPercent(e.touches[0].clientX));
        }, { passive: false });

        container.addEventListener('touchend',    stopDrag);
        container.addEventListener('touchcancel', stopDrag);

        /* ── Teclado (acessibilidade) ── */
        handle.addEventListener('keydown', (e) => {
            const STEP = 2;
            let current = parseFloat(handle.style.left) || 50;
            if (e.key === 'ArrowLeft') {
                setPosition(current - STEP);
                e.preventDefault();
            }
            if (e.key === 'ArrowRight') {
                setPosition(current + STEP);
                e.preventDefault();
            }
        });

        /* ── Hint animation: oscila suavemente ao passar o mouse ── */
        container.addEventListener('mouseenter', () => {
            // Só roda se ainda não interagiu (ainda em 50%)
            const currentPct = parseFloat(imgAfter.style.width) || 50;
            if (Math.abs(currentPct - 50) > 3 || isActive) return;

            hintActive = true;
            let t = 0;
            const FRAMES = 70;

            const hintLoop = () => {
                if (!hintActive || isActive) {
                    // Reseta para 50% se interrompido
                    setPosition(50);
                    return;
                }
                t++;
                const oscillation = Math.sin((t / FRAMES) * Math.PI) * 10;
                setPosition(50 - oscillation);
                if (t < FRAMES) {
                    hintRaf = requestAnimationFrame(hintLoop);
                } else {
                    hintActive = false;
                    setPosition(50);
                }
            };

            setTimeout(() => {
                if (!isActive && hintActive) {
                    hintRaf = requestAnimationFrame(hintLoop);
                }
            }, 500);
        });

        container.addEventListener('mouseleave', () => {
            hintActive = false;
            cancelAnimationFrame(hintRaf);
        });

        /* ── ResizeObserver: recalcula largura da imagem ao redimensionar ── */
        if (window.ResizeObserver) {
            new ResizeObserver(updateAfterImgWidth).observe(container);
        } else {
            window.addEventListener('resize', updateAfterImgWidth, { passive: true });
        }
    });
};


/* ─────────────────────────────────────────────────────────────
   6. MICRO-INTERAÇÕES MAGNÉTICAS NOS CTAs
───────────────────────────────────────────────────────────── */
const initMagneticButtons = () => {
    const btnStyle = document.createElement('style');
    btnStyle.textContent = `
    .btn--magnetic {
      position: relative;
      overflow: hidden;
    }
    .btn--magnetic .btn-text-original,
    .btn--magnetic .btn-text-clone {
      display: block;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.4s ease;
      will-change: transform;
      pointer-events: none;
    }
    .btn--magnetic .btn-text-clone {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateY(110%);
      opacity: 0;
    }
    .btn--magnetic:hover .btn-text-original {
      transform: translateY(-110%);
      opacity: 0;
    }
    .btn--magnetic:hover .btn-text-clone {
      transform: translateY(0);
      opacity: 1;
    }
    @media (prefers-reduced-motion: reduce) {
      .btn--magnetic .btn-text-original,
      .btn--magnetic .btn-text-clone {
        transition: none;
        transform: none !important;
        opacity: 1 !important;
        position: static !important;
      }
    }
  `;
    document.head.appendChild(btnStyle);

    const ctaButtons = document.querySelectorAll('.btn--primary, .btn--ghost');

    ctaButtons.forEach(btn => {
        if (btn.classList.contains('btn--magnetic')) return;

        const originalText = btn.textContent.trim();

        btn.innerHTML = `
      <span class="btn-text-original">${originalText}</span>
      <span class="btn-text-clone" aria-hidden="true">${originalText}</span>
    `;
        btn.classList.add('btn--magnetic');

        let magRafId = null;
        let targetX = 0, targetY = 0;
        let currentMagX = 0, currentMagY = 0;

        const MAGNETIC_STRENGTH = 0.28;
        const MAGNETIC_RADIUS = 80;

        const magneticLoop = () => {
            currentMagX = lerp(currentMagX, targetX, 0.12);
            currentMagY = lerp(currentMagY, targetY, 0.12);
            btn.style.transform = `translate(${currentMagX}px, ${currentMagY}px)`;

            if (Math.abs(currentMagX - targetX) > 0.1 || Math.abs(currentMagY - targetY) > 0.1) {
                magRafId = requestAnimationFrame(magneticLoop);
            } else {
                btn.style.transform = `translate(${targetX}px, ${targetY}px)`;
                magRafId = null;
            }
        };

        const startMagLoop = () => {
            if (!magRafId) magRafId = requestAnimationFrame(magneticLoop);
        };

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const btnCX = rect.left + rect.width / 2;
            const btnCY = rect.top + rect.height / 2;
            const distX = e.clientX - btnCX;
            const distY = e.clientY - btnCY;
            const dist = Math.sqrt(distX * distX + distY * distY);

            if (dist < MAGNETIC_RADIUS) {
                targetX = distX * MAGNETIC_STRENGTH;
                targetY = distY * MAGNETIC_STRENGTH;
                startMagLoop();
            }
        });

        btn.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
            startMagLoop();
        });
    });
};


/* ─────────────────────────────────────────────────────────────
   7. SMOOTH SCROLL PARA ÂNCORAS
───────────────────────────────────────────────────────────── */
const initSmoothScroll = () => {
    const header = document.querySelector('.site-header');

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (!target) return;

            e.preventDefault();

            const headerH = header?.getBoundingClientRect().height || 80;
            const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
};


/* ─────────────────────────────────────────────────────────────
   8. PARALLAX SUAVE NO HERO
───────────────────────────────────────────────────────────── */
const initHeroParallax = () => {
    const heroSection = document.querySelector('.section--hero');
    const heroBgName = document.querySelector('.hero-bg-name');
    const heroImage = document.querySelector('.hero-image img, .hero-image-placeholder');
    if (!heroSection) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            const heroH = heroSection.offsetHeight;

            if (scrollY > heroH) {
                ticking = false;
                return;
            }

            const progress = scrollY / heroH;

            if (heroBgName) {
                heroBgName.style.transform = `translateY(${scrollY * 0.25}px)`;
            }

            if (heroImage) {
                heroImage.style.transform = `translateY(${scrollY * 0.12}px) scale(1)`;
            }

            const heroText = document.querySelector('.hero-text');
            if (heroText) {
                const opacity = clamp(1 - progress * 2.2, 0, 1);
                heroText.style.opacity = opacity;
                heroText.style.transform = `translateY(${scrollY * 0.18}px)`;
            }

            ticking = false;
        });
        ticking = true;
    }, { passive: true });
};


/* ─────────────────────────────────────────────────────────────
   9. CONTADOR ANIMADO — Números nas Stats
───────────────────────────────────────────────────────────── */
const initCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const parseStatText = (text) => {
        const match = text.match(/^([+\-]?)(\d+)(.*)$/);
        if (!match) return { prefix: '', value: 0, suffix: text };
        return {
            prefix: match[1] || '',
            value: parseInt(match[2], 10),
            suffix: match[3] || '',
        };
    };

    const animateCounter = (el, { prefix, value, suffix }) => {
        const DURATION = 1800;
        const start = performance.now();

        const step = (now) => {
            const elapsed = now - start;
            const progress = clamp(elapsed / DURATION, 0, 1);
            const eased = easeOutExpo(progress);
            const current = Math.round(eased * value);

            el.textContent = `${prefix}${current}${suffix}`;

            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = `${prefix}${value}${suffix}`;
        };
        requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const parsed = parseStatText(entry.target.textContent.trim());
                animateCounter(entry.target, parsed);
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(counter => {
        counter.dataset.original = counter.textContent;
        observer.observe(counter);
    });
};


/* ─────────────────────────────────────────────────────────────
   10. FORMULÁRIO — Validação + Feedback de Envio
───────────────────────────────────────────────────────────── */
const initForm = () => {
    const form = document.querySelector('.booking-form-card');
    const submitBtn = form?.querySelector('.btn--primary.btn--full');
    const inputs = form?.querySelectorAll('.form-input');
    if (!form || !submitBtn) return;

    const formStyle = document.createElement('style');
    formStyle.textContent = `
    .form-input.is-error {
      border-color: #c0392b;
      box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.12);
      animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }
    .form-input.is-valid {
      border-color: var(--gold-deep);
      box-shadow: 0 0 0 3px rgba(154, 108, 24, 0.10);
    }
    .form-success-msg {
      text-align: center;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .form-success-msg.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .form-success-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(201, 146, 42, 0.12);
      border: 1px solid var(--gold-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gold-primary);
      font-size: 1.5rem;
    }
    .form-success-title {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      color: var(--text-primary);
    }
    .form-success-sub {
      font-size: var(--text-sm);
      color: var(--text-muted);
      max-width: 280px;
    }
    @keyframes shake {
      10%, 90%  { transform: translateX(-2px); }
      20%, 80%  { transform: translateX(3px);  }
      30%, 50%, 70% { transform: translateX(-4px); }
      40%, 60%  { transform: translateX(4px);  }
    }
    .btn--loading {
      pointer-events: none;
      opacity: 0.7;
    }
  `;
    document.head.appendChild(formStyle);

    inputs?.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('is-error');
                input.classList.remove('is-valid');
            } else if (input.value.trim()) {
                input.classList.remove('is-error');
                input.classList.add('is-valid');
            }
        });
        input.addEventListener('input', () => {
            input.classList.remove('is-error');
        });
    });

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        let hasError = false;

        form.querySelectorAll('.form-input[required]').forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('is-error');
                hasError = true;
            }
        });

        if (hasError) return;

        const nome      = document.querySelector('#input-nome').value;
        const telefone  = document.querySelector('#input-telefone').value;
        const tratamento = document.querySelector('#input-tratamento').value;
        const mensagem  = document.querySelector('#input-mensagem').value;

        const numeroWhatsapp = '5513991540145';

        const texto = encodeURIComponent(
            `Olá! Gostaria de agendar uma consulta.\n\n` +
            `👤 Nome: ${nome}\n` +
            `📞 WhatsApp: ${telefone}\n` +
            `💆 Tratamento: ${tratamento}\n` +
            `📝 Mensagem: ${mensagem}`
        ).replace(/%0A/g, '%0A');

        window.open(
            `https://wa.me/${numeroWhatsapp}?text=${texto}`,
            '_blank'
        );
    });
};


/* ─────────────────────────────────────────────────────────────
   11. CURSOR CUSTOMIZADO
───────────────────────────────────────────────────────────── */
const initCustomCursor = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
    *, *::before, *::after { cursor: none !important; }
    .cursor-dot {
      position: fixed;
      top: 0; left: 0;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--gold-primary);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease, transform 0.15s ease;
      will-change: transform;
    }
    .cursor-ring {
      position: fixed;
      top: 0; left: 0;
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 1px solid rgba(201, 146, 42, 0.45);
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease, width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.3s ease;
      will-change: transform;
    }
    .cursor-ring.is-hovering {
      width: 60px;
      height: 60px;
      border-color: rgba(201, 146, 42, 0.70);
    }
    .cursor-dot.is-hovering {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0.6;
    }
    .cursor-dot.is-hidden,
    .cursor-ring.is-hidden { opacity: 0; }
  `;
    document.head.appendChild(cursorStyle);

    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mouseX = -100, mouseY = -100;
    let ringX  = -100, ringY  = -100;
    let isVisible = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isVisible) {
            isVisible = true;
            dot.classList.remove('is-hidden');
            ring.classList.remove('is-hidden');
        }
        dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    const ringLoop = () => {
        ringX = lerp(ringX, mouseX, 0.10);
        ringY = lerp(ringY, mouseY, 0.10);
        ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
        requestAnimationFrame(ringLoop);
    };
    requestAnimationFrame(ringLoop);

    document.querySelectorAll('a, button, [role="button"], .image-comparison-slider, .carousel-item')
        .forEach(el => {
            el.addEventListener('mouseenter', () => {
                dot.classList.add('is-hovering');
                ring.classList.add('is-hovering');
            });
            el.addEventListener('mouseleave', () => {
                dot.classList.remove('is-hovering');
                ring.classList.remove('is-hovering');
            });
        });

    document.addEventListener('mouseleave', () => {
        dot.classList.add('is-hidden');
        ring.classList.add('is-hidden');
        isVisible = false;
    });
};


/* ─────────────────────────────────────────────────────────────
   12. ACTIVE NAV LINKS — Highlight da seção ativa
───────────────────────────────────────────────────────────── */
const initActiveNavLinks = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    if (!navLinks.length || !sections.length) return;

    const activeStyle = document.createElement('style');
    activeStyle.textContent = `
    .nav-link.is-active {
      color: var(--gold-light);
    }
    .nav-link.is-active::after {
      width: 100%;
    }
  `;
    document.head.appendChild(activeStyle);

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach(link => {
                    const href = link.getAttribute('href')?.slice(1);
                    link.classList.toggle('is-active', href === id);
                });
            });
        },
        {
            rootMargin: '-40% 0px -55% 0px',
            threshold: 0,
        }
    );

    sections.forEach(section => observer.observe(section));
};


/* ─────────────────────────────────────────────────────────────
   13. FOOTER — Ano dinâmico
───────────────────────────────────────────────────────────── */
const initFooterYear = () => {
    const el = document.getElementById('footer-year');
    if (el && !el.textContent) {
        el.textContent = new Date().getFullYear();
    }
};


/* ─────────────────────────────────────────────────────────────
   INICIALIZAÇÃO — DOMContentLoaded
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

    initSmartNav();
    initSmoothScroll();
    initFooterYear();

    initSectionReveal();
    initTextReveal();

    initInfiniteCarousel();
    initComparisonSliders();
    initCounters();

    initMagneticButtons();
    initHeroParallax();
    initActiveNavLinks();
    initForm();

    initCustomCursor();

    requestAnimationFrame(() => {
        const hero = document.querySelector('.section--hero');
        if (hero) {
            setTimeout(() => hero.classList.add('in-view'), 50);
        }
    });

});


/* ─────────────────────────────────────────────────────────────
   CLEANUP — Remove listeners em SPAs (caso necessário)
───────────────────────────────────────────────────────────── */
window.__pgCleanup = () => {
    document.querySelectorAll('.reveal-inner').forEach(el => {
        el.style.transition = 'none';
    });
};