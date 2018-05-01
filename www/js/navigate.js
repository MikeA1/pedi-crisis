// Purpose: logic for loading HTML pages into the "#content" div. Keeps track of page-view history.
// Note: this logic does not actually use hash-based routing, but it will update the hash-route for 
// better debugging in the browser.
(() => {
    "use strict";
    app.navigate = (() => {
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
                navigate.change(uri, header, nice.title, addClass);
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

                // Remove swipe settings that existed for the previous page.
                app.swipe.left = null;
                app.swipe.right = null;

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
                            if (addClass) {
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

        // If in a browser, handle the user using the "back" and "forward" browser buttons.
        // If in a Cordova wrapper, in practice, we only handle Android's native "back" button.
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

        // Init: `updateRootPath()` is executed in the event "DeviceReady", but capture the root now in case "DeviceReady" never fires
        // (e.g., with a pure browser experience).
        navigate.updateRootPath();

        // Init: use jQuery to capture clicks on all current and future elements that have the attribute "data-uri".
        $(document.body).on("click", "[data-uri]", (event) => {
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

        // Init: The virtual "Back" button is used by iPhone because it does not have a dedicated back button.
        // This logic just hooks up the event.
        document.getElementById("back-button").addEventListener("click", (event) => {
            navigate.prev();
            event.handled = true;
        })

        return navigate;

    })();

    // Init: load initial page.
    if (history.state) {
        // If here, then the user hit "back button" on browser from another website. (This only makes sense for browser debugging.)
        // Move to the last location in the app. Note that `event` mimics the data received from `window.onpopstate`.
        let event = { state: history.state };
        app.navigate.onHistoryChange(event);
    }
    else {
        // Automatically navigate to the event page.
        let uri = "/html/events/index.html";
        let header = "Pedi Crisis";
        let title = "Pedi Crisis";
        let hash = "#events";
        // Use `change` instead of `next` because we do not want to log history.
        app.navigate.change(uri, header, title);
        // Use `replaceState` instead of `pushState` because the current (soon-to-be-previous) state 
        // will show the nav bar but have blank contents.
        history.replaceState({ index: 1, uri: uri, header: header, title: title }, title, hash);
    }

})();
