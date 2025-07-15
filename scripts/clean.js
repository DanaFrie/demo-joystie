// App State
let currentScreen = 1;
const totalScreens = 7;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Make sure only screen 1 is visible
    for (let i = 1; i <= totalScreens; i++) {
        const screen = document.getElementById(`screen${i}`);
        if (screen) {
            if (i === 1) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        }
    }
    
    updateProgress();
    setupForm();
    
    // Auto advance from screen 1 after 3 seconds
    setTimeout(() => {
        if (currentScreen === 1) {
            nextScreen();
        }
    }, 3000);
});

// Navigation
function nextScreen() {
    if (currentScreen < totalScreens) {
        // Track button click
        if (window.eventTracker) {
            const buttonText = event.target.textContent;
            window.eventTracker.trackButtonClick(buttonText, currentScreen);
        }
        
        // Hide current screen
        const currentScreenEl = document.getElementById(`screen${currentScreen}`);
        if (currentScreenEl) {
            currentScreenEl.classList.remove('active');
        }
        
        // Move to next screen
        currentScreen++;
        
        // Track screen visit
        if (window.eventTracker) {
            window.eventTracker.trackScreenVisit(currentScreen);
            
            // Special tracking for screen 6
            if (currentScreen === 6) {
                window.eventTracker.trackScreen6Visit();
            }
            
            // Track app completion
            if (currentScreen === 7) {
                window.eventTracker.trackAppComplete();
            }
        }
        
        // Show new screen
        const nextScreenEl = document.getElementById(`screen${currentScreen}`);
        if (nextScreenEl) {
            nextScreenEl.classList.add('active');
        }
        
        updateProgress();
        console.log(`Moved to screen ${currentScreen}`);
    }
}

function moveToScreen() {
    // Hide all screens
    for (let i = 1; i <= totalScreens; i++) {
        const screen = document.getElementById(`screen${i}`);
        if (screen) {
            screen.classList.remove('active');
        }
    }
    
    // Show current screen
    const currentScreenEl = document.getElementById(`screen${currentScreen}`);
    if (currentScreenEl) {
        currentScreenEl.classList.add('active');
    }
}

function updateProgress() {
    const progressBar = document.querySelector('.progress-bar::before') || 
                      document.querySelector('.progress-bar');
    const progressText = document.getElementById('progressText');
    
    const percentage = (currentScreen / totalScreens) * 100;
    
    // Update progress bar
    if (progressBar) {
        progressBar.style.setProperty('--progress', `${percentage}%`);
    }
    
    // Update text
    if (progressText) {
        progressText.textContent = `${currentScreen} / ${totalScreens}`;
    }
    
    // Update CSS custom property for progress bar
    document.documentElement.style.setProperty('--progress-width', `${percentage}%`);
}

// Form Handling - Removed (now in registration.js)
function setupForm() {
    // Form logic moved to registration.js
    console.log('Form setup handled by registration.js');
}

async function handleFormSubmit(e) {
    // Form handling moved to registration.js
    console.log('Form handling moved to registration.js');
}

// Touch/Swipe Support
let startX = 0;
let startY = 0;

document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const diffX = startX - endX;
    const diffY = startY - endY;
    
    // Swipe left (next screen)
    if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
        if (currentScreen < 6) { // Don't swipe past form screen
            nextScreen();
        }
    }
});

// Keyboard Support
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'Space') {
        if (currentScreen < 6) { // Don't skip form
            nextScreen();
        }
    }
});

// Debug function
window.getCurrentScreen = () => currentScreen;
window.goToScreen = (screen) => {
    if (screen >= 1 && screen <= totalScreens) {
        currentScreen = screen;
        moveToScreen();
        updateProgress();
    }
};