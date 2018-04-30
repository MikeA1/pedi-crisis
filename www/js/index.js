(() => {
    "use strict";
    const weightButton = document.getElementById("weight");
    let weightValue = 0;
    window.app = {
        get weight() {
            return weightValue;
        },
        set weight(value) {
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
    };

    app.navigate = (() => {
        "use strict";

        // The header is updated when a "data-uri" attribute is accompanied by a "data-title" attribute.
        const defaultHeader = "Pedi Crisis";
        const headerElement = document.getElementById("header");

        // The inner HTML of this element is updated during a page transition.
        const contentElement = document.getElementById("content");


        // `historyIndex` determines which screen we are on in history.
        // This helps the navigation logic determine whether the user just moved forward or backward (e.g., using the browser back/forward buttons.)
        // Note that historyIndex is one-based to match the one-based counter in `window.history.length`.
        let historyIndex = 1;

        // These are the primary navigation buttons. They are always on the screen, so grab references to them once.
        // These elements are updated to indicate which screen is active.
        let eventButton = document.getElementById("events");
        let phoneButton = document.getElementById("phone");
        let weightButton = document.getElementById("weight");

        /**
         * Takes a relative URI and converts it to an absolute URI (with respect to the root of the current location). 
         * Does not affect a URI that is already absolute. 
         * @param {string} uri 
         */
        const createAbsoluteUri = (uri) => {
            // Phonegap works best on multiple platforms if all URIs are absolute.
            // The uri is absolute if uri contains a protocol: file:///android_asset/www/html/events/index.html
            let hasProtocol = uri.indexOf('://') > 0;
            // Not confirmed to occur in PhoneGap app, but guard against a context-implied protocol: //localhost:3000/index.html
            let hasImpliedProtocol = uri.indexOf('//') === 0;
            let fullUri = uri;
            if (hasProtocol || hasImpliedProtocol) {
                return uri;
            }
            // If here then assume uri is relative.
            // We don't know what the full path is until run time, (and it's different for each platform), so `navigate.root` is captured once when this script is first run/parsed.
            // Avoid creating invalid paths with double forward slashes. This bad-uri-example has two slashes between "www" and "html": file:///android_asset/www//html/events/index.html
            // Note: the double forward slashes was observed to break navigation in Android.
            while (uri && uri.startsWith("/")) {
                uri = uri.substring(1); // Remove the leading character until 
            }
            return navigate.rootPath + uri;
        };

        /**
         * Takes a URI (e.g., "/events/index.html") and generates an object `{hash, title}` that contains text suitable for
         * the hash component of a URL (e.g., localhost:3000/#events) and a title (e.g., "Pedi Crisis | events")
         * @param {string} uri 
         */
        const createHashAndTitle = (uri) => {
            var hash = uri
                .replace(/html/g, "") // trim off common file name extension
                .replace(/\./g, "") // remove .
                .replace(/index/g, "") // remove index
                .replace(/\//g, "-") // replace "/" with "-"
                .replace(/--/g, "-") // replace "--" with "-"
                .replace(/^-/, "") // remove leading "-"
                .replace(/-$/, ""); // remove trailing "-"
            let title = "Pedi Crisis";
            if (hash) {
                title += " | " + hash.replace(/-/g, " - "); // e.g., "Pedi Crisis | events - anaphylaxis"
                hash = "#" + hash;
            }

            return { hash: hash, title: title };
        }

        // This object is returned by the current function to set `app.navigate`. Note that there are a
        // few helper variables/functions that are intentionally not exposed in `app.navigate`!
        let navigate = {
            // history.length is one-based
            index: 1,
            /**
             * Move back one in history.
             */
            prev: () => {
                // Don't do anything if we're at the beginning of history.
                // Note that historyIndex is one-based to match the one-based counter in `window.history.length`.
                if (historyIndex > 1) {
                    history.back(); // This triggers app.navigate.onHistoryChange
                    historyIndex -= 1;
                    if (historyIndex === 1) {
                        // Just decremented from *some history* to *no history*; remove the pertinent class to the body.
                        document.body.classList.remove("has-history");
                    }
                }
            },
            /**
             * Create a new history entry. Navigate to this new entry.
             */
            next: (uri, header, addClass) => {
                if (history.state && history.state.uri === uri) {
                    // Don't navigate to the same page more than once. That would be silly.
                    return;
                }
                historyIndex += 1;
                if (historyIndex == 2) {
                    // Just incremented from *no history* to *some history*; add the pertinent class to the body.
                    document.body.classList.add("has-history");
                }
                let nice = createHashAndTitle(uri);
                history.pushState({ index: historyIndex, uri: uri, header: header, title: nice.title, hash: nice.hash, addClass: addClass }, nice.title, nice.hash);
                navigate.change(uri, header, nice.title, addClass || "slide-left");
            },
            /** 
             * This handles window.onpopstate.
             */
            onHistoryChange: (event) => {
                let state = event.state;
                if (!state) return;
                let index = state.index;
                let uri = state.uri;
                let header = state.header;
                let title = state.title;
                let addClass = state.addClass;
                if (!addClass) {
                    addClass = index > historyIndex ? "slide-left" : "slide-right";
                }

                if (historyIndex > 1 && index === 1) {
                    // Moved backward - there's no longer history
                    document.body.classList.remove("has-history");
                } else if (historyIndex === 1 && index > 1) {
                    // Moved forward - there's now history.
                    document.body.classList.add("has-history");
                }

                historyIndex = index;
                navigate.change(uri, header, title, addClass);
            },
            /**
             * Loads the specified URI.
             */
            change: (uri, header, title, addClass) => {
                if (!uri) {
                    console.error("uri is missing");
                    return;
                }

                // When a navigation change occurs, add or remove emphasis to pertinent header buttons.
                let isEvent = uri.includes("html/events/");
                let isPhone = uri.includes("html/phone/");
                let isWeight = uri.includes("html/weight/");

                if (isEvent) {
                    eventButton.classList.add("emphasis");
                } else {
                    eventButton.classList.remove("emphasis");
                }

                if (isPhone) {
                    phoneButton.classList.add("emphasis");
                } else {
                    phoneButton.classList.remove("emphasis");
                }

                if (isWeight) {
                    weightButton.classList.add("emphasis");
                } else {
                    weightButton.classList.remove("emphasis");
                }

                // This special handling of "pages" applies to all screens that use the "page" class, so the special
                // logic that enables a better scrolling experience is implemented here.
                // What does this do?
                // 1. Absolute positioning allows for context-relative scrolling (which is impemented in our CSS rules; see ".page::-webkit-scrollbar")
                // 2. Event sub-menu looks like it is fixed-positioned (because it doesn't move when the page scrolls)
                const callback = () => {
                        // Make the page absolute-positioned.
                        const pages = document.getElementsByClassName("page");
                        const hasNavigationAnimation = document.body.classList.contains("hasNavigationAnimation");
                        if (pages && pages.length) {
                            for (let i = 0; i < pages.length; i++) {
                                const page = pages[i];
                                const style = page.style;
                                style.top = page.offsetTop + "px";
                                style.position = "absolute";
                                // Note: This `.page` already has values for `bottom` and `overflow-y` via CSS rules.

                                // Since we're already messing around with pages, let's insert phone numbers too.
                                app.phoneNumbers.updateElements(page);

                                // Apply animation, if it makes sense to do so.
                                if (hasNavigationAnimation && addClass) {
                                    page.classList.add(addClass);
                                }
                            }
                        }
                    };

                // Transform the URI to an absolute path.
                var fullUri = createAbsoluteUri(uri);
                $(contentElement).load(fullUri, undefined, callback);
                const nextHeader = header || defaultHeader;
                if (nextHeader === "Pedi Crisis") {
                    headerElement.textContent = "Pedi Crisis ";
                    const sup = document.createElement("sup");
                    sup.textContent = "beta";
                    sup.style.color = "#aaa";
                    headerElement.appendChild(sup);
                } else {
                    headerElement.textContent = nextHeader;
                }

                if (title) {
                    try {
                        document.getElementsByTagName('title')[0].innerHTML = title.replace('<', '&lt;').replace('>', '&gt;').replace(' & ', ' &amp; ');
                    }
                    catch (Exception) { }
                    document.title = title;
                }
            },
        }

        // If in a browser, handle the user using the "back" or "forward" browser buttons. 
        window.onpopstate = navigate.onHistoryChange;

        /**
         * Catpures the root path/uri. This is needed later when constructing absolute paths.
         * Note that this is primarily called in the event DeviceReady because iOS has issues
         * capturing window.location in the initial execution of this function.
         */
        navigate.updateRootPath = () => {

            if (navigate.rootPath) {
                // Already set. Don't change it.
                return;
            }

            // Determine the rootPath. 
            let rootPath = window.location.href;
            // If here due to a browser reloading on a hash-nav page, remove everything after hash.
            // Example: 
            //    Before: http://localhost:3000/#events
            //    After: http://localhost:3000/
            let hashPosition = rootPath.indexOf("#");
            if (hashPosition) {
                rootPath = rootPath.substring(0, hashPosition);
            }
            // The primary "index.html" file should be the first (and only) page that references this script.
            // On the browser platform, the user can navigate directly to the root without "index.html", 
            // so the `endsWith` check is necessary.
            if (rootPath.endsWith("index.html")) {
                rootPath = rootPath.slice(0, rootPath.length - 10);
            }
            // To make combining paths easier later, ensure that the rootPath ends with a forward slash.
            if (rootPath && !rootPath.endsWith("/")) {
                rootPath += "/";
            }

            navigate.rootPath = rootPath;
        }

        // `updateRootPath()` is executed in the event "DeviceReady", but capture the root now in case "DeviceReady" never fires
        // (e.g., with a pure browser experience).
        navigate.updateRootPath();

        $(document).on("click", "[data-uri]", (event) => {
            // `currentTarget` is the "the element to which the event handler has been attached".
            let attributes = (event.currentTarget || event.target).attributes;
            let uri = attributes.getNamedItem("data-uri").value;
            // The attribute `data-title` is optional.
            let titleAttr = attributes.getNamedItem("data-title");
            let title = titleAttr ? titleAttr.value : undefined;
            let addClassAttr = attributes.getNamedItem("data-add-class");
            let addClass = addClassAttr ? addClassAttr.value : undefined;
            navigate.next(uri, title, addClass);
            event.handled = true;
        });

        $(document).on("click", "[data-prev]", (event) => {
            navigate.prev();
            event.handled = true;
        });

        return navigate;

    })();

    // User hit "back button" on browser from other site.
    if (history.state) {
        let event = { state: history.state };
        app.navigate.onHistoryChange(event);
    }
    else {
        // Automatically navigate to the event page.
        let uri = "/html/events/index.html";
        let header = "Pedi Crisis";
        let title = "Pedi Crisis";
        let hash = "#events";
        app.navigate.change(uri, header, title);
        history.replaceState({ index: 1, uri: uri, header: header, title: title }, title, hash);
    }

    // Handle the cordova "device ready" event.
    const onDeviceReady = () => {
        if (device.platform.toLowerCase() === "ios") {
            // iOS doesn't have a physcial back button, so add one to the app.
            // Note: button visibility is driven via CSS rules.
            document.body.classList.add("display-virtual-back-button");
            // Use FastClick (https://github.com/ftlabs/fastclick) to eliminate 300ms delay on `Click` events.
            // Why just iOS? Cordova uses UIWebView rather than (newer) WKWebView (see https://github.com/ftlabs/fastclick/issues/514#issuecomment-368019416).
            FastClick.attach(document.body, {tapDelay: 5});
        }
        // Try to update the root path. It's important that this happens during `deviceready` for iOS.
        // It seems that Android can detect the root path before this `deviceready` event is fired,
        // but always fire `updateRootPath` in case that's not the case for all versions of Android.
        app.navigate.updateRootPath();
    };
    document.addEventListener("deviceready", onDeviceReady, false);

    // Load data stored in local storage.
    const weight = +localStorage.getItem("weight");
    if (weight) {
        app.weight = +weight;
    } else {
        // Only need to do this once because the default weight is zero, so setting it to 
        // zero again will not cause the class list to change.
        //app.weight = 0;
        document.body.classList.add("no-weight");
    }

    /**
     * Intelligently prints numbers. Removes trailing 0's.
     * Expected Results: 
     *   const a = .02 * 35; // 0.7000000000000001
     *   app.printNumber(a) // 1
     *   app.printNumber(a, 1) // 0.7
     *   app.printNumber(a, 4) // 0.7000
     *   app.printNumber(a, 4, 8) // 0.7000
     *   const b = 0.123456
     *   app.printNumber(b) // 0
     *   app.printNumber(b, 1) // 0.1
     *   app.printNumber(b, 4) // 0.1235 - Note that .12345 is correctly rounded up to .1235!
     *   app.printNumber(b, 4, 8) // 0.123456
     * 
     * @param {number} value The value to round.
     * @param {number} minDecimalPlaces The minimum number of decimalPlaces (e.g., 0)
     * @param {number} maxDecimalPlaces The maximum number of decimalPlaces (e.g., 4)
     */
    app.printNumber = (value, minDecimalPlaces, maxDecimalPlaces) => {
        // Use `+` for a strict conversion to float because `parseFloat` will
        // convert strings that represent more than numbers (like "123 Fake Street" to "123".)
        // Note: `+` will convert the following
        //   - `undefined` to `NaN`
        //   - `null` to `0`
        //   - `window` to `NaN` (assume window is an object)
        //   - "1 Fake Street" to `NaN`
        //   - "100" to 100
        //   - "1e2" to 100
        //   - "-100" to -100

        value = +value;
        if (value === undefined || isNaN(value)) {
            return "";
        }

        minDecimalPlaces = +minDecimalPlaces;
        maxDecimalPlaces = +maxDecimalPlaces;
        if (!minDecimalPlaces || minDecimalPlaces < 0) {
            minDecimalPlaces = 0;
        }
        if (!maxDecimalPlaces || maxDecimalPlaces <= minDecimalPlaces) {
            // If maxDecimalPlaces is falsey or a less than min, then it's invalid. 
            // So, just treat minDecimalPlaces === maxDecimalPlaces;
            return value.toFixed(minDecimalPlaces);
        }

        // Notes on toFixed: 
        // const a = 2/3; // 0.666666666666
        // console.log(a.toFixed(0)); // 1
        // console.log(a.toFixed(1)) // 0.7
        // console.log(a.toFixed(4)) // 0.6667

        const longValue = value.toFixed(maxDecimalPlaces);
        let index = longValue.length - 1;
        const decimalPlace = longValue.indexOf(".");

        // if longNumber === "0.2345"
        // and minDecimalPlaces === 2
        // and decimalPlace === 1
        // then...
        // if index === 4 then continue
        // if index === 3 then stop (note that minDecimalPlaces + decimalPlace === 3)
        while (index > minDecimalPlaces + decimalPlace && longValue.charAt(index) === "0") {
            index -= 1;
        }

        // This would *truncate* the number. Instead, run toFixed (again) to *round* the number.
        //return longNumber.substring(0, index + 1);
        return value.toFixed(index - decimalPlace);
    }
    
    /**
     * Creates an accordion: up to one item is visible in an accordion.
     * @param [{button, content}] items is an array of objects with two properties: button and content.
     */
    app.createAccordion = (items) => {
        let currentIndex = null;
        const updateVisibility = () => {
            items.forEach((item, idx) => {
                item.content.style.display = currentIndex === idx ? "block" : "none";
            });
        }
        items.forEach((item, idx) => {
            const index = idx;
            item.button.addEventListener("click", () => {
                // This next statement just says "if currently open, then close it; otherwise, open it."
                currentIndex = currentIndex === index ? null : index;
                updateVisibility();
            })
            // Hide all content elements by default. So, as long as the button-content pair
            // is accurate, there should be one or less content elements visible at one time.
            item.content.style.display = "none";
        });
    };

    // Purpose: store phone numbers across app sessions via local storage. These phone numbers are used throughout the app.
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

    app.settings = {
        names: ["hasVisibleScrollbar", "hasEventDiagnosis", "hasNavigationAnimation", "hasSwipeNavigation"],
        init: () => {
            // Purpose: the names of settings are the names of CSS classes. These are used
            // for feature detection throughout the app. Note that the list of settings names
            // in `app.settings.names` should stay in sync with the settings listed in
            // "www/html/settings/index.html".
            app.settings.names.forEach(name => {
                const value = localStorage.getItem(name);
                if (value === "on") {
                    document.body.classList.add(name);
                }
            });
        },
    };

    app.settings.init();

    app.swipe = {
        init: () => {
            // Swipe to move back-and-forth in history
            let touchstartX;
            let touchstartY;
            document.body.addEventListener("touchstart", (event) => {
                touchstartX = event.changedTouches[0].screenX;
                touchstartY = event.changedTouches[0].screenY;
            });
            document.body.addEventListener("touchend", (event) => {
                if (!document.body.classList.contains("hasSwipeNavigation")) {
                    return;
                }
                const touchendX = event.changedTouches[0].screenX;
                const touchendY = event.changedTouches[0].screenY;

                const dx = touchstartX - touchendX;
                const dy = touchstartY - touchendY;
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal movement is greater than vertical movement.
                    if (dx < -200) {
                        history.back();
                    } else if (dx > 200) {
                        history.forward();
                    }
                }
            });
        }
    }

    app.swipe.init();

    app.walkthrough = {
        init: () => {
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
        }
    }

    app.walkthrough.init();

})();
