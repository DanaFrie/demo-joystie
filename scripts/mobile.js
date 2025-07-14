// Mobile App JavaScript
let currentScreen = 1;
let isSliding = false;
let slideStartX = 0;
let currentSlideThumb = null;
let currentSlideContainer = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Start with screen 1 (logo)
    showScreen(1);
    
    // Auto transition from screen 1 to screen 2 after 3 seconds
    setTimeout(() => {
        fadeOutScreen1();
    }, 3000);
});

// Show specific screen with slide transition
function showScreen(screenNumber, direction = 'none') {
    const screens = document.querySelectorAll('.screen');
    const currentScreenElement = document.getElementById(`screen${currentScreen}`);
    const targetScreen = document.getElementById(`screen${screenNumber}`);
    
    if (!targetScreen) return;
    
    // Handle transition direction
    if (direction === 'next' && currentScreenElement) {
        // Slide current screen out to left
        currentScreenElement.classList.add('slide-out-left');
        currentScreenElement.classList.remove('active');
        
        // Slide new screen in from right
        targetScreen.style.transform = 'translateX(100%)';
        targetScreen.classList.add('active');
        
        setTimeout(() => {
            targetScreen.classList.add('slide-in-right');
            targetScreen.style.transform = 'translateX(0)';
        }, 50);
        
        // Clean up after transition
        setTimeout(() => {
            currentScreenElement.classList.remove('slide-out-left');
            targetScreen.classList.remove('slide-in-right');
            screens.forEach(screen => {
                if (screen !== targetScreen) {
                    screen.classList.remove('active');
                    screen.style.transform = '';
                }
            });
        }, 500);
    } else {
        // Hide all screens
        screens.forEach(screen => {
            screen.classList.remove('active', 'slide-out-left', 'slide-in-right');
            screen.style.transform = '';
        });
        
        // Show target screen
        targetScreen.classList.add('active');
    }
    
    currentScreen = screenNumber;
    
    // Initialize slide functionality for screens 2-7
    if (screenNumber >= 2 && screenNumber <= 7) {
        setTimeout(() => {
            initSlideToUnlock(screenNumber);
        }, 100);
    }
    
    // Start animation for screen 5
    if (screenNumber === 5) {
        startAnimation();
    }
}

// Fade out screen 1 (logo)
function fadeOutScreen1() {
    const screen1 = document.getElementById('screen1');
    screen1.classList.add('fadeout');
    
    // After fade out, show screen 2
    setTimeout(() => {
        showScreen(2, 'next');
    }, 500);
}

// Initialize slide to unlock for a specific screen
function initSlideToUnlock(screenNumber) {
    const slideContainer = document.getElementById(`slideToUnlock${screenNumber}`);
    const slideThumb = document.getElementById(`slideThumb${screenNumber}`);
    
    if (!slideContainer || !slideThumb) return;
    
    // Reset slide position
    slideThumb.style.right = '4px';
    slideThumb.classList.remove('completed', 'sliding');
    slideContainer.classList.remove('sliding');
    
    // Remove existing event listeners
    slideThumb.removeEventListener('mousedown', handleSlideStart);
    slideThumb.removeEventListener('touchstart', handleSlideStart);
    
    // Add event listeners
    slideThumb.addEventListener('mousedown', handleSlideStart);
    slideThumb.addEventListener('touchstart', handleSlideStart);
    
    // Store references
    currentSlideThumb = slideThumb;
    currentSlideContainer = slideContainer;
}

// Handle slide start
function handleSlideStart(e) {
    if (isSliding) return;
    
    isSliding = true;
    slideStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    
    currentSlideThumb.classList.add('sliding');
    currentSlideContainer.classList.add('sliding');
    
    // Add global move and end listeners
    document.addEventListener('mousemove', handleSlideMove);
    document.addEventListener('mouseup', handleSlideEnd);
    document.addEventListener('touchmove', handleSlideMove);
    document.addEventListener('touchend', handleSlideEnd);
    
    e.preventDefault();
}

// Handle slide move
function handleSlideMove(e) {
    if (!isSliding || !currentSlideThumb || !currentSlideContainer) return;
    
    const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const deltaX = currentX - slideStartX;
    
    const containerWidth = currentSlideContainer.offsetWidth;
    const thumbWidth = currentSlideThumb.offsetWidth;
    const maxSlide = containerWidth - thumbWidth - 8; // 8px for padding
    
    // Calculate slide position (right to left for RTL)
    let slidePosition = Math.max(4, Math.min(maxSlide, 4 - deltaX));
    
    // Apply position
    currentSlideThumb.style.right = slidePosition + 'px';
    
    // Check if slide is complete (90% of the way)
    if (slidePosition <= maxSlide * 0.1) {
        completeSlide();
    }
    
    e.preventDefault();
}

