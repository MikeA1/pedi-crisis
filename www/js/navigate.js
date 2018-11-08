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
        const eventButton = document.getElementById("events");
        const phoneButton = document.getElementById("phone");
        const weightButton = document.getElementById("weight");
        const settingButton = document.getElementById("settings");

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
                let isSetting = uri.includes("html/settings/");

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

                if (isSetting) {
                    settingButton.classList.add("emphasis");
                } else {
                    settingButton.classList.remove("emphasis");
                }

                // This special handling of "pages" applies to all screens that use the "page" class, which is pretty much all of them.
                // What does this do?
                // 1. If in an event, handle swipe gestures for events.
                // 2. Add links to phone numbers.
                // 3. Absolute positioning allows for context-relative scrolling (which is impemented in our CSS rules; see ".page::-webkit-scrollbar")
                // 4. Event sub-menu looks like it is fixed-positioned (because it doesn't move when the page scrolls)
                const callback = () => {
                    // Make the page absolute-positioned.
                    const pages = contentElement.getElementsByClassName("page");
                    if (pages && pages.length) {
                        // Normally there will be one page in this loop (i.e., `pages.length === 1`), 
                        // but multiple pages are okay in special circumstances.
                        // Q: In what situation would multiple pages be okay?
                        // A: When only one page is visible at a time. See `/html/settings/walkthrough.html` for an example.
                        for (let i = 0; i < pages.length; i++) {
                            const page = pages[i];

                            // Set the swipe/slide left/right functions if this is an event.
                            // This is done here to avoid a ton of duplicate, manual code.
                            if (isEvent) {
                                const eventNavs = document.getElementsByClassName("event-nav");
                                // Continue if there is exactly one eventNav (not sure what to do if there are multiple!)
                                if (eventNavs.length > 1) {
                                    console.warn("Hey, developer, there are multiple event navs detected. That's probably a mistake!")
                                }
                                if (eventNavs.length === 1) {

                                    // The expected DOM structure of `eventNavs` looks like this:

                                    // <div class="event-nav">
                                    //     <div class="button-group">
                                    //         <div class="button-container">
                                    //             <button data-uri="/html/events/air-embolism-dx.html" data-title="Air Embolism" class="bg-dx">Dx</button>
                                    //         </div>
                                    //         <div class="button-container">
                                    //             <button data-uri="/html/events/air-embolism-ddx.html" data-title="Air Embolism" class="bg-ddx">DDx</button>
                                    //         </div>
                                    //         <div class="button-container">
                                    //             <button data-uri="/html/events/air-embolism-tx.html" data-title="Air Embolism" class="bg-tx">Tx</button>
                                    //         </div>
                                    //         <div class="button-container">
                                    //             <button data-uri="/html/events/air-embolism-rx.html" data-title="Air Embolism" class="bg-rx">Rx</button>
                                    //         </div>
                                    //         <div class="button-container">
                                    //             <button data-uri="/html/events/air-embolism-crisis.html" data-title="Air Embolism" class="bg-crisis emphasis">Crisis</button>
                                    //         </div>
                                    //     </div>
                                    //     <div class="bg-crisis event-title">Crisis Management (If Severe)</div>
                                    // </div>

                                    // Helper function to remove leading forward slashes (this is for more reliable uri comparison).
                                    const removeLeadingForwardSlash = s => s.replace(/^\/+/, "");

                                    // For easier usage, convert elements with attributes [data-uri] (and [data-title])
                                    // into an array of objects that looks like this:
                                    // [
                                    //     {uri: "/html/events/air-embolism-dx.html", title: "Air Embolism"}, 
                                    //     {uri: "/html/events/air-embolism-ddx.html", title: "Air Embolism"}, 
                                    //     ...
                                    // ]
                                    const links = Array.from(eventNavs[0].querySelectorAll("[data-uri]")).map(element => {
                                        return {
                                            uri: removeLeadingForwardSlash(element.dataset.uri),
                                            title: element.dataset.title // may be `undefined`
                                        };
                                    });

                                    // Determine where we are in the set of links. 
                                    // Example: if at index 2, then swipe-left will navigate to the link at index 1
                                    // and swipe-right will navigate to the link at index 3 (if index 3 exists).
                                    const currentUri = removeLeadingForwardSlash(history.state.uri);
                                    for (let j = 0; j < links.length; j++) {
                                        const link = links[j];
                                        if (link.uri === currentUri) {
                                            // Currently on this link.
                                            if (j > 0) {
                                                const prevLink = links[j - 1];
                                                app.swipe.left = () => app.navigate.next(prevLink.uri, prevLink.title, "swipe-left");
                                            }
                                            if (j < links.length - 1) {
                                                const nextLink = links[j + 1];
                                                app.swipe.right = () => app.navigate.next(nextLink.uri, nextLink.title, "swipe-right");
                                            }
                                            break;
                                        }
                                    }
                                }
                            }

                            // Since we're already messing around with pages, let's insert phone numbers too.
                            app.phoneNumbers.updateElements(page);

                            // Absolute-position the page (would prefer "display: sticky", but that doesn't work well on iOS.)
                            const style = page.style;
                            // The property `offsetTop` creates a forced layout, so this should be one of the last actions taken per page.
                            style.top = page.offsetTop + "px";
                            style.position = "absolute";
                            // Note: This `.page` already has values for `bottom` and `overflow-y` via CSS rules; 
                            // these properties may be overridden in certain screens, such as changing
                            // `bottom` from `0` to `2.5em` to make room for edit buttons in the Phone Numbers screen.

                            // Apply class (in practice, this is a page transition animation).
                            if (addClass) {
                                page.classList.add(addClass);
                            }

                        }
                    }

                    // Page should be loaded now. Update analytics.
                    const analytics = window.ga
                    if (analytics && analytics.trackView) {
                        try {
                            analytics.trackView(title);
                        }
                        catch (error) {
                            console.error(error);
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
                    sup.textContent = "2.0";
                    sup.style.color = "#888";
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

})();
