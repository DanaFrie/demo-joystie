// scripts/clean.js - FINAL VERSION

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
            if (i === 1) screen.classList.add('active');
        }
    }
}

// --- Navigation Functions ---
function startAutoTransition() {
    autoTransitionTimeout = setTimeout(() => {
        if (currentScreen === 1) nextScreen();
    }, 3000);
}

function nextScreen() {
    if (currentScreen < totalScreens) moveToScreen(currentScreen + 1);
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
    if (activeSegment) activeSegment.classList.add('active');
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
    if (trackWidth === 0) return;
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

// --- Carousel Logic ---
let carouselInitialized = false;
let carouselTrack = null;
let carouselCards = [];
let cardWidth = 0;
let currentIndex = 0;
let startX = 0;
let isDragging = false;

function initializeCarousel() {
    if (carouselInitialized) return;
    const track = document.querySelector('.s7-carousel-track');
    if (!track) return;
    const cards = Array.from(track.children);
    if (cards.length === 0) return;

    const style = window.getComputedStyle(cards[0]);
    const marginLeft = parseInt(style.marginLeft, 10) || 0;
    const calculatedWidth = cards[0].offsetWidth + marginLeft;

    if (calculatedWidth === marginLeft) return; // Don't initialize if width is 0
    
    carouselInitialized = true;
    carouselTrack = track;
    carouselCards = cards;
    cardWidth = calculatedWidth;
}

function setupCarousel() {
    const carouselContainer = document.querySelector('.s7-carousel');
    if (!carouselContainer) return;

    const onTouchStart = (event) => {
        if (!carouselInitialized) return;
        isDragging = true;
        startX = event.touches[0].clientX;
        carouselTrack.style.transition = 'none';
    };

    const onTouchMove = (event) => {
        if (!isDragging) return;
        const currentX = event.touches[0].clientX;
        const diff = currentX - startX;
        // The visual movement should feel natural, so we still move the track to the LEFT to reveal the next card
        const currentDragPosition = -currentIndex * cardWidth - diff;
        carouselTrack.style.transform = `translateX(${currentDragPosition}px)`;
    };

    const onTouchEnd = (event) => {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = event.changedTouches[0].clientX;
        const diff = endX - startX;

        // --- THE ONLY CHANGE IS HERE ---
        // We now check for a swipe from RIGHT to LEFT (negative diff) to advance
        if (diff < -75 && currentIndex < carouselCards.length - 1) {
            currentIndex++;
        }
        
        const newPosition = -currentIndex * cardWidth;
        carouselTrack.style.transition = 'transform 0.4s ease-in-out';
        carouselTrack.style.transform = `translateX(${newPosition}px)`;
    };

    carouselContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    carouselContainer.addEventListener('touchmove', onTouchMove, { passive: true });
    carouselContainer.addEventListener('touchend', onTouchEnd);
}


// --- Touch & Keyboard Support for screen navigation ---
function setupTouchSupport() {
    let startX = 0;
    document.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener('touchend', e => {
        if (e.target.closest('.s7-carousel')) return;
        const diffX = startX - e.changedTouches[0].clientX;
        if (diffX > 50) {
            if (currentScreen !== 7) nextScreen();
        }
    }, { passive: true });
}

function setupKeyboardSupport() {
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' || e.key === ' ') {
            if (currentScreen !== 7) nextScreen();
        }
    });
}

// --- Global Functions ---
window.nextScreen = nextScreen;
window.moveToScreen = moveToScreen;