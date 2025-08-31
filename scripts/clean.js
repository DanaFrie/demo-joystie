// scripts/clean.js

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
    initializeControls(); 
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
    const totalSegments = 6; 
    if (screenIndex > 1) {
        const screenElement = document.getElementById(`screen${screenIndex}`);
        if (screenElement) {
            const activeSegment = screenElement.querySelector(`.progress-segment:nth-child(${screenIndex - 1})`);
            // First, clear all segments on the current screen
            screenElement.querySelectorAll('.progress-segment').forEach(seg => seg.classList.remove('active'));
            // Then, activate the correct one
            if (activeSegment) {
                activeSegment.classList.add('active');
            }
        }
    }
}

// --- Control Initialization ---

function initializeControls() {
    const controls = document.querySelectorAll('.interactive-slider');
    controls.forEach(control => {
        updateControlUI(control); // קובע את המראה הראשוני
        control.addEventListener('input', (event) => {
            const activeControl = event.target;
            updateControlUI(activeControl);
            syncControls(activeControl);
        });
    });
}

/**
 * מעדכן את המראה הוויזואלי של רכיב שליטה בודד.
 * מזיז את תצוגת הערך ומעדכן את צבע הרקע של המסילה.
 * @param {HTMLElement} control - רכיב השליטה שיש לעדכן.
 */
function updateControlUI(control) {
    const displayEl = document.getElementById(control.dataset.valueId);
    if (!displayEl) return;

    const val = parseFloat(control.value);
    const min = parseFloat(control.min);
    const max = parseFloat(control.max);
    
    if (control.dataset.format === 'decimal') {
        displayEl.innerText = val.toFixed(1);
    } else {
        displayEl.innerText = Math.round(val);
    }
    
    const thumbWidth = 28;
    const trackWidth = control.offsetWidth;
    const percentage = (max - min) === 0 ? 0 : (val - min) / (max - min);
    
    const thumbPosition = percentage * (trackWidth - thumbWidth);
    displayEl.style.right = `${thumbPosition}px`;
    displayEl.style.left = 'auto';

    const colorStop = `linear-gradient(to left, #E6F19A ${percentage * 100}%, rgba(0, 0, 0, 0.1) ${percentage * 100}%)`;
    control.style.background = colorStop;
}

/**
 * מסנכרן את הערך של רכיב שליטה אחד בהתבסס על השינוי באחר,
 * תוך שימוש בנוסחת "תשואה פוחתת" (חזקה ריבועית).
 * @param {HTMLElement} activeControl - הרכיב שהמשתמש שינה כרגע.
 */
function syncControls(activeControl) {
  // יש לוודא שה-IDs ב-HTML תואמים
  const controlA = document.getElementById('controlA');
  const controlB = document.getElementById('controlB');

  if (!controlA || !controlB) return;

  const normalizedValue = (activeControl.value - activeControl.min) / (activeControl.max - activeControl.min);

  const inverseValue = 1 - Math.pow(normalizedValue, 2);

  const targetControl = (activeControl.id === 'controlA') ? controlB : controlA;
  
  const newTargetValue = inverseValue * (targetControl.max - targetControl.min) + targetControl.min;

  targetControl.value = newTargetValue;

  updateControlUI(targetControl);
}


// --- Carousel (UPDATED for Bidirectional Swipe) ---
function setupCarousel() {
    const track = document.querySelector('.s7-carousel-track');
    if (!track) return;

    const cards = Array.from(track.children);
    if (cards.length === 0) return; // Prevent errors if no cards
    
    const cardWidth = cards[0].offsetWidth + 20; // Card width + margin
    let currentIndex = 0;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;

    // Set initial position
    prevTranslate = -currentIndex * cardWidth;
    track.style.transform = `translateX(${prevTranslate}px)`;

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
        
        // Swipe left (forward)
        if (movedBy < -75 && currentIndex < cards.length - 1) {
            currentIndex++;
        } 
        // Swipe right (backward)
        else if (movedBy > 75 && currentIndex > 0) {
            currentIndex--;
        }
        
        prevTranslate = -currentIndex * cardWidth;
        track.style.transition = 'transform 0.4s ease-in-out';
        track.style.transform = `translateX(${prevTranslate}px)`;
    };

    track.addEventListener('touchstart', touchStart, { passive: true });
    track.addEventListener('touchmove', touchMove, { passive: true });
    track.addEventListener('touchend', touchEnd);
}


function setupTouchSupport() {
    let startX = 0;
    document.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    document.addEventListener('touchend', e => {
        const diffX = startX - e.changedTouches[0].clientX;
        
        // Check for a left swipe
        if (diffX > 50) {
            // MODIFIED: Only advance if not on screens 4, 6, or 7
            if (currentScreen !== 4 && currentScreen !== 6 && currentScreen !== 7) {
                nextScreen();
            }
        }
    }, { passive: true });
}

function setupKeyboardSupport() {
    document.addEventListener('keydown', e => {
        // Check for forward navigation keys
        if (e.key === 'ArrowLeft' || e.key === ' ') {
            // MODIFIED: Only advance if not on screens 4, 6, or 7
            if (currentScreen !== 4 && currentScreen !== 6 && currentScreen !== 7) {
                nextScreen();
            }
        }
    });
}

// --- Global Functions ---
window.nextScreen = nextScreen;
window.moveToScreen = moveToScreen;