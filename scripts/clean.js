// scripts/clean.js - Main navigation (aligned with separate progress.js)

// App State
let currentScreen = 1;
const totalScreens = 7;
let autoTransitionTimeout;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupScreens();
    startAutoTransition();
    setupTouchSupport();
    setupKeyboardSupport();
    setupForm();
    
    // Initial progress update (progress.js handles initialization)
    if (window.updateProgressBar) {
        window.updateProgressBar(1);
    }
});

// Setup initial screens state
function setupScreens() {
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
}

// Auto transition from screen 1 to screen 2 after 3 seconds
function startAutoTransition() {
    autoTransitionTimeout = setTimeout(() => {
        if (currentScreen === 1) {
            transitionToScreen2();
        }
    }, 3000);
}

// Special fade transition for screen 1 to screen 2
function transitionToScreen2() {
    const screen1 = document.getElementById('screen1');
    const screen2 = document.getElementById('screen2');
    const progressContainer = document.getElementById('progressContainer');
    
    // Start fade out of screen 1
    screen1.style.opacity = '0';
    
    setTimeout(() => {
        screen1.classList.remove('active');
        screen2.classList.add('active');
        currentScreen = 2;
        
        // Update progress using your progress.js function
        if (window.updateProgressBar) {
            window.updateProgressBar(currentScreen);
        }
        
        // Show progress bar after leaving screen 1
        progressContainer.classList.add('visible');
        
        // Track screen 2 visit if tracking is enabled
        if (window.eventTracker && window.eventTracker.trackScreenView) {
            window.eventTracker.trackScreenView(2);
        }
    }, 600);
}

// Main navigation function
function nextScreen() {
    if (currentScreen < totalScreens) {
        // Clear any pending auto transitions
        if (autoTransitionTimeout) {
            clearTimeout(autoTransitionTimeout);
        }
        
        // Hide current screen
        const currentScreenEl = document.getElementById(`screen${currentScreen}`);
        if (currentScreenEl) {
            currentScreenEl.classList.remove('active');
        }
        
        // Move to next screen
        currentScreen++;
        
        // Track screen 6 visit specifically if it exists
        if (currentScreen === 6 && window.eventTracker && window.eventTracker.trackScreen6Visit) {
            window.eventTracker.trackScreen6Visit();
        }
        
        // Show new screen with slight delay for smooth transition
        const nextScreenEl = document.getElementById(`screen${currentScreen}`);
        if (nextScreenEl) {
            setTimeout(() => {
                nextScreenEl.classList.add('active');
            }, 100);
        }
        
        // Update progress using your progress.js function
        if (window.updateProgressBar) {
            window.updateProgressBar(currentScreen);
        }
        
        // Track general screen view if tracking is enabled
        if (window.eventTracker && window.eventTracker.trackScreenView) {
            window.eventTracker.trackScreenView(currentScreen);
        }
        
        console.log(`Moved to screen ${currentScreen}`);
    }
}

// Previous screen navigation (optional)
function previousScreen() {
    if (currentScreen > 1) {
        // Don't go back to splash screen
        if (currentScreen === 2) return;
        
        // Hide current screen
        const currentScreenEl = document.getElementById(`screen${currentScreen}`);
        if (currentScreenEl) {
            currentScreenEl.classList.remove('active');
        }
        
        // Move to previous screen
        currentScreen--;
        
        // Show previous screen
        const prevScreenEl = document.getElementById(`screen${currentScreen}`);
        if (prevScreenEl) {
            prevScreenEl.classList.add('active');
        }
        
        // Update progress using your progress.js function
        if (window.updateProgressBar) {
            window.updateProgressBar(currentScreen);
        }
    }
}

