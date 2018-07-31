// Purpose: keep track of the value of Patient Weight ("weight").
// When the weight is updated, update the DOM too via the setter.
(() => {
    "use strict";
    window.app = window.app || {};

    const weightButton = document.getElementById("weight");
    let weightValue = 0;

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
                strong.textContent = value + " kg";
                weightButton.textContent = "";
                weightButton.appendChild(strong);
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
                span.textContent = "Pt Wt ";
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
            } else {
                console.warn("Value provided where weight '" + value + '" is not a number.');
            }
        }
    });

    // Init: Only need to do this once because the default weight is zero,
    // so setting it to zero again will not cause the class list to change.
    //app.weight = 0;
    document.body.classList.add("no-weight");

})();
