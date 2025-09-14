// scripts/registration.js

class RegistrationManager {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.originalButtonHTML = ''; // To store the original button content
    }

    init() {
        this.form = document.getElementById('registrationForm');
        this.submitBtn = document.getElementById('submitBtn');

        if (this.form && this.submitBtn) {
            this.originalButtonHTML = this.submitBtn.innerHTML;
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            timestamp: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
        };
        
        // --- Validation ---
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
            alert('אנא מלא את כל השדות');
            return;
        }
        if (!this.isValidEmail(formData.email)) {
            alert('אנא הכנס אימייל תקין');
            return;
        }
        if (!this.isValidPhone(formData.phone)) {
            alert('אנא הכנס מספר טלפון תקין');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const fullName = `${formData.firstName} ${formData.lastName}`;
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    email: formData.email,
                    phone: formData.phone,
                    timestamp: formData.timestamp
                }),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || 'Server responded with an error');
            }

            this.showSuccess();
            
            setTimeout(() => {
                // Move to the next screen (screen 7)
                if (window.moveToScreen) {
                    window.moveToScreen(7); 
                }
            }, 1000); // Wait 1 second after success message to transition
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            this.showError(`שגיאה בשליחה: ${error.message}`);
        }
    }

    // --- UPDATED showLoading, showSuccess, and showError methods ---

    showLoading(isLoading) {
        if (!this.submitBtn) return;
        this.submitBtn.disabled = isLoading;
        this.submitBtn.classList.toggle('submitting', isLoading);
    }

    showSuccess() {
        if (!this.submitBtn) return;
        this.submitBtn.classList.remove('submitting');
        // Temporarily show a success message inside the button
        this.submitBtn.innerHTML = `<span>נשלח בהצלחה! ✓</span>`;
        // No need to re-enable, we are navigating away
    }

    showError(message) {
        alert(message);
        if (!this.submitBtn) return;
        // Reset the button to its original state
        this.showLoading(false);
        this.submitBtn.innerHTML = this.originalButtonHTML;
    }

    // --- Validation methods ---
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9]{9,15}$/;
        const cleanPhone = phone.replace(/[-\s\(\)]/g, '');
        return phoneRegex.test(cleanPhone);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.registrationManager = new RegistrationManager();
    window.registrationManager.init();
});