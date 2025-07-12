// Mobile Navigation Logic
let currentSection = 0;
const totalSections = 7;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileApp();
});

function initializeMobileApp() {
    console.log('Mobile app initialized');
    
    // Add touch/swipe navigation
    addTouchNavigation();
    
    // Add keyboard navigation
    addKeyboardNavigation();
    
    // Add dot navigation
    addDotNavigation();
    
    updateActiveSection();
}

// Section Navigation
function nextSection() {
    if (currentSection < totalSections - 1) {
        currentSection++;
        moveToSection(currentSection);
    }
}

function prevSection() {
    if (currentSection > 0) {
        currentSection--;
        moveToSection(currentSection);
    }
}

function goToSection(sectionIndex) {
    if (sectionIndex >= 0 && sectionIndex < totalSections) {
        currentSection = sectionIndex;
        moveToSection(currentSection);
    }
}

function moveToSection(sectionIndex) {
    const container = document.getElementById('sectionsContainer');
    const translateX = -(sectionIndex * 100);
    
    container.style.transform = `translateX(${translateX}vw)`;
    updateActiveSection();
    
    console.log(`Moved to section ${sectionIndex + 1}`);
}

function updateActiveSection() {
    // Update progress dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSection);
    });
}

// Touch/Swipe Navigation
function addTouchNavigation() {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        // Prevent scrolling while swiping
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Minimum swipe distance
        const minSwipe = 50;
        
        // Horizontal swipe is stronger than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipe) {
            if (diffX > 0) {
                // Swipe left (next section in RTL)
                nextSection();
            } else {
                // Swipe right (previous section in RTL)
                prevSection();
            }
        }
    }, { passive: true });
}

// Keyboard Navigation
function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                nextSection();
                e.preventDefault();
                break;
            case 'ArrowRight':
                prevSection();
                e.preventDefault();
                break;
            case 'Home':
                goToSection(0);
                e.preventDefault();
                break;
            case 'End':
                goToSection(totalSections - 1);
                e.preventDefault();
                break;
            default:
                // Number keys 1-7
                if (e.key >= '1' && e.key <= '7') {
                    const sectionIndex = parseInt(e.key) - 1;
                    goToSection(sectionIndex);
                    e.preventDefault();
                }
                break;
        }
    });
}

// Dot Navigation
function addDotNavigation() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            goToSection(index);
        });
    });
}

// Mouse wheel navigation (optional)
function addWheelNavigation() {
    let isScrolling = false;
    
    document.addEventListener('wheel', function(e) {
        if (isScrolling) return;
        
        isScrolling = true;
        setTimeout(() => {
            isScrolling = false;
        }, 500);
        
        if (e.deltaY > 0) {
            nextSection();
        } else {
            prevSection();
        }
        
        e.preventDefault();
    }, { passive: false });
}

// Optional: Auto-advance from first section
function autoAdvanceFromLogo() {
    if (currentSection === 0) {
        setTimeout(() => {
            nextSection();
        }, 3000);
    }
}

// Uncomment if you want auto-advance from logo
// setTimeout(autoAdvanceFromLogo, 1000);

// Debug functions
function getCurrentSection() {
    return currentSection + 1;
}

function logCurrentSection() {
    console.log(`Current section: ${getCurrentSection()}/${totalSections}`);
}