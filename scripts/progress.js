document.addEventListener('DOMContentLoaded', () => {
    const progressContainer = document.getElementById('progressContainer');
    const totalScreens = 7;

    if (!progressContainer) {
        console.error('Progress container not found!');
        return;
    }

    // לולאה שיוצרת את המקטעים (כמו קודם)
    for (let i = 0; i < totalScreens; i++) {
        const segment = document.createElement('div');
        segment.classList.add('progress-segment');
        segment.id = `segment-${i + 1}`;
        progressContainer.appendChild(segment);
    }

    // --- החלק החדש מתחיל כאן ---

    // פונקציה גלובלית שמעדכנת את הבר
    window.updateProgressBar = (currentScreenIndex) => {
        // קודם כל, מנקים את כל המקטעים מהמצב הפעיל
        document.querySelectorAll('.progress-segment').forEach(seg => {
            seg.classList.remove('active');
        });

        // מוצאים את המקטע הנכון ומוסיפים לו את הקלאס 'active'
        const activeSegment = document.getElementById(`segment-${currentScreenIndex}`);
        if (activeSegment) {
            activeSegment.classList.add('active');
        }
    };

    // עדכון ראשוני, כדי שהמקטע הראשון יהיה פעיל כשהדף עולה
    updateProgressBar(1);
});