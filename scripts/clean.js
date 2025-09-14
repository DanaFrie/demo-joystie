// scripts/clean.js

// --- App State ---
let isSliderInteraction = false;
let currentScreen = 1;
const totalScreens = 7;
let autoTransitionTimeout;

// --- Main Initializer ---
document.addEventListener('DOMContentLoaded', function() {
    // --- Main App Setup ---
    setupScreens();
    startAutoTransition();
    setupTouchSupport();
    setupKeyboardSupport();
    setupSliders();
    setupCarousel();

    if (window.registrationManager) {
        window.registrationManager.init();
    }
    updateProgressBar(1);

    // --- Email Copy Link Setup ---
    const emailLink = document.getElementById('copyEmailLink');
    if (emailLink) {
        const emailSpan = emailLink.querySelector('span');
        const emailAddress = emailSpan.dataset.email;
        const originalText = emailSpan.textContent;

        emailLink.addEventListener('click', (event) => {
            event.preventDefault();
            navigator.clipboard.writeText(emailAddress).then(() => {
                emailSpan.textContent = 'הועתק!';
                setTimeout(() => {
                    emailSpan.textContent = originalText;
                }, 1300);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    // --- Share Copy Link Setup ---
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        const shareSpan = shareLink.querySelector('span');
        const originalText = shareSpan.textContent;
        const linkToCopy = shareLink.dataset.linkToCopy;

        shareLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevents the link from navigating
            navigator.clipboard.writeText(linkToCopy).then(() => {
                shareSpan.textContent = 'הועתק!';
                setTimeout(() => {
                    shareSpan.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy link: ', err);
                shareSpan.textContent = 'שגיאה בהעתקה';
                 setTimeout(() => {
                    shareSpan.textContent = originalText;
                }, 2000);
            });
        });
    }
});


// --- Screen Setup ---
function setupScreens() {
    for (let i = 1; i <= totalScreens; i++) {
        const screen = document.getElementById(`screen${i}`);
        if (screen) {
            if (i === 1) {
                screen.classList.add('active');
            }
        }
    }
}

// --- Navigation Functions ---
function startAutoTransition() {
    autoTransitionTimeout = setTimeout(() => {
        if (currentScreen === 1) {
            nextScreen();
        }
    }, 3000);
}

function nextScreen() {
    if (currentScreen < totalScreens) {
        moveToScreen(currentScreen + 1);
    }
}

function prevScreen() {
    if (currentScreen > 1) {
        moveToScreen(currentScreen - 1);
    }
}

function moveToScreen(screenNumber) {
    if (screenNumber < 1 || screenNumber > totalScreens) return;

    clearTimeout(autoTransitionTimeout);

    const currentScreenEl = document.getElementById(`screen${currentScreen}`);
    if (currentScreenEl) {
        currentScreenEl.classList.remove('active');
        if (currentScreenEl.id === 'screen5') {
            const video = currentScreenEl.querySelector('.animation-video');
            if (video) video.pause();
        }
    }

    currentScreen = screenNumber;
    const nextScreenEl = document.getElementById(`screen${currentScreen}`);
    if (nextScreenEl) {
        nextScreenEl.classList.add('active');
        if (nextScreenEl.id === 'screen5') {
            const video = nextScreenEl.querySelector('.animation-video');
            if (video) {
                video.currentTime = 0;
                video.play();
            }
        }

        if (nextScreenEl.id === 'screen6') {
            if (window.eventTracker) {
                window.eventTracker.trackScreen6Visit();
            }
        }
    }

    updateProgressBar(currentScreen);
}

// --- Progress Bar Update ---
function updateProgressBar(screenIndex) {
    if (screenIndex > 1) {
        const screenElement = document.getElementById(`screen${screenIndex}`);
        if (screenElement) {
            const activeSegment = screenElement.querySelector(`.progress-segment:nth-child(${screenIndex - 1})`);
            screenElement.querySelectorAll('.progress-segment').forEach(seg => seg.classList.remove('active'));
            if (activeSegment) {
                activeSegment.classList.add('active');
            }
        }
    }
}

// --- Sliders ---
function setupSliders() {
    const sliders = document.querySelectorAll('.interactive-slider');
    sliders.forEach(slider => {
        updateSliderVisuals(slider);
        slider.addEventListener('input', (event) => {
            updateSliderVisuals(event.target);
        });

        slider.addEventListener('touchstart', () => {
            isSliderInteraction = true;
        }, { passive: true });
    });
}

function updateSliderVisuals(slider) {
    const valueElement = document.getElementById(slider.dataset.valueId);
    if (!valueElement) return;

    const currentValue = parseFloat(slider.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);

    if (slider.id === 'screenTime') {
        valueElement.innerText = currentValue.toFixed(1);
    } else {
        valueElement.innerText = Math.round(currentValue);
    }

    const thumbWidth = 28;
    const trackWidth = slider.offsetWidth;
    const percentage = (max - min) === 0 ? 0 : (currentValue - min) / (max - min);
    const thumbPosition = percentage * (trackWidth - thumbWidth);
    valueElement.style.right = `${thumbPosition}px`;
    valueElement.style.left = 'auto';

    const colorStop = `linear-gradient(to left, #E6F19A ${percentage * 100}%, rgba(0, 0, 0, 0.1) ${percentage * 100}%)`;
    slider.style.background = colorStop;
}

// --- Carousel ---
function setupCarousel() {
    const track = document.querySelector('.s7-carousel-track');
    if (!track) return;
    const cards = Array.from(track.children);
    if (cards.length === 0) return;

    const cardWidth = cards[0].offsetWidth + 20;
    let currentIndex = cards.length - 1;
    let startX = 0, currentTranslate = 0, prevTranslate = -currentIndex * cardWidth;
    track.style.transform = `translateX(${prevTranslate}px)`;

    const touchStart = (event) => { startX = event.touches[0].clientX; track.style.transition = 'none'; };
    const touchMove = (event) => { const diff = event.touches[0].clientX - startX; currentTranslate = prevTranslate + diff; track.style.transform = `translateX(${currentTranslate}px)`; };
    const touchEnd = () => {
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy < -75 && currentIndex < cards.length - 1) { currentIndex++; }
        else if (movedBy > 75 && currentIndex > 0) { currentIndex--; }
        prevTranslate = -currentIndex * cardWidth;
        track.style.transition = 'transform 0.4s ease-in-out';
        track.style.transform = `translateX(${prevTranslate}px)`;
    };

    track.addEventListener('touchstart', touchStart, { passive: true });
    track.addEventListener('touchmove', touchMove, { passive: true });
    track.addEventListener('touchend', touchEnd);
}

// --- Touch & Keyboard Support ---

// ✨ UPDATED: Logic for handling screen 7 swiping
function setupTouchSupport() {
    let startX = 0;

    document.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    }, { passive: true });


    document.addEventListener('touchend', e => {
        // ✨ ADDED: Block all page-level swipes on the final screen
        if (currentScreen === 7) {
            return;
        }

        if (isSliderInteraction) {
            isSliderInteraction = false;
            return;
        }

        const diffX = startX - e.changedTouches[0].clientX;

        // Swipe Left (Forward in RTL)
        if (diffX > 50) {
            // Screen 7 is already blocked by the check above
            if (currentScreen !== 6) {
                nextScreen();
            }
        }
        // Swipe Right (Backward in RTL)
        else if (diffX < -50) {
            if (currentScreen > 1) {
                prevScreen();
            }
        }
    }, { passive: true });
}

// ✨ UPDATED: Logic for handling screen 7 keyboard navigation
function setupKeyboardSupport() {
    document.addEventListener('keydown', e => {
        // ✨ ADDED: Block all keyboard navigation on the final screen
        if (currentScreen === 7) {
            return;
        }

        if (e.key === 'ArrowLeft' || e.key === ' ') {
            // Screen 7 is already blocked by the check above
            if (currentScreen !== 6) {
                nextScreen();
            }
        }
        else if (e.key === 'ArrowRight') {
            if (currentScreen > 1) {
                prevScreen();
            }
        }
    });
}

// --- Global Functions ---
window.nextScreen = nextScreen;
window.prevScreen = prevScreen;
window.moveToScreen = moveToScreen;