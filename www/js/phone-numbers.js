// Purpose: store phone numbers across app sessions via local storage. These phone numbers are used throughout the app.
(() => {
    "use strict";
    
    // The "phoneNumbers" data structure  is persisted in local storage as an associative array (i.e., "dictionary")
    // keyed on `description`:
    // {
    //   "Fire": {
    //     "description": "Fire",
    //     "number": "Yell Loudly",
    //     "isHyperlink": false
    //   },
    //   "My Custom Number": {
    //     "description": "My Custom Number",
    //     "number": "555-555-5555",
    //     "isHyperlink": true
    //   }
    // }
    app.phoneNumbers = {
        /***
         * Simple helper for retrieving phone numbers.
         */
        get: () => {
            const stringData = localStorage.getItem("phone-numbers");
            return stringData ? JSON.parse(stringData) : {};
        },
        /***
         * Simple helper for saving phone numbers. Note that the value must already be in the correct format!
         */
        set: (phoneNumbers) => {
            if (phoneNumbers.length) {
                console.warn("Oops - phoneNumbers should be an associative array.");
            }
            localStorage.setItem("phone-numbers", JSON.stringify(phoneNumbers));
        },
        /**
         * This updates all DOM elements that have the attribute "data-phone-number" defined.
         * @argument parent HTMLElement is an optional parameter that restricts the DOM search for 
         * elements with the attribute "data-phone-number";
         */
        updateElements: (parent) => {
            let phoneNumbers = null;
            Array.from((parent ||document).querySelectorAll("[data-phone-number]")).forEach(element => {
                if (phoneNumbers === null) {
                    // This `if` statement was created to lazy-load the `phoneNumbers` object.
                    const storedPhoneNumbers = localStorage.getItem("phone-numbers");
                    phoneNumbers = storedPhoneNumbers !== null ? JSON.parse(storedPhoneNumbers) : {};
                }
                // Here `element.dataset.phoneNumber` is something like "ECMO" from an element like `<span data-phone-number="ECMO">`
                // Also, note the funky automatic conversion from "data-phone-number" (data-attribute) to "phoneNumber" (dataset)!
                const description = element.dataset.phoneNumber;
                const phoneNumber = phoneNumbers[description];
                if (phoneNumber !== undefined && phoneNumber.number !== undefined) {
                    const number = phoneNumber.number.trim();
                    if (phoneNumber.isHyperlink) {
                        // If the element looks like this:
                        //     <span data-phone-number="ECMO">ECMO</span>
                        // and we have a phone number defined as this:
                        //     {description: "ECMO", number: "555-555-5555", isHyperlink: true}
                        // then the amended element will look like this
                        //     <span data-phone-number="ECMO">ECMO <a href="tel:555-555-5555">#555-555-5555</a></span>
                        // which to the user is displayed like this:
                        //    ECMO #555-555-5555
                        const link = document.createElement("a");
                        link.href="tel:" + number;
                        link.textContent = " #" + number;
                        element.appendChild(link);
                    } else {
                        const span = document.createElement("span");
                        span.textContent = " #" + number;
                        element.appendChild(span);
                    }
                }
            });
        },
        systemDescriptions: {"Code Team": "Code Team", "PICU": "PICU", "Fire": "Fire", "Overhead STAT": "Overhead STAT", "ECMO": "ECMO"}
    };
        
})();