// Move to specific screen
function moveToScreen(screenNumber) {
    if (screenNumber >= 1 && screenNumber <= totalScreens) {
        // Clear auto transition
        if (autoTransitionTimeout) {
            clearTimeout(autoTransitionTimeout);
        }
        
        // Hide all screens
        for (let i = 1; i <= totalScreens; i++) {
            const screen = document.getElementById(`screen${i}`);
            if (screen) {
                screen.classList.remove('active');
            }
        }
        
        // Update current screen
        currentScreen = screenNumber;
        
        // Show target screen
        const targetScreen = document.getElementById(`screen${currentScreen}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        // Update progress using your progress.js function
        if (window.updateProgressBar) {
            window.updateProgressBar(currentScreen);
        }
        
        // Show progress bar if past screen 1
        if (screenNumber > 1) {
            const progressContainer = document.getElementById('progressContainer');
            if (progressContainer) {
                progressContainer.classList.add('visible');
            }
        }
    }
}

// Touch/Swipe Support
function setupTouchSupport() {
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Check if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Swipe left (next screen)
            if (diffX > 50 && currentScreen < totalScreens) {
                nextScreen();
            }
            // Swipe right (previous screen)
            else if (diffX < -50 && currentScreen > 2) {
                previousScreen();
            }
        }
    }, { passive: true });
}

// Keyboard Support
function setupKeyboardSupport() {
    document.addEventListener('keydown', function(e) {
        // Arrow left or Space for next screen
        if ((e.key === 'ArrowLeft' || e.key === ' ') && currentScreen < totalScreens) {
            e.preventDefault();
            nextScreen();
        }
        // Arrow right for previous screen
        else if (e.key === 'ArrowRight' && currentScreen > 2) {
            e.preventDefault();
            previousScreen();
        }
    });
}

// Form Handling Setup
function setupForm() {
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const loading = document.getElementById('loading');
    
    // Get form values
    const formData = {
        name: document.getElementById('name')?.value,
        phone: document.getElementById('phone')?.value,
        email: document.getElementById('email')?.value
    };
    
    // Show loading state
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.style.display = 'none';
    if (loading) loading.style.display = 'flex';
    
    // Simulate form submission (replace with actual API call)
    try {
        // Track form submission if tracking is available
        if (window.eventTracker && window.eventTracker.trackFormSubmit) {
            window.eventTracker.trackFormSubmit(formData);
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Success - move to next screen
        nextScreen();
    } catch (error) {
        console.error('Form submission error:', error);
        // Handle error - show message to user
        alert('אירעה שגיאה, נסה שוב');
    } finally {
        // Reset button state
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.style.display = 'inline';
        if (loading) loading.style.display = 'none';
    }
}

// Debug functions - available in console
window.debugApp = {
    getCurrentScreen: () => currentScreen,
    goToScreen: moveToScreen,
    nextScreen: nextScreen,
    previousScreen: previousScreen,
    getTotalScreens: () => totalScreens,
    resetApp: () => {
        currentScreen = 1;
        moveToScreen(1);
        startAutoTransition();
    }
};

function updateProgressBar(screenIndex) {
    const totalSegments = 6; // Total screens with a progress bar (2 through 7)

    // 1. Reset all segments across all screens
    document.querySelectorAll('.progress-segment').forEach(segment => {
        segment.classList.remove('active');
    });

    // 2. Activate the correct segment on the current screen
    if (screenIndex > 1) {
        const screenElement = document.getElementById(`screen${screenIndex}`);
        if (screenElement) {
            // --- THIS IS THE LINE TO CHANGE ---
            // Calculate the correct segment index for RTL
            const segmentIndexForRTL = totalSegments - (screenIndex - 2);
            const activeSegment = screenElement.querySelector(`.progress-segment:nth-child(${segmentIndexForRTL})`);
            
            if (activeSegment) {
                activeSegment.classList.add('active');
            }
        }
    }
}


// Export functions for use in other scripts
window.nextScreen = nextScreen;
window.previousScreen = previousScreen;
window.moveToScreen = moveToScreen;
window.getCurrentScreen = () => currentScreen;