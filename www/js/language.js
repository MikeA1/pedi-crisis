(() => {

    const storageKey = "language";

    window.app = window.app || {};

    app.supportedLanguages = ["en-US", "es-ES"];

    let languageValue = null;

    Object.defineProperty(window.app, "language", {
        get() {
            return languageValue;
        },
        set(value) {
            if (app.supportedLanguages.includes(value)) {
                languageValue = value;
                localStorage.setItem(storageKey, value);
            }
        }
    });

    try {
        var storageValue = localStorage.getItem(storageKey);
        if (storageValue != null && app.supportedLanguages.includes(storageValue)) {
            languageValue = storageValue;
            return;
        }

        // If here, then there is not a value in localStorage for language.
        // Let's try to determine one based upon device settings.
        if (navigator != undefined && navigator != null) {
            var language = navigator.language;
            if (language != undefined && language != null) {
                if (app.supportedLanguages.includes(language)) {
                    languageValue = language;
                }
                else if (language.startsWith("en")){
                    // Different region, but close enough for our purposes
                    languageValue = "en-US";
                }
                else if (language.startsWith("es")){
                    // Different region, but close enough for our purposes
                    languageValue = "es-ES";
                }
            }
        }
    }
    catch (ex) {
        console.error(ex);
    }

    // If here, we do not have a good default language. Fall back to English.
    if (!languageValue)
        languageValue = "en-US";


})();
