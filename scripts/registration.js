// Registration functionality
class RegistrationManager {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.loading = document.getElementById('registrationLoading');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        // Show loading state
        this.showLoading(true);
        
        try {
            // Get form data
            const formData = this.getFormData();
            
            // Validate form
            if (!this.validateForm(formData)) {
                this.showLoading(false);
                return;
            }

            // Add calculator result if available
            const calculatorResult = localStorage.getItem('calculatorResult');
            if (calculatorResult) {
                formData.calculatorResult = calculatorResult;
            }

            // Submit to API
            const response = await this.submitToAPI(formData);
            
            if (response.success) {
                // Track successful registration
                this.trackRegistration(formData);
                
                // Show success and move to next screen
                this.handleSuccess();
            } else {
                throw new Error(response.error || 'שגיאה לא ידועה');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.handleError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    getFormData() {
        const form = this.form;
        return {
            fullName: form.fullName.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            childAge: parseInt(form.childAgeReg.value),
            terms: form.terms.checked,
            timestamp: new Date().toISOString()
        };
    }

    validateForm(data) {
        const errors = [];

        // Required fields validation
        if (!data.fullName) errors.push('שם מלא הוא שדה חובה');
        if (!data.email) errors.push('אימייל הוא שדה חובה');
        if (!data.phone) errors.push('טלפון הוא שדה חובה');
        if (!data.childAge || data.childAge < 1 || data.childAge > 18) {
            errors.push('גיל הילד חייב להיות בין 1-18');
        }
        if (!data.terms) errors.push('יש לאשר את תנאי השימוש');

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
            errors.push('כתובת אימייל לא תקינה');
        }

        // Phone validation (Israeli phone numbers)
        const phoneRegex = /^[\+]?[0-9]{9,15}$/;
        if (data.phone && !phoneRegex.test(data.phone.replace(/[-\s]/g, ''))) {
            errors.push('מספר טלפון לא תקין');
        }

        if (errors.length > 0) {
            alert('שגיאות בטופס:\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    async submitToAPI(data) {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || `שגיאת שרת: ${response.status}`);
        }

        return result;
    }

    trackRegistration(data) {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'registration_submit', {
                'event_category': 'engagement',
                'event_label': 'form_submission',
                'value': 1
            });

            gtag('event', 'conversion', {
                'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with actual values
                'value': 1.0,
                'currency': 'ILS'
            });
        }

        // Custom tracking event
        if (window.trackEvent) {
            window.trackEvent('registration', 'submit', {
                childAge: data.childAge,
                hasCalculatorResult: !!data.calculatorResult
            });
        }

        console.log('Registration tracked successfully');
    }

    handleSuccess() {
        // Hide form
        this.form.style.display = 'none';
        
        // Show success message
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            successMessage.style.display = 'block';
        }

        // Auto advance to next screen after 2 seconds
        setTimeout(() => {
            if (window.nextScreen) {
                window.nextScreen();
            }
        }, 2000);

        // Clear form and calculator data
        this.form.reset();
        localStorage.removeItem('calculatorResult');
    }

    handleError(message) {
        alert(`שגיאה בשליחת ההרשמה:\n${message}\n\nאנא נסה שוב או צור קשר עם התמיכה.`);
    }

    showLoading(show) {
        if (this.loading) {
            this.loading.style.display = show ? 'flex' : 'none';
        }
        
        const submitBtn = this.form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = show;
            submitBtn.textContent = show ? 'שולח...' : 'שלח הרשמה';
        }
    }
}

// Initialize registration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.registrationManager = new RegistrationManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegistrationManager;
}