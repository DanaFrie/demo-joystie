// Registration Logic
class RegistrationManager {
    constructor() {
        this.form = null;
        this.submitBtn = null;
        this.submitText = null;
        this.loading = null;
    }

    init() {
        this.form = document.getElementById('registrationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.submitText = document.getElementById('submitText');
        this.loading = document.getElementById('loading');

        if (this.form) {
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
            // --- START OF MODIFIED CODE ---

            // This is the REAL API call
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: fullName,
                    email: formData.email,
                    phone: formData.phone,
                    timestamp: formData.timestamp
                }),
            });

            // Check if the server responded with an error
            if (!response.ok) {
                // Get error details from the server's response
                const errorResult = await response.json();
                // Throw an error to be caught by the catch block
                throw new Error(errorResult.error || 'Server responded with an error');
            }

            // If we get here, the submission was successful on the server
            const result = await response.json();
            console.log('✅ Registration successful:', result);
            this.showSuccess();
            
            // --- END OF MODIFIED CODE ---
            
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

    showLoading(show) {
        if (this.submitBtn) {
            this.submitBtn.disabled = show;
        }
        
        if (this.submitText) {
            this.submitText.style.display = show ? 'none' : 'block';
        }
        
        if (this.loading) {
            this.loading.style.display = show ? 'flex' : 'none';
        }
    }

    showSuccess() {
        if (this.submitText) {
            this.submitText.textContent = 'נשלח בהצלחה!';
            this.submitText.style.display = 'block';
        }
        
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }

    showError(message) {
        alert(message);
        
        // Reset button
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
        }
        
        if (this.submitText) {
            this.submitText.textContent = 'רוצה לשמוע עוד';
            this.submitText.style.display = 'block';
        }
        
        if (this.loading) {
            this.loading.style.display = 'none';
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Israeli phone number validation
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

// Export for use in other scripts
window.RegistrationManager = RegistrationManager;