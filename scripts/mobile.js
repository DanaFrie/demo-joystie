// Mobile App JavaScript
let currentScreen = 1;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Start with screen 1 (logo)
    showScreen(1);
    
    // Auto transition from screen 1 to screen 2 after 3 seconds
    setTimeout(() => {
        fadeOutScreen1();
    }, 3000);
});

// Slide button functionality
let isSliding = false;
let slideStartX = 0;
let slideButton = null;
let slideContainer = null;

// Initialize slide button
function initSlideButton() {
    slideButton = document.getElementById('slideButton');
    slideContainer = document.querySelector('.slide-container');
    
    if (slideButton && slideContainer) {
        // Mouse events
        slideButton.addEventListener('mousedown', startSlide);
        document.addEventListener('mousemove', handleSlide);
        document.addEventListener('mouseup', endSlide);
        
        // Touch events
        slideButton.addEventListener('touchstart', startSlide);
        document.addEventListener('touchmove', handleSlide);
        document.addEventListener('touchend', endSlide);
    }
}

function startSlide(e) {
    if (currentScreen !== 2) return;
    
    isSliding = true;
    slideStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    slideButton.classList.add('sliding');
    e.preventDefault();
}

function handleSlide(e) {
    if (!isSliding || currentScreen !== 2) return;
    
    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - slideStartX;
    const containerWidth = slideContainer.offsetWidth;
    const buttonWidth = slideButton.offsetWidth;
    const maxSlide = containerWidth - buttonWidth - 10;
    
    // Calculate slide position (right to left for RTL)
    let slidePosition = Math.max(0, Math.min(maxSlide, -deltaX));
    
    // Apply position
    slideButton.style.right = slidePosition + 'px';
    
    // Check if slide is complete (80% of the way)
    if (slidePosition >= maxSlide * 0.8) {
        completeSlide();
    }
    
    e.preventDefault();
}

function endSlide() {
    if (!isSliding || currentScreen !== 2) return;
    
    isSliding = false;
    slideButton.classList.remove('sliding');
    
    // If not completed, snap back
    const containerWidth = slideContainer.offsetWidth;
    const buttonWidth = slideButton.offsetWidth;
    const maxSlide = containerWidth - buttonWidth - 10;
    const currentPosition = parseInt(slideButton.style.right) || 0;
    
    if (currentPosition < maxSlide * 0.8) {
        slideButton.style.transition = 'right 0.3s ease';
        slideButton.style.right = '0px';
        
        setTimeout(() => {
            slideButton.style.transition = 'none';
        }, 300);
    }
}

function completeSlide() {
    if (currentScreen !== 2) return;
    
    isSliding = false;
    slideButton.classList.add('completed');
    slideButton.style.right = (slideContainer.offsetWidth - slideButton.offsetWidth - 10) + 'px';
    
    // Proceed to next screen after short delay
    setTimeout(() => {
        nextScreen();
    }, 300);
}

// Initialize slide button when screen 2 is shown
function showScreen(screenNumber) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active', 'fadeout');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(`screen${screenNumber}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenNumber;
        
        // Initialize slide button for screen 2
        if (screenNumber === 2) {
            setTimeout(() => {
                initSlideButton();
            }, 100);
        }
        
        // Start animation for screen 5
        if (screenNumber === 5) {
            startAnimation();
        }
    }
}

// Fade out screen 1 (logo)
function fadeOutScreen1() {
    const screen1 = document.getElementById('screen1');
    screen1.classList.add('fadeout');
    
    // After fade out, show screen 2
    setTimeout(() => {
        showScreen(2);
    }, 500);
}

// Move to next screen
function nextScreen() {
    if (currentScreen < 7) {
        showScreen(currentScreen + 1);
    }
}

// Restart app
function restartApp() {
    // Reset slide button
    const slideBtn = document.getElementById('slideButton');
    if (slideBtn) {
        slideBtn.classList.remove('completed', 'sliding');
        slideBtn.style.right = '0px';
        slideBtn.style.transition = 'none';
    }
    
    showScreen(1);
    
    // Auto transition from screen 1 to screen 2 after 3 seconds
    setTimeout(() => {
        fadeOutScreen1();
    }, 3000);
}

// Start animation for screen 5
function startAnimation() {
    const animatedElement = document.querySelector('.animated-element');
    if (animatedElement) {
        animatedElement.style.animation = 'bounce-around 3s infinite';
    }
}

// Touch/swipe functionality for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) {
        return;
    }
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Only handle horizontal swipes
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Swipe left (next screen)
        if (diffX > 50 && currentScreen > 1 && currentScreen < 7) {
            nextScreen();
        }
        // Swipe right (previous screen) - optional
        else if (diffX < -50 && currentScreen > 2) {
            showScreen(currentScreen - 1);
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
            if (currentScreen < 7) {
                nextScreen();
            }
            break;
        case 'ArrowRight':
        case 'ArrowUp':
            if (currentScreen > 2) {
                showScreen(currentScreen - 1);
            }
            break;
        case 'Home':
            restartApp();
            break;
    }
});

// Form validation for screen 6
function validateForm() {
    const form = document.querySelector('.details-form');
    const inputs = form.querySelectorAll('input');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff6b6b';
        } else {
            input.style.borderColor = '#E6F19A';
        }
    });
    
    return isValid;
}

// Enhanced button interactions
document.addEventListener('click', function(e) {
    // Add click effect to buttons
    if (e.target.classList.contains('slide-button') || 
        e.target.classList.contains('next-button')) {
        
        e.target.style.transform = e.target.style.transform.replace('scale(1.05)', '') + ' scale(0.95)';
        
        setTimeout(() => {
            e.target.style.transform = e.target.style.transform.replace('scale(0.95)', '');
        }, 150);
    }
    
    // Form validation for screen 6
    if (e.target.classList.contains('next-button') && currentScreen === 6) {
        if (!validateForm()) {
            e.preventDefault();
            return false;
        }
    }
});

// Add smooth transitions between screens
function smoothTransition(fromScreen, toScreen) {
    const from = document.getElementById(`screen${fromScreen}`);
    const to = document.getElementById(`screen${toScreen}`);
    
    // Slide out current screen
    from.style.transform = 'translateX(-100%)';
    
    // Slide in new screen
    setTimeout(() => {
        from.classList.remove('active');
        to.classList.add('active');
        to.style.transform = 'translateX(0)';
    }, 250);
}

// Preload optimization
function preloadScreens() {
    // This ensures smooth transitions by preparing all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.willChange = 'transform, opacity';
    });
}

// Initialize preloading
preloadScreens();