// Event Tracking Logic - Simplified for Screen 6 only
class EventTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.isTrackingEnabled = true;
        this.screen6Tracked = false; // Prevent duplicate tracking
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    async trackScreen6Visit() {
        if (!this.isTrackingEnabled || this.screen6Tracked) {
            return;
        }

        this.screen6Tracked = true; // Mark as tracked

        const trackingData = {
            timestamp: new Date().toLocaleString('he-IL', {
                timeZone: 'Asia/Jerusalem'
            }),
            sessionId: this.sessionId
        };

        try {
            const response = await fetch('/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trackingData)
            });

            const result = await response.json();

            // if (response.ok && result.success) {
            //     console.log('📊 Screen 6 visit tracked successfully');
            // } else {
            //     console.warn('⚠️ Screen 6 tracking failed:', result.error);
            // }

        } catch (error) {
            
            // console.warn('⚠️ Screen 6 tracking error:', error.message);
        }
    }

    // Disable tracking (for privacy/GDPR)
    disableTracking() {
        this.isTrackingEnabled = false;
        // console.log('📊 Screen 6 tracking disabled');
    }

    enableTracking() {
        this.isTrackingEnabled = true;
        // console.log('📊 Screen 6 tracking enabled');
    }

    // Reset tracking flag (for testing)
    resetTracking() {
        this.screen6Tracked = false;
        // console.log('📊 Screen 6 tracking reset');
    }
}

// Initialize global tracker
window.eventTracker = new EventTracker();

// Export for use in other scripts
window.EventTracker = EventTracker;