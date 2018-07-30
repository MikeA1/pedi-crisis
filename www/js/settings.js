// Purpose: settings are set by the user to an "on" or "off" state. 
// If a setting is set to "on", then a CSS class is added to `document.body`; that CSS class
// is in turn used by CSS rules and possibly other feature-detection logic.
(() => {
    "use strict";
    window.app = window.app || {};

    app.settings = {
        names: ["hasVisibleScrollbar", "hasEventDiagnosis", "hasSwipeNavigation", "hasAccessibility"],
    };

    if (!app.lastOpenTime) {
        // Set settings that should be "on" by default.
        localStorage.setItem("hasSwipeNavigation", "on");
    }

    // Init: the names of settings are the names of CSS classes. These are used
    // for feature detection throughout the app.
    // Important: the list of settings names in `app.settings.names` should stay
    // in sync with the settings listed in "www/html/settings/index.html".
    app.settings.names.forEach(name => {
        const value = localStorage.getItem(name);
        if (value === "on") {
            document.body.classList.add(name);
        }
    });

})();
