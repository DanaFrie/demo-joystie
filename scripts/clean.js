// scripts/clean.js - FINAL POLISHED VERSION

// --- App State ---
let currentScreen = 1;
const totalScreens = 7;
let autoTransitionTimeout;

// --- Main Initializer ---
document.addEventListener('DOMContentLoaded', function() {
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

// --- Navigation Functions (UPDATED for Video Control) ---
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

function moveToScreen(screenNumber) {
    if (screenNumber < 1 || screenNumber > totalScreens) return;

    clearTimeout(autoTransitionTimeout);

    const currentScreenEl = document.getElementById(`screen${currentScreen}`);
    if (currentScreenEl) {
        currentScreenEl.classList.remove('active');
        // VIDEO FIX: Pause video if we are leaving screen 5
        if (currentScreenEl.id === 'screen5') {
            const video = currentScreenEl.querySelector('.animation-video');
            if (video) video.pause();
        }
    }

    currentScreen = screenNumber;
    const nextScreenEl = document.getElementById(`screen${currentScreen}`);
    if (nextScreenEl) {
        nextScreenEl.classList.add('active');
        // VIDEO FIX: Play video if we are entering screen 5
        if (nextScreenEl.id === 'screen5') {
            const video = nextScreenEl.querySelector('.animation-video');
            if (video) {
                video.currentTime = 0; // Rewind video to the start
                video.play();
            }
        }
    }

    updateProgressBar(currentScreen);
}

// --- Progress Bar Update ---
function updateProgressBar(screenIndex) {
    document.querySelectorAll('.progress-segment').forEach(seg => seg.classList.remove('active'));
    
    if (screenIndex > 1) {
        const screenElement = document.getElementById(`screen${screenIndex}`);
        if (screenElement) {
            const activeSegment = screenElement.querySelector(`.progress-segment:nth-child(${screenIndex - 1})`);
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
            const changedSlider = event.target;
            updateSliderVisuals(changedSlider);
            handleSliderDependency(changedSlider);
        });
    });
}

function updateSliderVisuals(slider) {
    const valueElement = document.getElementById(slider.dataset.valueId);
    if (!valueElement) return;

    const currentValue = parseFloat(slider.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    
    valueElement.innerText = Math.round(currentValue);

    const thumbWidth = 28;
    const trackWidth = slider.offsetWidth;
    const percentage = (currentValue - min) / (max - min);
    const thumbPosition = percentage * (trackWidth - thumbWidth) + (thumbWidth / 2);
    valueElement.style.left = `${thumbPosition}px`;

    const colorStop = `linear-gradient(to right, #E6F19A ${percentage * 100}%, rgba(0, 0, 0, 0.1) ${percentage * 100}%)`;
    slider.style.background = colorStop;
}

function handleSliderDependency(changedSlider) {
    const pocketMoneySlider = document.getElementById('pocketMoney');
    const screenTimeSlider = document.getElementById('screenTime');
    if (!pocketMoneySlider || !screenTimeSlider) return;

    const changedPercentage = (changedSlider.value - changedSlider.min) / (changedSlider.max - changedSlider.min);
    const inversePercentage = 1 - changedPercentage;

    if (changedSlider.id === 'pocketMoney') {
        const newScreenTime = inversePercentage * (screenTimeSlider.max - screenTimeSlider.min);
        screenTimeSlider.value = newScreenTime;
        updateSliderVisuals(screenTimeSlider);
    } else if (changedSlider.id === 'screenTime') {
        const newPocketMoney = inversePercentage * (pocketMoneySlider.max - pocketMoneySlider.min);
        pocketMoneySlider.value = newPocketMoney;
        updateSliderVisuals(pocketMoneySlider);
    }
}

// --- Carousel (UPDATED for Forward-Only Swipe) ---
function setupCarousel() {
    const track = document.querySelector('.s7-carousel-track');
    if (!track) return;

    const cards = Array.from(track.children);
    const cardWidth = cards[0].offsetWidth + 20; // Card width + margin
    let currentIndex = 0;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    const setCardPosition = () => {
        currentTranslate = -currentIndex * cardWidth;
        track.style.transform = `translateX(${currentTranslate}px)`;
    };

    const touchStart = (event) => {
        startX = event.touches[0].clientX;
        track.style.transition = 'none'; // Disable transition during drag
    };

    const touchMove = (event) => {
        const currentX = event.touches[0].clientX;
        const diff = currentX - startX;
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
    };

    const touchEnd = () => {
        const movedBy = currentTranslate - prevTranslate;
        // Only allow swiping left (forward)
        if (movedBy < -75 && currentIndex < cards.length - 1) {
            currentIndex++;
        }
        
        prevTranslate = -currentIndex * cardWidth;
        track.style.transition = 'transform 0.4s ease-in-out';
        track.style.transform = `translateX(${prevTranslate}px)`;
    };

    track.addEventListener('touchstart', touchStart, { passive: true });
    track.addEventListener('touchmove', touchMove, { passive: true });
    track.addEventListener('touchend', touchEnd);
}


// --- Touch & Keyboard Support (UPDATED for Forward-Only) ---
function setupTouchSupport() {
    let startX = 0;
    document.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    document.addEventListener('touchend', e => {
        const diffX = startX - e.changedTouches[0].clientX;
        // Swipe from right-to-left (positive diffX) to go next
        if (diffX > 50 && currentScreen < 7) {
            nextScreen();
        }
    }, { passive: true });
}

function setupKeyboardSupport() {
    document.addEventListener('keydown', e => {
        if ((e.key === 'ArrowLeft' || e.key === ' ') && currentScreen < 7) {
            nextScreen();
        }
    });
}

// --- Global Functions ---
window.nextScreen = nextScreen;
window.moveToScreen = moveToScreen;