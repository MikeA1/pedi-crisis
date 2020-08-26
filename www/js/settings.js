// Purpose: settings are set by the user to an "on" or "off" state. 
// If a setting is set to "on", then a CSS class is added to `document.body`; that CSS class
// is in turn used by CSS rules and possibly other feature-detection logic.
(() => {
    "use strict";
    window.app = window.app || {};

    app.settings = {
        names: ["hasAccessibility", "hasEventDiagnosis", "hasDarkMode", "hasInsomnia"],
    };

    if (!app.lastOpenTime) {
        // Set default values for settings.
        localStorage.setItem("hasAccessibility", "off");
        localStorage.setItem("hasEventDiagnosis", "off");
        localStorage.setItem("hasDarkMode", "off");
        localStorage.setItem("hasInsomnia", "on");
    }

    // Init: the names of settings are the names of CSS classes. These are used
    // for feature detection throughout the app.
    // Important: the list of settings names in `app.settings.names` should stay
    // in sync with the settings listed in "www/html/{lang}/settings/index.html".
    app.settings.names.forEach(name => {
        const value = localStorage.getItem(name);
        if (value === "on") {
            document.body.classList.add(name);
            document.body.parentElement.classList.add(name);
        }
    });

})();
