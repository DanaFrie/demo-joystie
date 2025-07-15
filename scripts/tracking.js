// Event Tracking Logic
class EventTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.isTrackingEnabled = true;
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    async trackEvent(event, screen, additionalData = {}) {
        if (!this.isTrackingEnabled) {
            return;
        }

        const eventData = {
            event,
            screen,
            sessionId: this.sessionId,
            timestamp: new Date().toLocaleString('he-IL', {
                timeZone: 'Asia/Jerusalem'
            }),
            userAgent: navigator.userAgent,
            url: window.location.href,
            referrer: document.referrer,
            ...additionalData
        };

        try {
            const response = await fetch('/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log(`📊 Event tracked: ${event} on screen ${screen}`);
            } else {
                console.warn('⚠️ Event tracking failed:', result.error);
            }

        } catch (error) {
            console.warn('⚠️ Event tracking error:', error.message);
        }
    }

    // Track screen visit
    trackScreenVisit(screenNumber) {
        this.trackEvent('screen_visit', screenNumber, {
            timestamp: new Date().toISOString()
        });
    }

    // Track screen 6 specifically
    trackScreen6Visit() {
        this.trackEvent('screen6_visit', 6, {
            formDisplayed: true,
            timestamp: new Date().toISOString()
        });
    }

    // Track form interactions
    trackFormStart() {
        this.trackEvent('form_start', 6, {
            action: 'user_started_filling_form'
        });
    }

    trackFormSubmit(success = true) {
        this.trackEvent('form_submit', 6, {
            success,
            action: success ? 'form_submitted_successfully' : 'form_submit_failed'
        });
    }

    // Track button clicks
    trackButtonClick(buttonText, screen) {
        this.trackEvent('button_click', screen, {
            buttonText,
            action: 'navigation_button_clicked'
        });
    }

    // Track app events
    trackAppStart() {
        this.trackEvent('app_start', 1, {
            startTime: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
    }

    trackAppComplete() {
        this.trackEvent('app_complete', 7, {
            completionTime: new Date().toISOString()
        });
    }

    // Disable tracking (for privacy/GDPR)
    disableTracking() {
        this.isTrackingEnabled = false;
        console.log('📊 Event tracking disabled');
    }

    enableTracking() {
        this.isTrackingEnabled = true;
        console.log('📊 Event tracking enabled');
    }
}

// Initialize global tracker
window.eventTracker = new EventTracker();

// Track app start when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.eventTracker.trackAppStart();
});

// Track page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        window.eventTracker.trackEvent('page_hidden', window.currentScreen || 1);
    } else {
        window.eventTracker.trackEvent('page_visible', window.currentScreen || 1);
    }
});

// Export for use in other scripts
window.EventTracker = EventTracker;