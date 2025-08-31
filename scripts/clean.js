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

/**
 * מעדכן את המראה הוויזואלי של מחוון (slider).
 * תפקיד הפונקציה הזו הוא קוסמטי בלבד ואין צורך לשנות אותה.
 */
function updateSliderVisuals(slider) {
    const valueElement = document.getElementById(slider.dataset.valueId);
    if (!valueElement) return;

    const currentValue = parseFloat(slider.value);
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    
    // בודק אם זה המחוון של זמן המסך כדי לעצב את הטקסט
    if (slider.id === 'screenTime') {
        // מציג את הערך עם ספרה אחת אחרי הנקודה (לדוגמה: "2.5")
        valueElement.innerText = currentValue.toFixed(1);
    } else {
        // אחרת, מציג מספר מעוגל עבור דמי הכיס
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


/**
 * מעדכן את המחוון התלוי בהתבסס על המחוון שהשתנה.
 * משתמש בנוסחת "תשואה שולית פוחתת" (חזקה ושורש).
 */
function handleSliderDependency(changedSlider) {
    const pocketMoneySlider = document.getElementById('pocketMoney');
    const screenTimeSlider = document.getElementById('screenTime');
    if (!pocketMoneySlider || !screenTimeSlider) return;

    // --- לוגיקה חדשה ---
    if (changedSlider.id === 'pocketMoney') {
        // אם מזיזים את דמי הכיס, חשב את זמן המסך החדש
        const moneyPercentage = (changedSlider.value - changedSlider.min) / (changedSlider.max - changedSlider.min);
        
        // הנוסחה: אחוז הזמן = 1 פחות (אחוז הכסף בריבוע)
        const newScreenTimePercentage = 1 - Math.pow(moneyPercentage, 2);
        
        const newScreenTime = newScreenTimePercentage * (screenTimeSlider.max - screenTimeSlider.min) + parseFloat(screenTimeSlider.min);
        
        screenTimeSlider.value = newScreenTime;
        updateSliderVisuals(screenTimeSlider);

    } else if (changedSlider.id === 'screenTime') {
        // אם מזיזים את זמן המסך, חשב את דמי הכיס החדשים
        const screenTimePercentage = (changedSlider.value - changedSlider.min) / (changedSlider.max - changedSlider.min);

        // הנוסחה ההפוכה: אחוז הכסף = שורש של (1 פחות אחוז הזמן)
        const valueForSqrt = 1 - screenTimePercentage;
        const newMoneyPercentage = Math.sqrt(Math.max(0, valueForSqrt)); // Math.max מונע שורש למספר שלילי
        
        const newPocketMoney = newMoneyPercentage * (pocketMoneySlider.max - pocketMoneySlider.min) + parseFloat(pocketMoneySlider.min);

        pocketMoneySlider.value = newPocketMoney;
        updateSliderVisuals(pocketMoneySlider);
    }
}

// --- Carousel (UPDATED for Bidirectional Swipe) ---
function setupCarousel() {
    const track = document.querySelector('.s7-carousel-track');
    if (!track) return;

    const cards = Array.from(track.children);
    if (cards.length === 0) return; // Prevent errors if no cards
    
    const cardWidth = cards[0].offsetWidth + 20; // Card width + margin
     let currentIndex = cards.length - 1; 
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