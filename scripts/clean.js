

// --- App State (No Changes) ---
let currentScreen = 1;
const totalScreens = 7;
let autoTransitionTimeout;

// --- Main Initializer (No Changes) ---
document.addEventListener('DOMContentLoaded', function() {
    // Note: We are removing obsolete references to a global 'progressContainer'
    setupScreens();
    startAutoTransition();
    setupTouchSupport();
    setupKeyboardSupport();
    setupForm();
    setupSliders(); 
    
    updateProgressBar(1);
});

// --- Screen Setup (No Changes) ---
function setupScreens() {
    for (let i = 1; i <= totalScreens; i++) {
        const screen = document.getElementById(`screen${i}`);
        if (screen) {
            screen.classList.add('screen-transition'); // Helper class for transitions
            if (i === 1) {
                screen.classList.add('active');
            }
        }
    }
}

// --- Navigation Functions (Simplified) ---
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

function previousScreen() {
    // We don't allow going back from screen 2 to the splash screen
    if (currentScreen > 2) {
        moveToScreen(currentScreen - 1);
    }
}

function moveToScreen(screenNumber) {
    if (screenNumber < 1 || screenNumber > totalScreens) return;

    clearTimeout(autoTransitionTimeout);

    const currentScreenEl = document.getElementById(`screen${currentScreen}`);
    if (currentScreenEl) {
        currentScreenEl.classList.remove('active');
    }

    currentScreen = screenNumber;
    const nextScreenEl = document.getElementById(`screen${currentScreen}`);
    if (nextScreenEl) {
        nextScreenEl.classList.add('active');
    }

    updateProgressBar(currentScreen);
    
    // Optional: Add tracking logic here if needed
}


// --- Progress Bar Update (FIXED for RTL) ---
function updateProgressBar(screenIndex) {
    const totalSegments = 6; // Screens 2 through 7 have a progress bar

    document.querySelectorAll('.progress-segment').forEach(segment => {
        segment.classList.remove('active');
    });

    if (screenIndex > 1) {
        const screenElement = document.getElementById(`screen${screenIndex}`);
        if (screenElement) {
            // **FIX:** This logic correctly selects the segment for RTL layouts
            const activeSegment = screenElement.querySelector(`.progress-segment:nth-child(${screenIndex - 1})`);
            if (activeSegment) {
                activeSegment.classList.add('active');
            }
        }
    }
}


// --- Sliders (FIXED Alignment & NEW Dependency) ---
function setupSliders() {
    const sliders = document.querySelectorAll('.interactive-slider');

    sliders.forEach(slider => {
        updateSliderVisuals(slider); // Set initial state
        
        slider.addEventListener('input', (event) => {
            const changedSlider = event.target;
            updateSliderVisuals(changedSlider);
            // **NEW:** Handle the dependency between sliders
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
    
    // 1. Update the text in the value bubble
    valueElement.innerText = Math.round(currentValue);

    // **FIX:** This new calculation perfectly centers the bubble over the thumb
    const thumbWidth = 28; // As defined in your CSS
    const trackWidth = slider.offsetWidth;
    const percentage = (currentValue - min) / (max - min);
    const thumbPosition = percentage * (trackWidth - thumbWidth) + (thumbWidth / 2);
    valueElement.style.left = `${thumbPosition}px`;

    // 3. Update the background "fill" of the slider track
    const fillPercentage = percentage * 100;
    const colorStop = `linear-gradient(to right, #E6F19A ${fillPercentage}%, rgba(0, 0, 0, 0.1) ${fillPercentage}%)`;
    slider.style.background = colorStop;
}

// **NEW:** This function creates the negative dependency
function handleSliderDependency(changedSlider) {
    const pocketMoneySlider = document.getElementById('pocketMoney');
    const screenTimeSlider = document.getElementById('screenTime');

    if (!pocketMoneySlider || !screenTimeSlider) return;

    // Calculate the inverse percentage
    const changedPercentage = (changedSlider.value - changedSlider.min) / (changedSlider.max - changedSlider.min);
    const inversePercentage = 1 - changedPercentage;

    if (changedSlider.id === 'pocketMoney') {
        // Update the screen time slider
        const newScreenTime = inversePercentage * (screenTimeSlider.max - screenTimeSlider.min);
        screenTimeSlider.value = newScreenTime;
        updateSliderVisuals(screenTimeSlider);
    } else if (changedSlider.id === 'screenTime') {
        // Update the pocket money slider
        const newPocketMoney = inversePercentage * (pocketMoneySlider.max - pocketMoneySlider.min);
        pocketMoneySlider.value = newPocketMoney;
        updateSliderVisuals(pocketMoneySlider);
    }
}


function setupTouchSupport() {
    let startX = 0;
    document.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    document.addEventListener('touchend', e => {
        const diffX = startX - e.changedTouches[0].clientX;
        if (diffX > 50) nextScreen();
        else if (diffX < -50) previousScreen();
    }, { passive: true });
}

function setupKeyboardSupport() {
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') previousScreen();
        if (e.key === 'ArrowLeft' || e.key === ' ') nextScreen();
    });
}

function setupForm() {
    const form = document.getElementById('registrationForm');
    if (form) form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    // Add loading visuals...
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    
    nextScreen(); // Move to success screen
    
    submitBtn.disabled = false;
    // Remove loading visuals...
}

// --- Global Functions for Debugging (No Changes) ---
window.nextScreen = nextScreen;
window.previousScreen = previousScreen;
window.moveToScreen = moveToScreen;