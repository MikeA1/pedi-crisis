// Purpose: implement special actions when the user swipes left or right.
(() => {
    "use strict";
    app.swipe = {
        // `left` and `right` are functions set by each "page" in the app. 
        // They are set to null *before* a page transition occurs:
        // this ensures that swipe functions must be defined on each loaded page.
        left: null,
        right: null,
    }

    // Init: track touch start/end to track swipes.
    let touchstartX;
    let touchstartY;
    document.body.addEventListener("touchstart", (event) => {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
    });
    document.body.addEventListener("touchend", (event) => {
        if (!document.body.classList.contains("hasSwipeNavigation")) {
            return;
        }
        const touchendX = event.changedTouches[0].screenX;
        const touchendY = event.changedTouches[0].screenY;

        const dx = touchstartX - touchendX;
        const dy = touchstartY - touchendY;
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal movement is greater than vertical movement.
            if (dx < -150) {
                if (app.swipe.left) {
                    app.swipe.left();
                } 
            } else if (dx > 150) {
                if (app.swipe.right) {
                    app.swipe.right();
                } 
            }
        }
    });
})();
