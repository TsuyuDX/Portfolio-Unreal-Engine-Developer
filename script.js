/**
 * GAMEDEV PORTFOLIO CORE ENGINE v2.5
 * Sections: 1-11
 */

// 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И ПЕРЕМЕННЫЕ
const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
const isMobile = () => window.innerWidth <= 1024;
let currentGlobalLang = 'ru'; 

// 2. SMOOTH SCROLL (Плавная навигация)
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const id = link.getAttribute('href');
        if (id === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.querySelector(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// 3. SCROLL ANIMATIONS (Прогресс-бары и счетчики)
function animateCounter(el) {
    const targetText = el.getAttribute('data-target') || el.textContent; 
    const target = parseInt(targetText, 10); 
    if (isNaN(target)) return;
    if (!el.hasAttribute('data-target')) el.setAttribute('data-target', target);

    el.textContent = "0%"; 
    const duration = 1500; 
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(ease * target);
        el.textContent = currentVal + "%";
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target + "%";
    }
    requestAnimationFrame(update);
}

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.stat-value').forEach(counter => animateCounter(counter));
            
            entry.target.querySelectorAll('.tech-stat').forEach(stat => {
                const valueElement = stat.querySelector('.stat-value');
                const bar = stat.querySelector('.stat-bar');
                if (valueElement && bar) {
                    const percent = parseInt(valueElement.getAttribute('data-target') || valueElement.textContent, 10);
                    if (!isNaN(percent)) bar.style.setProperty('--w', `${percent}%`);
                }
            });
            sectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.section').forEach(s => sectionObserver.observe(s));

// Полоса прокрутки сверху
window.addEventListener('scroll', () => {
    const progressBar = document.querySelector('.scroll-progress');
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && maxScroll > 0) {
        progressBar.style.width = `${(scrollTop / maxScroll) * 100}%`;
    }
});

// 4. VIDEO MODAL (Модальное окно видео)
const modal = document.getElementById('videoModal');
const iframe = document.getElementById('videoFrame');
const closeBtn = document.querySelector('.video-close');

document.querySelectorAll('[data-video]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const videoSrc = btn.getAttribute('data-video');
        if (modal && iframe && videoSrc) {
            iframe.src = videoSrc.includes('?') ? `${videoSrc}&autoplay=1` : `${videoSrc}?autoplay=1`;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

if(closeBtn) {
    closeBtn.addEventListener('click', () => {
        if(modal) modal.classList.remove('active');
        if(iframe) iframe.src = '';
        document.body.style.overflow = '';
    });
}

// 5. HACKER TEXT: STABLE DECRYPTION
document.querySelectorAll(".hacker-text").forEach(element => {
    let interval = null;
    if (element.classList.contains('audio-text')) return;

    const runScramble = (text) => {
        if (!text) return; 

        const isNoScramble = element.classList.contains('no-scramble') || element.closest('.no-scramble');

        if (isNoScramble) {
            element.innerText = text;
            return;
        }

        let iterations = 0;
        element.classList.add('animating');
        clearInterval(interval);

        interval = setInterval(() => {
            element.innerText = text.split("").map((letter, index) => {
                if (index < iterations) return text[index];
                return charset[Math.floor(Math.random() * charset.length)];
            }).join("");

            if (iterations >= text.length) {
                clearInterval(interval);
                element.classList.remove('animating');
            }
            iterations += text.length > 50 ? 2 : 1; 
        }, 30);
    };

    element.addEventListener("mouseenter", () => {
        if (!isMobile()) {
            const targetLang = (currentGlobalLang === 'ru') ? 'en' : 'ru';
            runScramble(element.getAttribute(`data-${targetLang}`));
        }
    });

    element.addEventListener("mouseleave", () => {
        if (!isMobile()) {
            runScramble(element.getAttribute(`data-${currentGlobalLang}`));
        }
    });
});

// 6. GLOBAL MOBILE TRANSLATION (Глобальный переключатель языков)
const mobileLangBtn = document.getElementById('mobile-lang-toggle');

if (mobileLangBtn) {
    mobileLangBtn.addEventListener('click', () => {
        currentGlobalLang = (currentGlobalLang === 'ru') ? 'en' : 'ru';
        mobileLangBtn.innerText = currentGlobalLang.toUpperCase();

        document.querySelectorAll('.hacker-text').forEach(el => {
            if (el.classList.contains('audio-text')) return;
            const newText = el.getAttribute(`data-${currentGlobalLang}`);
            if (newText) {
                el.innerText = newText;
            }
        });

        if (typeof updateAudioLabel === "function") updateAudioLabel();

        mobileLangBtn.style.transform = 'scale(0.9)';
        setTimeout(() => mobileLangBtn.style.transform = 'scale(1)', 100);
    });
}

// 7. PROJECT SLIDER: AUTO-SCROLL & NAVIGATION (Слайдер проектов)
const track = document.getElementById('projectsTrack');
const btnLeft = document.getElementById('slideLeft');
const btnRight = document.getElementById('slideRight');

if (track) {
    const getScrollStep = () => {
        const card = track.querySelector('.project-card');
        return isMobile() ? track.offsetWidth : (card ? card.offsetWidth + 30 : 350);
    };

    if (btnLeft && btnRight) {
        btnLeft.addEventListener('click', () => {
            track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        });
        btnRight.addEventListener('click', () => {
            track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });
    }
}

// 8. AUDIO SYSTEM (Синхронизация с пульсацией фона)
const audioBtn = document.getElementById('audioToggle');
const bgMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');
const audioTextEl = audioBtn?.querySelector('.audio-text');

function updateAudioLabel() {
    if (!audioBtn || !bgMusic || !audioTextEl) return;
    const isPlaying = !bgMusic.paused;
    const state = isPlaying ? 'on' : 'off';
    const newText = audioTextEl.getAttribute(`data-${currentGlobalLang}-${state}`);
    if (newText) {
        audioTextEl.innerText = newText;
    }
}

if (audioBtn && bgMusic && volumeSlider) {
    bgMusic.volume = volumeSlider.value;
    volumeSlider.style.setProperty('--value', `${volumeSlider.value * 100}%`);

    audioBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                audioBtn.classList.add('playing');
                document.body.classList.add('music-playing'); // Активация быстрой пульсации фона
                updateAudioLabel();
            }).catch(e => console.log("Autoplay blocked"));
        } else {
            bgMusic.pause();
            audioBtn.classList.remove('playing');
            document.body.classList.remove('music-playing'); // Возврат к спокойному ритму фона
            updateAudioLabel();
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        bgMusic.volume = val;
        e.target.style.setProperty('--value', `${val * 100}%`);
    });
}

