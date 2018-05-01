// Purpose: Sets the last time the user loaded this app.
// If this is the first time the user loaded the app, then navigate to the walkthrough.
(() => {
    "use strict";

    const key = "last-open-time";
    const lastOpenTime = localStorage.getItem(key);
    if (!lastOpenTime) {
        const uri = "/html/settings/walkthrough.html";
        app.navigate.next(uri);
    }
    // This is the unix epoch timestamp measured in seconds. 
    // For example, "Apr 1 2018 at midnight" has a value of 1522540800.
    const time = Math.round((new Date).getTime() / 1000);
    localStorage.setItem(key, time)

})();
