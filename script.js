document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const images = [
        { src: '1.jpg', quote: "new fren 🦀" },
        { src: '2.jpg' },
        { src: '3.jpg' }, // No quote
        { src: '3.5.jpg', quote: "this can be us! 🥹" }, // No quote
        { src: 'a.jpg' }, // No quote
        { src: 'b.jpg' }, // No quote
        { src: '4.jpg' },
        { src: '5.jpg', quote: "be my date! pls!" },
        { src: '8.jpeg', quote: "shipping code, dropping bars #AI🤖", music: 'music.mp3' },
    ];

    const sliderWrapper = document.getElementById('sliderWrapper');
    const sliderIndicators = document.getElementById('sliderIndicators');
    const gestureZone = document.getElementById('gestureZone');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentIndex = 0;
    let currentAudio = null; // Track current audio

    // Initialize Slider
    function init() {
        // Inject images and quotes
        images.forEach((imgObj, index) => {
            const slide = document.createElement('div');
            // Check type, default to image if not specified
            const type = imgObj.type || 'image';
            const src = imgObj.src;
            const quote = imgObj.quote;
            const music = imgObj.music;

            slide.classList.add('slide');
            slide.style.minWidth = '100%';
            slide.style.height = '100%';
            slide.style.position = 'relative';

            let mediaEl;

            if (type === 'video') {
                mediaEl = document.createElement('video');
                mediaEl.src = src;
                mediaEl.loop = true;
                mediaEl.playsInline = true;
                // Don't autoplay by default, let user click play or handle it
                // user wants a play button
            } else {
                mediaEl = document.createElement('img');
                mediaEl.src = src;
                mediaEl.alt = `Profile Image ${index + 1}`;
                mediaEl.draggable = false;
            }

            mediaEl.style.width = '100%';
            mediaEl.style.height = '100%';
            mediaEl.style.objectFit = 'cover';
            mediaEl.style.display = 'block';
            mediaEl.classList.add('slide-media'); // changed from slide-img to be generic

            slide.appendChild(mediaEl);

            // Add Play Button for Video
            if (type === 'video') {
                const playBtn = document.createElement('div');
                playBtn.classList.add('play-button');
                playBtn.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                `;
                slide.appendChild(playBtn);

                // Click listener for play button
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent slide click/swipe interference if any
                    if (mediaEl.paused) {
                        mediaEl.play();
                        playBtn.style.opacity = '0'; // Hide button when playing
                    } else {
                        mediaEl.pause();
                        playBtn.style.opacity = '1';
                    }
                });

                // Show button again if video ends or is paused by other means
                mediaEl.addEventListener('pause', () => {
                    playBtn.style.opacity = '1';
                });

                // Also toggle on video click?
                mediaEl.addEventListener('click', () => {
                    if (mediaEl.paused) {
                        mediaEl.play();
                        playBtn.style.opacity = '0';
                    } else {
                        mediaEl.pause();
                        playBtn.style.opacity = '1';
                    }
                });
            }

            // Music Support
            if (music) {
                // 1. Play Button (Big Center)
                const musicBtn = document.createElement('div');
                musicBtn.classList.add('play-button');
                musicBtn.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                `;
                slide.appendChild(musicBtn);

                // 2. Equalizer (Small Bottom Right)
                const equalizerContainer = document.createElement('div');
                equalizerContainer.classList.add('equalizer-container');
                equalizerContainer.innerHTML = `
                    <div class="equalizer">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </div>
                `;
                slide.appendChild(equalizerContainer);

                // 3. Particle Container
                const particleContainer = document.createElement('div');
                particleContainer.classList.add('music-particles');
                slide.appendChild(particleContainer);

                const audio = new Audio(music);
                audio.loop = true;
                let particleInterval;

                const createParticle = () => {
                    const particle = document.createElement('div');
                    particle.classList.add('music-particle');
                    // Random emoji note or heart
                    const emojis = ['🎵', '🎶', '❤️', '✨', '💿'];
                    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

                    // Random horizontal position
                    particle.style.left = Math.random() * 100 + '%';

                    // Random size variation
                    const size = 20 + Math.random() * 20;
                    particle.style.fontSize = `${size}px`;

                    // Random animation speed
                    particle.style.animationDuration = (2 + Math.random() * 2) + 's';

                    particleContainer.appendChild(particle);

                    // Cleanup
                    setTimeout(() => {
                        particle.remove();
                    }, 4000);
                };

                const toggleMusic = () => {
                    if (audio.paused) {
                        // Stop any other audio
                        if (currentAudio && currentAudio !== audio) {
                            currentAudio.pause();
                            currentAudio.currentTime = 0;
                            // Clean up previous particle interval if any (though global state doesn't track it well, relying on object refs)
                        }
                        audio.play().catch(e => console.log('Audio play error:', e));

                        // UI Updates
                        musicBtn.style.opacity = '0';
                        equalizerContainer.classList.add('playing');

                        // Start Particles
                        particleInterval = setInterval(createParticle, 400); // New particle every 400ms

                        currentAudio = audio;
                        slide._particleInterval = particleInterval; // Store ref
                    } else {
                        audio.pause();

                        // UI Updates
                        musicBtn.style.opacity = '1';
                        equalizerContainer.classList.remove('playing');

                        // Stop Particles
                        clearInterval(particleInterval);
                        particleContainer.innerHTML = ''; // Clear existing

                        currentAudio = null;
                        slide._particleInterval = null;
                    }
                };

                musicBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleMusic();
                });

                // Clicking equalizer also toggles
                equalizerContainer.addEventListener('click', (e) => {
                    // Since pointer-events is none on container, this might not fire unless we specific allow it.
                    // Actually style says pointer-events: none. So click passes through to gestureZone. 
                    // GestureZone handles toggle. So we good.
                });

                // Also toggle on image click (handled globally by gestureZone now mostly, but keep explicit if needed)
                // mediaEl.addEventListener('click', () => { ... }); REMOVE this as gestureZone handles clicks now.

                slide.dataset.hasMusic = 'true';
                slide._audio = audio;
                slide._musicBtn = musicBtn;
                slide._equalizer = equalizerContainer;
                slide._particleContainer = particleContainer;
            }

            if (quote) {
                const quoteDiv = document.createElement('div');
                quoteDiv.classList.add('quote-overlay');
                quoteDiv.innerHTML = `
                    <span class="quote-icon">❝</span>
                    <p class="quote-text">${quote}</p>
                `;
                slide.appendChild(quoteDiv);
            }

            sliderWrapper.appendChild(slide);
        });

        // Inject indicators
        images.forEach((_, index) => {
            const ind = document.createElement('div');
            ind.classList.add('indicator');
            if (index === 0) ind.classList.add('active');
            sliderIndicators.appendChild(ind);
        });

        updateSlidePosition();
    }

    // Update Slide Logic
    function updateSlidePosition() {
        sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update indicators
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((ind, idx) => {
            if (idx === currentIndex) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });

        // Handle Audio Stopping
        // Pause audio if we move away from a slide that has it playing
        const slides = document.querySelectorAll('.slide');
        slides.forEach((s, idx) => {
            if (idx !== currentIndex && s._audio && !s._audio.paused) {
                s._audio.pause();
                s._audio.currentTime = 0; // Reset
                if (s._musicBtn) s._musicBtn.style.opacity = '1';
                if (s._equalizer) s._equalizer.classList.remove('playing');
                if (s._particleInterval) clearInterval(s._particleInterval);
                if (s._particleContainer) s._particleContainer.innerHTML = '';
            }
        });
    }

    function nextSlide() {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateSlidePosition();
        } else {
            // Optional: Bounce effect at end
            bounceEffect('right');
        }
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlidePosition();
        } else {
            // Optional: Bounce effect at start
            bounceEffect('left');
        }
    }

    function bounceEffect(direction) {
        // Simple visual feedback when no more slides
        const x = direction === 'right' ? -((currentIndex * 100) + 5) : -((currentIndex * 100) - 5);
        sliderWrapper.style.transform = `translateX(${x}%)`;
        setTimeout(() => {
            sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 300);
    }

    // Swipe Logic
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const threshold = 50; // Minimum swipe distance

    // Touch Events
    gestureZone.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        // Remove transition for direct 1:1 movement feels
        sliderWrapper.style.transition = 'none';
        currentX = startX; // Initialize
    }, { passive: true });

    gestureZone.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        // Live drag effect
        const visualTranslate = -(currentIndex * 100) + (diff / window.innerWidth * 100);
        sliderWrapper.style.transform = `translateX(${visualTranslate}%)`;
    }, { passive: true });

    gestureZone.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        sliderWrapper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        const diff = currentX - startX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            // Snap back
            updateSlidePosition();
        }
    });

    // Mouse Events for Desktop Testing
    gestureZone.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
        sliderWrapper.style.transition = 'none';
        currentX = startX;
    });

    gestureZone.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent selection
        currentX = e.clientX;
        const diff = currentX - startX;
        // Rough estimate for desktop width pixel to percent
        const containerWidth = sliderWrapper.parentElement.clientWidth;
        const visualTranslate = -(currentIndex * 100) + (diff / containerWidth * 100);
        sliderWrapper.style.transform = `translateX(${visualTranslate}%)`;
    });

    gestureZone.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        sliderWrapper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        const diff = currentX - startX;
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        } else {
            updateSlidePosition();
        }
    });

    gestureZone.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            sliderWrapper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            updateSlidePosition();
        }
    });

    // Tap to advance (right side) or go back (left side) logic - similar to Instagram/Snapchat
    // NOTE: Confusing if mixed with swipe. Disabling for now to focus on swipe as per request "ability to swipe".
    // Uncomment if requested.

    // Button Listeners
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent gesture zone interference? No, they are separate siblings now?
        // Actually, the button is 'above' the gesture zone in z-index, so it should catch the click.
        prevSlide();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
    });

    // Handle Tap/Click on Gesture Zone for Media Toggle
    gestureZone.addEventListener('click', (e) => {
        // Distinguish click from swipe
        // We can check if distance moved was negligible
        // Or rely on the fact that if it was a distinct swipe, we handled it?
        // Actually, simple way: reset currentX = startX on click?
        // Let's use the tracked positions.
        const diff = Math.abs(currentX - startX);
        if (diff < 10) { // Tolerance for "tap"
            // Toggle functionality for current slide
            const currentSlide = document.querySelectorAll('.slide')[currentIndex];

            // Video Toggle
            const video = currentSlide.querySelector('video');
            if (video) {
                const btn = currentSlide.querySelector('.play-button');
                if (video.paused) {
                    video.play();
                    if (btn) btn.style.opacity = '0';
                } else {
                    video.pause();
                    if (btn) btn.style.opacity = '1';
                }
            }

            // Music Toggle
            if (currentSlide.dataset.hasMusic === 'true' && currentSlide._audio) {
                const audio = currentSlide._audio;
                const btn = currentSlide._musicBtn;
                const eq = currentSlide._equalizer;
                const pContainer = currentSlide._particleContainer;

                if (audio.paused) {
                    // Stop others
                    if (currentAudio && currentAudio !== audio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                    }
                    audio.play().catch(e => console.log('Audio error', e));
                    if (btn) btn.style.opacity = '0';
                    if (eq) eq.classList.add('playing');

                    // Start particles
                    currentSlide._particleInterval = setInterval(() => {
                        const particle = document.createElement('div');
                        particle.classList.add('music-particle');
                        const emojis = ['🎵', '🎶', '💸', '💰', '🧠', '📈', '⏳', '✨', '💿', '🕶️', '💎', '🧢', '👟', '🔥'];
                        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                        particle.style.left = Math.random() * 100 + '%';
                        const size = 20 + Math.random() * 20;
                        particle.style.fontSize = `${size}px`;
                        particle.style.animationDuration = (2 + Math.random() * 2) + 's';
                        pContainer.appendChild(particle);
                        setTimeout(() => particle.remove(), 4000);
                    }, 400);

                    currentAudio = audio;
                } else {
                    audio.pause();
                    if (btn) btn.style.opacity = '1';
                    if (eq) eq.classList.remove('playing');

                    // Stop particles
                    if (currentSlide._particleInterval) clearInterval(currentSlide._particleInterval);
                    if (pContainer) pContainer.innerHTML = '';

                    currentAudio = null;
                }
            }
        }
    });

    // Run
    init();
    window.goToSlide = goToSlide;
});
