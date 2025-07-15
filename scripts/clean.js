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
        // Hide current screen
        const currentScreenEl = document.getElementById(`screen${currentScreen}`);
        if (currentScreenEl) {
            currentScreenEl.classList.remove('active');
        }
        
        // Move to next screen
        currentScreen++;
        
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

// Form Handling
function setupForm() {
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const loading = document.getElementById('loading');
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        timestamp: new Date().toLocaleString('he-IL', {
            timeZone: 'Asia/Jerusalem'
        })
    };
    
    // Validate
    if (!formData.name || !formData.phone || !formData.email) {
        alert('אנא מלא את כל השדות');
        return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    loading.style.display = 'flex';
    
    try {
        // Submit to API
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ Registration successful:', result);
            
            // Show success and move to next screen
            submitText.textContent = 'נשלח בהצלחה!';
            submitText.style.display = 'block';
            loading.style.display = 'none';
            
            setTimeout(() => {
                nextScreen(); // Move to screen 7
            }, 1000);
            
        } else {
            throw new Error(result.error || 'שגיאה לא ידועה');
        }
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        
        // Show error
        alert(`שגיאה בשליחה: ${error.message}`);
        
        // Reset button
        submitBtn.disabled = false;
        submitText.textContent = 'שלח';
        submitText.style.display = 'block';
        loading.style.display = 'none';
    }
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