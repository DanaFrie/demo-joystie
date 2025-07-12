// App State
let currentScreen = 1;
const totalScreens = 7;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('App initialized');
    
    // Auto advance from logo screen after 3 seconds
    setTimeout(() => {
        if (currentScreen === 1) {
            nextScreen();
        }
    }, 3000);
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyNavigation);
    
    // Add swipe/touch navigation
    addTouchNavigation();
    
    // Update progress bar
    updateProgressBar();
}

// Navigation Functions
function nextScreen() {
    if (currentScreen < totalScreens) {
        changeScreen(currentScreen + 1);
    }
}

function prevScreen() {
    if (currentScreen > 1) {
        changeScreen(currentScreen - 1);
    }
}

function changeScreen(screenNumber) {
    if (screenNumber < 1 || screenNumber > totalScreens) {
        return;
    }
    
    const currentScreenElement = document.getElementById(`screen${currentScreen}`);
    const nextScreenElement = document.getElementById(`screen${screenNumber}`);
    
    if (!nextScreenElement) {
        console.error(`Screen ${screenNumber} not found`);
        return;
    }
    
    // Add transition classes
    currentScreenElement.classList.add('screen-exit');
    nextScreenElement.classList.add('screen-enter');
    
    // Small delay for smooth transition
    setTimeout(() => {
        // Remove active from current screen
        currentScreenElement.classList.remove('active', 'screen-exit');
        
        // Add active to new screen
        nextScreenElement.classList.add('active');
        nextScreenElement.classList.remove('screen-enter');
        
        // Update current screen
        currentScreen = screenNumber;
        
        // Update progress bar
        updateProgressBar();
        
        console.log(`Moved to screen ${currentScreen}`);
        
    }, 50);
}

function updateProgressBar() {
    const progressFill = document.getElementById('progressFill');
    const progress = (currentScreen / totalScreens) * 100;
    
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
}

// Keyboard Navigation
function handleKeyNavigation(event) {
    switch(event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
            nextScreen();
            break;
        case 'ArrowRight':
        case 'ArrowDown':
            prevScreen();
            break;
        case 'Home':
            changeScreen(1);
            break;
        case 'End':
            changeScreen(totalScreens);
            break;
    }
}

// Touch Navigation
function addTouchNavigation() {
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
        
        // Minimum swipe distance
        const minSwipe = 50;
        
        // Horizontal swipe is stronger than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipe) {
            if (diffX > 0) {
                // Swipe left (next screen in RTL)
                nextScreen();
            } else {
                // Swipe right (previous screen in RTL)
                prevScreen();
            }
        }
    });
}

// Demo Functions (replace these with your actual functionality)
function calculateDemo() {
    const childAge = document.getElementById('childAge').value;
    const screenTime = document.getElementById('screenTime').value;
    const result = document.getElementById('calculatorResult');
    
    if (childAge && screenTime) {
        // Simple demo calculation
        const recommendation = screenTime > 2 ? 'מומלץ להפחית זמן מסך' : 'זמן מסך סביר';
        const score = Math.max(0, 100 - (screenTime * 10));
        
        result.innerHTML = `
            <div class="calc-result">
                <h3>תוצאת החישוב:</h3>
                <p><strong>ציון:</strong> ${score}/100</p>
                <p><strong>המלצה:</strong> ${recommendation}</p>
            </div>
        `;
        result.classList.add('show');
    } else {
        alert('אנא מלא את כל השדות');
    }
}

function submitDemo() {
    // Demo submission - just show success and move to next screen
    alert('הרשמה נשלחה בהצלחה! (זוהי הדמיה)');
    nextScreen();
}

// Utility Functions
function goToScreen(screenNumber) {
    changeScreen(screenNumber);
}

// Debug function - remove in production
function showCurrentScreen() {
    console.log(`Current screen: ${currentScreen}`);
    console.log(`Total screens: ${totalScreens}`);
}