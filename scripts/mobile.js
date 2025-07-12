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

// Section Navigation - Forward Only
function nextSection() {
    if (currentSection < totalSections - 1) {
        currentSection++;
        moveToSection(currentSection);
    }
}

// Remove previous section function - only forward navigation
// function prevSection() - REMOVED

function goToSection(sectionIndex) {
    // Only allow forward navigation or same section
    if (sectionIndex >= currentSection && sectionIndex < totalSections) {
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

// Touch/Swipe Navigation - Forward Only
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
        
        // Only forward swipe (left swipe in RTL)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipe) {
            if (diffX > 0) {
                // Swipe left (next section in RTL)
                nextSection();
            }
            // Remove backward swipe functionality
        }
    }, { passive: true });
}

// Keyboard Navigation - Forward Only
function addKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'Space':
            case 'Enter':
                nextSection();
                e.preventDefault();
                break;
            // Remove backward navigation keys
            default:
                // Number keys 1-7 - only allow forward navigation
                if (e.key >= '1' && e.key <= '7') {
                    const sectionIndex = parseInt(e.key) - 1;
                    if (sectionIndex >= currentSection) {
                        goToSection(sectionIndex);
                    }
                    e.preventDefault();
                }
                break;
        }
    });
}

// Dot Navigation - Forward Only
function addDotNavigation() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            // Only allow clicking on current or future sections
            if (index >= currentSection) {
                goToSection(index);
            }
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