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
            Array.from((parent || document.body).querySelectorAll("[data-phone-number]")).forEach(element => {
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
                    
                    // Add a space between the description (e.g., "ECMO") and phone number (e.g., "#555-555-5555").
                    // This space is not a part of the link because accessibility mode creates an underline for
                    // anchors and the underline looks weird with the space.
                    const space = document.createElement("span");
                    space.textContent = " ";
                    element.appendChild(space);

                    // If it's a hyperlink, then assume it's a telephone number: prefix with a hashtag (i.e., "#").
                    // Otherwise, use emphasis (i.e., "<em>") to distinguish the text as special.
                    if (phoneNumber.isHyperlink) {
                        // If the element looks like this:
                        //     <span data-phone-number="ECMO">ECMO</span>
                        // and we have a phone number defined as this:
                        //     {description: "ECMO", number: "555-555-5555", isHyperlink: true}
                        // then the amended element will look like this
                        //     <span data-phone-number="ECMO">ECMO<span> </span><a href="tel:555-555-5555">#555-555-5555</a></span>
                        // which to the user is displayed like this:
                        //    ECMO #555-555-5555
                        const link = document.createElement("a");
                        link.href="tel:" + number;
                        link.textContent = " #" + number;
                        element.appendChild(link);
                    } else {
                        // If the element looks like this:
                        //     <span data-phone-number="ECMO">ECMO</span>
                        // and we have a phone number defined as this:
                        //     {description: "ECMO", number: "Yell For Help", isHyperlink: false}
                        // then the amended element will look like this
                        //     <span data-phone-number="ECMO">ECMO<span> </span><em>Yell For Help</em></span>
                        const nonLink = document.createElement("em");
                        nonLink.textContent = number;
                        element.appendChild(nonLink);
                    }
                }
            });
        },
        // This associative array contains all of the "system" phone number descriptions (which are basically keys).
        systemDescriptions: {
            "Call for Help": "Call for Help",
            "Blood Bank": "Blood Bank",
            "Code Team": "Code Team",
            "Echo": "Echo",
            "ECMO": "ECMO",
            "Intraoperative Electrophysiology": "Intraoperative Electrophysiology",
            "Fire": "Fire",
            "PICU": "PICU",
            "Respiratory Therapy": "Respiratory Therapy",
        },
        // This function could be used elsewhere, but it's really only needed by "phone/index.html" at this time.
        sortCaseInsensitive: (a, b) => (a.localeCompare(b, 'en', {'sensitivity': 'base'})),
    };
        
})();
