// scripts/clean.js - FINAL AND ROBUST VERSION

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
    // We only set up the carousel listeners here, we don't initialize it yet.
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
        // --- KEY CHANGE ---
        // If we are moving to screen 7, initialize the carousel NOW.
        // This guarantees it's visible and has correct dimensions.
        if (nextScreenEl.id === 'screen7') {
            initializeCarousel();
        }
    }

    updateProgressBar(currentScreen);
}

// --- Progress Bar Update ---
function updateProgressBar(screenIndex) {
    if (screenIndex <= 1) return;
    const screenElement = document.getElementById(`screen${screenIndex}`);
    if (!screenElement) return;

    const allSegments = screenElement.querySelectorAll('.progress-segment');
    allSegments.forEach(seg => seg.classList.remove('active'));

    const activeSegment = screenElement.querySelector(`.progress-segment:nth-child(${screenIndex - 1})`);
    if (activeSegment) {
        activeSegment.classList.add('active');
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

// --- Carousel Logic (Completely Rewritten) ---
// State variables for the carousel, defined globally within the script
let carouselState = {
    initialized: false,
    track: null,
    cards: [],
    cardWidth: 0,
    currentIndex: 0,
    startX: 0,
    isDragging: false,
};

// This function only runs ONCE when screen 7 becomes visible
function initializeCarousel() {
    // Prevent running this more than once
    if (carouselState.initialized) return;

    const track = document.querySelector('.s7-carousel-track');
    const cards = Array.from(track.children);

    if (!track || cards.length === 0) return;

    // Now we can be SURE the card has a real width
    const style = window.getComputedStyle(cards[0]);
    const marginLeft = parseInt(style.marginLeft, 10) || 0;
    const cardWidth = cards[0].offsetWidth + marginLeft;

    // Update the global state
    carouselState = {
        ...carouselState,
        initialized: true,
        track: track,
        cards: cards,
        cardWidth: cardWidth,
    };
    console.log('Carousel Initialized with card width:', cardWidth);
}

// This function just sets up the listeners on page load
function setupCarousel() {
    const carouselContainer = document.querySelector('.s7-carousel');
    if (!carouselContainer) return;

    const onTouchStart = (event) => {
        if (!carouselState.initialized || carouselState.isDragging) return;
        carouselState.isDragging = true;
        carouselState.startX = event.touches[0].clientX;
        carouselState.track.style.transition = 'none';
    };

    const onTouchMove = (event) => {
        if (!carouselState.isDragging) return;
        const currentX = event.touches[0].clientX;
        const diff = currentX - carouselState.startX;
        const currentDragPosition = -carouselState.currentIndex * carouselState.cardWidth + diff;
        carouselState.track.style.transform = `translateX(${currentDragPosition}px)`;
    };

    const onTouchEnd = (event) => {
        if (!carouselState.isDragging) return;
        carouselState.isDragging = false;
        
        const endX = event.changedTouches[0].clientX;
        const diff = endX - carouselState.startX;

        // Swipe Right (forward)
        if (diff < -75 && carouselState.currentIndex < carouselState.cards.length - 1) {
            carouselState.currentIndex++;
        }
        
        // Snap to the correct position
        const newPosition = -carouselState.currentIndex * carouselState.cardWidth;
        carouselState.track.style.transition = 'transform 0.4s ease-in-out';
        carouselState.track.style.transform = `translateX(${newPosition}px)`;
    };

    carouselContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    carouselContainer.addEventListener('touchmove', onTouchMove, { passive: true });
    carouselContainer.addEventListener('touchend', onTouchEnd);
}

// --- Touch & Keyboard Support for screen navigation ---
function setupTouchSupport() {
    let startX = 0;
    document.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    document.addEventListener('touchend', e => {
        // Only navigate if not interacting with the carousel
        if (e.target.closest('.s7-carousel')) return;

        const diffX = startX - e.changedTouches[0].clientX;
        if (diffX > 50) { // Swipe left to go to next screen
            if (currentScreen !== 7) {
                nextScreen();
            }
        }
    }, { passive: true });
}

function setupKeyboardSupport() {
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === ' ') {
            if (currentScreen !== 7) {
                nextScreen();
            }
        }
    });
}

// --- Global Functions ---
window.nextScreen = nextScreen;
window.moveToScreen = moveToScreen;