// 9. FOOTER RIPPLES & HQ HINT (Эффекты футера и подсказка)
const footer = document.getElementById('main-footer');
if (footer) {
    footer.addEventListener('mousemove', (e) => {
        if (!isMobile()) {
            const rect = footer.getBoundingClientRect();
            footer.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            footer.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        }
    });
    
    footer.addEventListener('click', (e) => {
        const container = footer.querySelector('.footer-hud'); 
        if (!container) return; 
        const ripple = document.createElement('div');
        ripple.classList.add('click-ripple');
        const rect = container.getBoundingClientRect();
        ripple.style.left = `${e.clientX - rect.left}px`;
        ripple.style.top = `${e.clientY - rect.top}px`;
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}

// Интерактивный фон: обновление координат курсора
window.addEventListener('mousemove', (e) => {
    if (!isMobile()) {
        document.body.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.body.style.setProperty('--cursor-y', `${e.clientY}px`);
    }
});

// Системная подсказка при загрузке
window.addEventListener('DOMContentLoaded', () => {
    const hint = document.createElement('div');
    hint.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><span style="width:8px;height:8px;background:var(--accent);border-radius:50%;box-shadow:0 0 10px var(--accent);"></span><p>SYSTEM: Use <b>EN</b> button to translate</p></div>`;
    Object.assign(hint.style, {
        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%) translateY(150px)',
        background: 'rgba(14,14,17,0.95)', border: '1px solid var(--accent)', padding: '12px 20px',
        zIndex: '10000', transition: 'transform 0.5s ease', color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.8rem', pointerEvents: 'none'
    });
    document.body.appendChild(hint);
    setTimeout(() => hint.style.transform = 'translateX(-50%) translateY(0)', 2500);
    setTimeout(() => { 
        hint.style.transform = 'translateX(-50%) translateY(150px)'; 
        setTimeout(() => hint.remove(), 500); 
    }, 9000);
});

// 10. FOOTER BOUNDS STABILIZER (Стабилизация мобильного футера)
function stabilizeFooter() {
    if (!isMobile()) return;
    const footer = document.getElementById('main-footer');
    if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight) {
            footer.style.paddingBottom = "80px"; 
        }
    }
}
window.addEventListener('scroll', stabilizeFooter);
window.addEventListener('resize', stabilizeFooter);

// 11. RANDOM AVATAR GLITCH (Случайные помехи на аватаре)
const avatarWrapper = document.querySelector('.profile-frame');

if (avatarWrapper) {
    setInterval(() => {
        if (Math.random() > 0.95) {
            avatarWrapper.style.filter = `hue-rotate(${Math.random() * 90}deg) contrast(1.2) brightness(1.1)`;
            setTimeout(() => {
                avatarWrapper.style.filter = 'none';
            }, 150);
        }
    }, 4000);
}

// 12. INTERACTIVE FLASHLIGHT EFFECT
// Обновление координат фонарика и курсора
window.addEventListener('mousemove', (e) => {
    if (!isMobile()) {
        const x = e.clientX + 'px';
        const y = e.clientY + 'px';
        
        document.documentElement.style.setProperty('--flashlight-x', x);
        document.documentElement.style.setProperty('--flashlight-y', y);
        
        // Для обратной совместимости с вашими старыми стилями
        document.body.style.setProperty('--cursor-x', x);
        document.body.style.setProperty('--cursor-y', y);
    }
});
