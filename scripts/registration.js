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

        // Validate email
        if (!this.isValidEmail(formData.email)) {
            alert('אנא הכנס אימייל תקין');
            return;
        }

        // Validate phone
        if (!this.isValidPhone(formData.phone)) {
            alert('אנא הכנס מספר טלפון תקין');
            return;
        }
        
        // Show loading
        this.showLoading(true);
        
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
                
                // Show success
                this.showSuccess();
                
                // Move to next screen after delay
                setTimeout(() => {
                    if (window.nextScreen) {
                        window.nextScreen();
                    }
                }, 1500);
                
            } else {
                throw new Error(result.error || 'שגיאה לא ידועה');
            }
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            this.showError(`שגיאה בשליחה: ${error.message}`);
        } finally {
            this.showLoading(false);
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