// Purpose: Sets the last time the user loaded this app.
// The value of `app.lastOpenTime` is used in places like
// "www/js/walkthrough.js" and "www/js/settings.js".
(() => {

    "use strict";
    window.app = window.app || {};
    
    const lastOpenTimeKey = "last-open-time";
    // Note: `getItem` returns `null` if the item does not exist.
    app.lastOpenTime = localStorage.getItem(lastOpenTimeKey);
    
    // Only update the lastOpenTime if a value exists already.
    // The initial value of `null` will be changed to not-null
    // when the user accepts the disclaimer.
    if (app.lastOpenTime) {
        // This is the unix epoch timestamp measured in seconds.
        // For example, "Apr 1 2018 at midnight" has a value of 1522540800.
        const time = Math.round((new Date).getTime() / 1000);
        localStorage.setItem(lastOpenTimeKey, time);
    }

})();
