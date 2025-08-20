class RegistrationManager {
    constructor() {
        this.form = null;
        this.submitBtn = null;
    }

    init() {
        this.form = document.getElementById('registrationForm');
        if (this.form) {
            // The submit button is now identified by its type and form attribute
            this.submitBtn = this.form.querySelector('button[type="submit"]');
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Get form data from the new input fields
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            timestamp: new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
        };
        
        // Combine first and last name for submission
        const fullName = `${formData.firstName} ${formData.lastName}`;

        // Validate
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
            // Simulate API submission
            console.log('Submitting:', { name: fullName, email: formData.email, phone: formData.phone });
            await new Promise(resolve => setTimeout(resolve, 1500)); // Fake API delay
            
            // On success:
            console.log('✅ Registration successful');
            this.showSuccess();
            
            setTimeout(() => {
                if (window.nextScreen) {
                    window.nextScreen();
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            this.showError(`שגיאה בשליחה: ${error.message}`);
        }
    }

    showLoading(isLoading) {
        if (!this.submitBtn) return;
        this.submitBtn.disabled = isLoading;
        this.submitBtn.textContent = isLoading ? 'שולח...' : 'רוצה לשמוע עוד';
    }

    showSuccess() {
        if (!this.submitBtn) return;
        this.submitBtn.textContent = 'נשלח בהצלחה!';
        this.submitBtn.style.backgroundColor = '#4CAF50'; // Optional: success color
    }

    showError(message) {
        alert(message);
        this.showLoading(false); // Reset button state
    }

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

// Create a global instance for clean.js to initialize
window.registrationManager = new RegistrationManager();