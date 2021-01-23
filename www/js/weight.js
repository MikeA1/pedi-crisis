// Purpose: keep track of the value of Patient Weight ("weight").
// When the weight is updated, update the DOM too via the setter.
(() => {
    "use strict";
    window.app = window.app || {};

    const weightButton = document.getElementById("weight");
    let weightValue = 0;

    // This is the name of the class applied to `document.body` when a patient weight warning should be displayed.
    // Search for CSS rules like ".display-patient-weight-warning" to see where it's used.
    const className = "display-patient-weight-warning";
    let timeoutId = 0;

    const clearWarningTimer = () => {
        document.body.classList.remove(className);
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = 0;
        }
    };

    const startWarningTimer = () => {
        clearWarningTimer();
        // The timeout is expressed in milliseconds: (1000 milliseconds in a second) * (60 seconds in a minute) * 30 minutes
        const timeout = 1000 * 60 * 30;
        timeoutId = setTimeout(() => document.body.classList.add(className), timeout);
    };

    // Use a special setter and getter to automatically handle UI updates.
    // Example usage: app.weight = 5.0;
    Object.defineProperty(window.app, "weight", {
        get() {
            return weightValue;
        },
        set(value) {
            // A check of `!isNaN(value)` is redundant with `> 0`
            if (typeof (value) === "number" && value > 0 && isFinite(value)) {
                // This is a positive number
                if (!weightValue) {
                    // Add the has-weight rule.
                    document.body.classList.add("has-weight");
                    document.body.classList.remove("no-weight");
                }
                weightValue = value;
                const strong = document.createElement("strong");
                strong.textContent = app.printNumber(value) + " kg";
                weightButton.textContent = "";
                weightButton.appendChild(strong);
                startWarningTimer();
            } else if (value === null || value <= 0) {
                // User cleared the input

                if (weightValue) {
                    // Add the has-weight rule.
                    document.body.classList.add("no-weight");
                    document.body.classList.remove("has-weight");
                }

                weightValue = 0;
                weightButton.textContent = "";
                const span = document.createElement("span");
                span.textContent = app.language === "es-ES" ? "Peso " : "Pt Wt ";
                weightButton.appendChild(span);
                // On smaller screens, the three hyphens may be line-wrapped like this:
                //    Pt Wt --
                //    -
                // ...and that looks dumb. So, the hyphens are put in a special span
                // to avoid an ugly line wrap.
                const hyphens = document.createElement("span");
                hyphens.style.whiteSpace = "nowrap";
                hyphens.textContent = "---";
                weightButton.appendChild(hyphens);
                clearWarningTimer();
            } else {
                console.log(value);
                console.warn("Value provided where weight '" + value + '" is not a number.');
            }
        }
    });

    // Init: Only need to do this once because the default weight is zero,
    // so setting it to zero again will not cause the class list to change.
    //app.weight = 0;
    document.body.classList.add("no-weight");

})();
