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
                weightButton.innerHTML = "<strong>" + value + "</strong> kgs";
            } else if (value === null || value <= 0) {
                // User cleared the input

                if (weightValue) {
                    // Add the has-weight rule.
                    document.body.classList.add("no-weight");
                    document.body.classList.remove("has-weight");
                }

                weightValue = 0;
                weightButton.innerHTML = "Pt Wt ---";
            } else {
                console.warn("Value provided where weight '" + value + '" is not a number.');
            }
            localStorage.setItem("weight", weightValue);
        }
    });

    // Init: Load the saved value of "weight".
    const savedWeight = +localStorage.getItem("weight");
    if (savedWeight) {
        app.weight = +savedWeight;
    } else {
        // Only need to do this once because the default weight is zero, so setting it to 
        // zero again will not cause the class list to change.
        //app.weight = 0;
        document.body.classList.add("no-weight");
    }

})();