// Handle slide end
function handleSlideEnd() {
    if (!isSliding || !currentSlideThumb || !currentSlideContainer) return;
    
    isSliding = false;
    
    // Remove global listeners
    document.removeEventListener('mousemove', handleSlideMove);
    document.removeEventListener('mouseup', handleSlideEnd);
    document.removeEventListener('touchmove', handleSlideMove);
    document.removeEventListener('touchend', handleSlideEnd);
    
    currentSlideThumb.classList.remove('sliding');
    currentSlideContainer.classList.remove('sliding');
    
    // If not completed, snap back
    const containerWidth = currentSlideContainer.offsetWidth;
    const thumbWidth = currentSlideThumb.offsetWidth;
    const maxSlide = containerWidth - thumbWidth - 8;
    const currentPosition = parseInt(currentSlideThumb.style.right) || 4;
    
    if (currentPosition > maxSlide * 0.1) {
        currentSlideThumb.style.transition = 'right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        currentSlideThumb.style.right = '4px';
        
        setTimeout(() => {
            if (currentSlideThumb) {
                currentSlideThumb.style.transition = '';
            }
        }, 400);
    }
}

// Complete slide action
function completeSlide() {
    if (!currentSlideThumb || !currentSlideContainer) return;
    
    isSliding = false;
    
    // Remove global listeners
    document.removeEventListener('mousemove', handleSlideMove);
    document.removeEventListener('mouseup', handleSlideEnd);
    document.removeEventListener('touchmove', handleSlideMove);
    document.removeEventListener('touchend', handleSlideEnd);
    
    currentSlideThumb.classList.add('completed');
    currentSlideThumb.classList.remove('sliding');
    currentSlideContainer.classList.remove('sliding');
    
    const containerWidth = currentSlideContainer.offsetWidth;
    const thumbWidth = currentSlideThumb.offsetWidth;
    const finalPosition = containerWidth - thumbWidth - 4;
    
    currentSlideThumb.style.right = finalPosition + 'px';
    
    // Proceed to next screen or restart after delay
    setTimeout(() => {
        if (currentScreen === 7) {
            restartApp();
        } else {
            // Validate form on screen 6
            if (currentScreen === 6 && !validateForm()) {
                resetSlide();
                return;
            }
            
            showScreen(currentScreen + 1, 'next');
        }
    }, 400);
}

// Reset slide to initial position
function resetSlide() {
    if (!currentSlideThumb) return;
    
    currentSlideThumb.classList.remove('completed');
    currentSlideThumb.style.transition = 'right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    currentSlideThumb.style.right = '4px';
    
    setTimeout(() => {
        if (currentSlideThumb) {
            currentSlideThumb.style.transition = '';
        }
    }, 400);
}

// Validate form for screen 6
function validateForm() {
    const form = document.querySelector('.details-form');
    if (!form) return true;
    
    const inputs = form.querySelectorAll('input');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff6b6b';
            input.style.animation = 'shake 0.5s ease-in-out';
            
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        } else {
            input.style.borderColor = 'rgba(230, 241, 154, 0.3)';
        }
    });
    
    if (!isValid) {
        // Show error message briefly
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'אנא מלא את כל השדות';
        errorMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff6b6b;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.remove();
        }, 2000);
    }
    
    return isValid;
}

// Start animation for screen 5
function startAnimation() {
    const animatedElement = document.querySelector('.animated-element');
    if (animatedElement) {
        animatedElement.style.animation = 'morphing-dance 4s infinite ease-in-out';
    }
}

// Restart app
function restartApp() {
    // Reset all slide components
    for (let i = 2; i <= 7; i++) {
        const slideThumb = document.getElementById(`slideThumb${i}`);
        const slideContainer = document.getElementById(`slideToUnlock${i}`);
        
        if (slideThumb) {
            slideThumb.classList.remove('completed', 'sliding');
            slideThumb.style.right = '4px';
            slideThumb.style.transition = '';
        }
        
        if (slideContainer) {
            slideContainer.classList.remove('sliding');
        }
    }
    
    // Reset form
    const form = document.querySelector('.details-form');
    if (form) {
        form.reset();
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.borderColor = 'rgba(230, 241, 154, 0.3)';
        });
    }
    
    showScreen(1);
    
    // Auto transition from screen 1 to screen 2 after 3 seconds
    setTimeout(() => {
        fadeOutScreen1();
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        10%, 90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
`;
document.head.appendChild(style);