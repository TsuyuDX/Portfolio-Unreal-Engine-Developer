    /**
     * GAMEDEV PORTFOLIO CORE ENGINE v3.6
     * All Systems Operational: Optimized 3D Tilt, Advanced Cursor, Mobile Fixes, SFX Toggle
     */

    // 1. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И ПЕРЕМЕННЫЕ
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    const isMobile = () => window.innerWidth <= 1024;
    let currentGlobalLang = 'ru'; 

    // 2. SMOOTH SCROLL
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

    // 3. SCROLL ANIMATIONS
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

    // 5. HACKER TEXT
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

    // 6. GLOBAL MOBILE TRANSLATION
    const mobileLangBtn = document.getElementById('mobile-lang-toggle');
    if (mobileLangBtn) {
        mobileLangBtn.addEventListener('click', () => {
            currentGlobalLang = (currentGlobalLang === 'ru') ? 'en' : 'ru';
            mobileLangBtn.innerText = currentGlobalLang.toUpperCase();
            document.querySelectorAll('.hacker-text').forEach(el => {
                if (el.classList.contains('audio-text')) return;
                const newText = el.getAttribute(`data-${currentGlobalLang}`);
                if (newText) el.innerText = newText;
            });
            if (typeof updateAudioLabel === "function") updateAudioLabel();
            mobileLangBtn.style.transform = 'scale(0.9)';
            setTimeout(() => mobileLangBtn.style.transform = 'scale(1)', 100);
        });
    }

    // 7. PROJECT SLIDER
    const track = document.getElementById('projectsTrack');
    const btnLeft = document.getElementById('slideLeft');
    const btnRight = document.getElementById('slideRight');

    if (track) {
        const getScrollStep = () => {
            const card = track.querySelector('.project-card');
            return isMobile() ? track.offsetWidth : (card ? card.offsetWidth + 30 : 350);
        };
        if (btnLeft && btnRight) {
            btnLeft.addEventListener('click', () => track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' }));
            btnRight.addEventListener('click', () => track.scrollBy({ left: getScrollStep(), behavior: 'smooth' }));
        }
    }

    // 8. AUDIO SYSTEM (MUSIC)
    const audioBtn = document.getElementById('audioToggle');
    const bgMusic = document.getElementById('bgMusic');
    const volumeSlider = document.getElementById('volumeSlider');
    const audioTextEl = audioBtn?.querySelector('.audio-text');
    const volumeDisplay = document.getElementById('volumeDisplay');
    const audioIcon = document.getElementById('audioIcon');

    function updateAudioLabel() {
        if (!audioBtn || !bgMusic || !audioTextEl) return;
        const isPlaying = !bgMusic.paused;
        const state = isPlaying ? 'on' : 'off';
        const newText = audioTextEl.getAttribute(`data-${currentGlobalLang}-${state}`);
        if (newText) audioTextEl.innerText = newText;
    }

    // Helper: Pause music from other scripts
    function pauseBgMusicForce() {
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
            if(audioBtn) audioBtn.classList.remove('playing');
            document.body.classList.remove('music-playing');
            updateAudioLabel();
        }
    }

    if (audioBtn && bgMusic && volumeSlider) {
        bgMusic.volume = volumeSlider.value;
        volumeSlider.style.setProperty('--value', `${volumeSlider.value * 100}%`);
        if(volumeDisplay) volumeDisplay.innerText = Math.round(volumeSlider.value * 100) + '%';

        audioBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    audioBtn.classList.add('playing');
                    document.body.classList.add('music-playing');
                    updateAudioLabel();
                }).catch(e => console.log("Autoplay blocked"));
            } else {
                bgMusic.pause();
                audioBtn.classList.remove('playing');
                document.body.classList.remove('music-playing');
                updateAudioLabel();
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            bgMusic.volume = val;
            e.target.style.setProperty('--value', `${val * 100}%`);
            if (volumeDisplay) volumeDisplay.innerText = Math.round(val * 100) + '%';
            if (audioIcon) {
                if (val == 0) {
                    audioIcon.className = 'ri-volume-mute-line';
                    audioIcon.style.opacity = '0.5';
                } else if (val < 0.5) {
                    audioIcon.className = 'ri-volume-down-line';
                    audioIcon.style.opacity = '0.8';
                } else {
                    audioIcon.className = 'ri-volume-up-line';
                    audioIcon.style.opacity = '1';
                }
            }
        });
    }

    // 9. FOOTER RIPPLES
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

    // Interactive BG
    window.addEventListener('mousemove', (e) => {
        if (!isMobile()) {
            document.body.style.setProperty('--cursor-x', `${e.clientX}px`);
            document.body.style.setProperty('--cursor-y', `${e.clientY}px`);
        }
    });

    // System Hint
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

    // 10. FOOTER STABILIZER
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

    // 11. AVATAR GLITCH
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

    // 12. FLASHLIGHT
    window.addEventListener('mousemove', (e) => {
        if (!isMobile()) {
            const x = e.clientX + 'px';
            const y = e.clientY + 'px';
            document.documentElement.style.setProperty('--flashlight-x', x);
            document.documentElement.style.setProperty('--flashlight-y', y);
        }
    });

    // 13. AUTO-HIDE HUD
    const mainFooter1 = document.getElementById('main-footer');
    if (mainFooter1) {
        const hudObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.body.classList.add('hud-hidden');
                } else {
                    document.body.classList.remove('hud-hidden');
                }
            });
        }, { threshold: 0.1 });
        hudObserver.observe(mainFooter1);
    }


    // 14. CUSTOM VIDEO PLAYER CONTROLS (FULL LOGIC)

    const customPlayer = document.getElementById('customPlayer');
    const mainVideo = document.getElementById('mainVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const bigPlayBtn = document.getElementById('bigPlayBtn');
    const videoProgress = document.getElementById('videoProgress');
    const videoVolume = document.getElementById('videoVolume');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const feedbackEl = document.getElementById('keyFeedback');
    // Settings Elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    const speedOptions = document.querySelectorAll('#speedOptions button');
    const qualityOptions = document.querySelectorAll('#qualityOptions button');

    if (mainVideo) {
        // --- Helper Functions ---
        const formatTime = (s) => {
            const mins = Math.floor(s / 60);
            const secs = Math.floor(s % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        const showFeedback = (iconClass) => {
            if (!feedbackEl) return;
            feedbackEl.innerHTML = `<i class="${iconClass}"></i>`;
            feedbackEl.classList.remove('animate');
            void feedbackEl.offsetWidth; // Force Reflow
            feedbackEl.classList.add('animate');
        };

        const togglePlay = () => {
            if (mainVideo.paused) {
                pauseBgMusicForce();
                mainVideo.play();
                customPlayer.classList.add('playing');
                customPlayer.classList.remove('paused'); 
                playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
            } else {
                mainVideo.pause();
                customPlayer.classList.remove('playing');
                customPlayer.classList.add('paused');
                playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
            }
        };

        const updateVolumeIcon = (val) => {
            const icon = document.getElementById('videoVolIcon');
            if (!icon) return;
            if (val == 0) icon.className = 'ri-volume-mute-line';
            else if (val < 0.5) icon.className = 'ri-volume-down-line';
            else icon.className = 'ri-volume-up-line';
        };

        //  Basic Controls Events 
        if(bigPlayBtn) bigPlayBtn.addEventListener('click', togglePlay);
        if(playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
        
        mainVideo.addEventListener('click', (e) => {
            if (settingsMenu && settingsMenu.classList.contains('active')) {
                settingsMenu.classList.remove('active');
                settingsBtn.classList.remove('active');
            } else {
                togglePlay();
            }
        });

        // Settings Menu Logic
        if (settingsBtn && settingsMenu) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                settingsMenu.classList.toggle('active');
                settingsBtn.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (settingsMenu.classList.contains('active') && !settingsMenu.contains(e.target) && e.target !== settingsBtn) {
                    settingsMenu.classList.remove('active');
                    settingsBtn.classList.remove('active');
                }
            });

            speedOptions.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    speedOptions.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const speed = parseFloat(btn.getAttribute('data-speed'));
                    mainVideo.playbackRate = speed;
                });
            });

            qualityOptions.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    qualityOptions.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        }

        //  Keyboard Controls 
        window.addEventListener('keydown', (e) => {
            const videoModal = document.getElementById('videoModal');
            if (!videoModal || !videoModal.classList.contains('active')) return;

            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
                showFeedback(mainVideo.paused ? 'ri-pause-fill' : 'ri-play-fill');
            }
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                mainVideo.currentTime = Math.max(0, mainVideo.currentTime - 5);
                showFeedback('ri-rewind-fill');
            }
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                mainVideo.currentTime = Math.min(mainVideo.duration, mainVideo.currentTime + 5);
                showFeedback('ri-speed-fill');
            }
        });

        // Progress & Time 
        mainVideo.addEventListener('timeupdate', () => {
            const pct = (mainVideo.currentTime / mainVideo.duration) * 100;
            if(videoProgress) {
                videoProgress.value = pct;
                videoProgress.style.setProperty('--seek-position', `${pct}%`);
            }
            if(currentTimeEl) currentTimeEl.innerText = formatTime(mainVideo.currentTime);
        });

        mainVideo.addEventListener('loadedmetadata', () => {
            if(durationEl) durationEl.innerText = formatTime(mainVideo.duration);
        });

        if(videoProgress) {
            videoProgress.addEventListener('input', (e) => {
                const time = (e.target.value / 100) * mainVideo.duration;
                mainVideo.currentTime = time;
            });
        }

        //  Volume 
        if(videoVolume) {
            const startVal = videoVolume.value;
            videoVolume.style.setProperty('--vol-position', `${startVal * 100}%`);
            updateVolumeIcon(startVal);

            videoVolume.addEventListener('input', (e) => {
                const val = e.target.value;
                mainVideo.volume = val;
                e.target.style.setProperty('--vol-position', `${val * 100}%`);
                updateVolumeIcon(val);
            });

            const volIconBtn = document.getElementById('videoVolIcon');
            if (volIconBtn) {
                let lastVolume = 1; 
                volIconBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (mainVideo.volume > 0) {
                        lastVolume = mainVideo.volume;
                        mainVideo.volume = 0;
                        videoVolume.value = 0;
                        videoVolume.style.setProperty('--vol-position', '0%');
                        updateVolumeIcon(0);
                    } else {
                        mainVideo.volume = lastVolume;
                        videoVolume.value = lastVolume;
                        videoVolume.style.setProperty('--vol-position', `${lastVolume * 100}%`);
                        updateVolumeIcon(lastVolume);
                    }
                });
            }
        }

        // Fullscreen & Orientation Lock 
        if(fullscreenBtn) {
            fullscreenBtn.addEventListener('click', async () => {
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    // Входим в полный экран
                    try {
                        if (customPlayer.requestFullscreen) {
                            await customPlayer.requestFullscreen();
                        } else if (customPlayer.webkitRequestFullscreen) { /* Safari */
                            await customPlayer.webkitRequestFullscreen();
                        } else if (mainVideo.webkitEnterFullscreen) { /* iOS Video Native */
                            mainVideo.webkitEnterFullscreen();
                        }
                        
                        // Попытка повернуть экран горизонтально (Android)
                        if (screen.orientation && screen.orientation.lock) {
                            screen.orientation.lock('landscape').catch(err => {// Браузер может запретить, это нормально
                    
                                console.log('Orientation lock blocked:', err);
                            });
                        }
                    } catch (err) {
                        console.error("Error attempting to enable fullscreen:", err);
                    }
                } else {
                    // Выходим из полного экрана
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                    
                    // Сбрасываем ориентацию
                    if (screen.orientation && screen.orientation.unlock) {
                        screen.orientation.unlock();
                    }
                }
            });
        }
    }

    // 15. MODAL OPEN/CLOSE LOGIC SEQUENTIAL
 
    const videoModal = document.getElementById('videoModal');
    const videoClose = document.querySelector('.video-close');
    const videoOverlay = document.querySelector('.video-overlay');
    const videoBtns = document.querySelectorAll('[data-video]');

    function openModal(e) {
        e.preventDefault();
        if (videoModal) {
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden'; 
            document.body.classList.add('video-mode'); // Отключаем кастомный курсор
            pauseBgMusicForce();

            setTimeout(() => {
                if (customPlayer) customPlayer.classList.add('initialized');
                setTimeout(() => {
                    if (mainVideo) {
                        mainVideo.play().then(() => {
                            customPlayer.classList.add('playing');
                            if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
                        }).catch(err => {
                            console.log("Autoplay blocked");
                            customPlayer.classList.remove('playing');
                            customPlayer.classList.add('paused');
                        });
                    }
                }, 300);
            }, 500); 
        }
    }

    function closeModal() {
        if (videoModal) {
            videoModal.classList.remove('active');
            document.body.style.overflow = '';
            document.body.classList.remove('video-mode'); // Возвращаем кастомный курсор

            if (customPlayer) {
                customPlayer.classList.remove('initialized');
                customPlayer.classList.remove('playing');
                customPlayer.classList.remove('paused');
            }
            if (settingsMenu) settingsMenu.classList.remove('active');
            if (settingsBtn) settingsBtn.classList.remove('active');

            if (mainVideo) {
                mainVideo.pause();
                mainVideo.currentTime = 0;
                mainVideo.playbackRate = 1; 
                if (playPauseBtn) playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
            }

            const spdBtns = document.querySelectorAll('#speedOptions button');
            if (spdBtns.length > 0) {
                spdBtns.forEach(b => b.classList.remove('active'));
                const normalBtn = document.querySelector('#speedOptions button[data-speed="1"]');
                if (normalBtn) normalBtn.classList.add('active');
            }
        }
    }

    videoBtns.forEach(btn => btn.addEventListener('click', openModal));
    if (videoClose) videoClose.addEventListener('click', closeModal);
    if (videoOverlay) videoOverlay.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeModal();
        }
    });

   
    // 16. UI SOUND FX SYSTEM WITH TOGGLE & MOBILE FIX
 
    const sfxConfig = {
        enabled: true, 
        volume: 0.15,
        files: {
            hover: 'assets/sounds/hover.mp3', 
            click: 'assets/sounds/click.mp3'
        }
    };

    const uiSounds = {
        hover: new Audio(sfxConfig.files.hover),
        click: new Audio(sfxConfig.files.click)
    };

    Object.values(uiSounds).forEach(sound => {
        sound.volume = sfxConfig.volume;
        sound.load(); 
    });

    // SFX Toggle Button Logic 
    
    const sfxToggleBtn = document.getElementById('sfxToggle');
    if (sfxToggleBtn) {
        const sfxIcon = sfxToggleBtn.querySelector('i');
        const sfxLabel = sfxToggleBtn.querySelector('span');

        sfxToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sfxConfig.enabled = !sfxConfig.enabled; 

            if (sfxConfig.enabled) {
                sfxToggleBtn.classList.remove('muted');
                if(sfxIcon) sfxIcon.className = 'ri-notification-3-fill';
                if(sfxLabel) sfxLabel.innerText = 'SFX: ON';
                playSfx('click'); 
            } else {
                sfxToggleBtn.classList.add('muted');
                if(sfxIcon) sfxIcon.className = 'ri-notification-off-fill';
                if(sfxLabel) sfxLabel.innerText = 'SFX: OFF';
            }
        });
    }

    // Unlock audio context for Mobile
    
    let audioUnlocked = false;
    function unlockAudioContext() {
        if (audioUnlocked) return;
        Object.values(uiSounds).forEach(sound => {
            sound.muted = true;
            const p = sound.play();
            if (p !== undefined) {
                p.then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.muted = false;
                }).catch(() => {});
            }
        });
        audioUnlocked = true;
        document.removeEventListener('touchstart', unlockAudioContext);
        document.removeEventListener('click', unlockAudioContext);
    }
    document.addEventListener('touchstart', unlockAudioContext, { passive: true });
    document.addEventListener('click', unlockAudioContext);

    function playSfx(type) {
        if (!sfxConfig.enabled) return;
        const sound = uiSounds[type];
        if (sound) {
            sound.currentTime = 0; 
            if (isMobile()) {
                sound.play().catch(e => {});
            } else {
                const clone = sound.cloneNode();
                clone.volume = sfxConfig.volume;
                clone.play().catch(e => {});
            }
        }
    }

    function initSfx() {
        
        // Ignore the toggle button itself to control it manually
    
        const interactables = document.querySelectorAll(
            'button:not(#sfxToggle), a, input[type="range"], .project-card, .video-volume-box i'
        );

        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (!isMobile()) playSfx('hover');
            });
            el.addEventListener('pointerdown', () => playSfx('click'));
        });
    }
    document.addEventListener('DOMContentLoaded', initSfx);

    // 17. 3D TILT EFFECT (OPTIMIZED - NO LAG)

    const tiltCards = document.querySelectorAll('.project-card');

    tiltCards.forEach(card => {
    
        // Variables for throttle state
    
        let isMoving = false;
        let mouseX = 0;
        let mouseY = 0;

        const updateCard = () => {
            if (!isMoving) return;

            const rect = card.getBoundingClientRect();
        
            // Calculate relative position
        
            const x = mouseX - rect.left;
            const y = mouseY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (inverted Y for X-axis tilt)
        
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;   

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            isMoving = false; // Reset flag for next frame
        };

        card.addEventListener('mousemove', (e) => {
            if (isMobile()) return; 
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Request animation frame only if not pending
        
            if (!isMoving) {
                isMoving = true;
                requestAnimationFrame(updateCard);
            }
        });

        card.addEventListener('mouseleave', () => {
            isMoving = false;
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease'; 
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // Remove transition for instant response
        });
    });


    // 18. TACTICAL CURSOR LOGIC (ADVANCED)

    const cursorCenter = document.querySelector('.cursor-center');
    const cursorRing = document.querySelector('.cursor-ring');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    window.addEventListener('mousemove', (e) => {
        if (isMobile()) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Center moves instantly
    
        if (cursorCenter) {
            cursorCenter.style.left = `${mouseX}px`;
            cursorCenter.style.top = `${mouseY}px`;
        }
    });

    function animateCursor() {
        if (isMobile()) return;
        const speed = 0.15;
        
        ringX += (mouseX - ringX) * speed;
        ringY += (mouseY - ringY) * speed;

        if (cursorRing) {
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover Effects

    const hoverElements = document.querySelectorAll('a, button, .project-card, input, .video-volume-box, .hud-btn');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // Hide on leave

    document.addEventListener('mouseleave', () => {
        if (cursorCenter) cursorCenter.style.opacity = '0';
        if (cursorRing) cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        if (cursorCenter) cursorCenter.style.opacity = '1';
        if (cursorRing) cursorRing.style.opacity = '1';
    });
