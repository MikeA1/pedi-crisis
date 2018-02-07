window.app = {
    _weightValue: 0,
    weightButton: null,
    get weight() {
        return this._weightValue;
    },
    set weight(value) {
        // A check of `!isNaN(value)` is redundant with `> 0`
        if (!this.weightButton) {
            this.weightButton = document.getElementById("weight");
        }
        if (typeof (value) === "number" && value > 0) {
            // This is a positive number
            this._weightValue = value;
            this.weightButton.innerHTML = "<strong>" + value + "</strong> kgs";
        } else if (value === null || value <= 0) {
            // User is clearing the input
            this._weightValue = null;
            this.weightButton.innerHTML = "Pt Wt ---";
        } else {
            console.warn("Value provided where weight '" + value + '" is not a number.');
        }
        localStorage.setItem("weight", this._weightValue);
    }
};

app.navigate = (function () {
    "use strict";

    // The header is updated when a "data-uri" attribute is accompanied by a "data-title" attribute.
    let defaultHeader = "Pedi Crisis";
    let headerElement = document.getElementById("header");

    // The inner HTML of this element is updated during a page transition.
    let contentElement = document.getElementById("content");
    

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
    function createAbsoluteUri(uri) {
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
        return navigate.root + uri;
    }

    /**
     * Takes a URI (e.g., "/events/index.html") and generates an object `{hash, title}` that contains text suitable for
     * the hash component of a URL (e.g., localhost:3000/#events) and a title (e.g., "Pedi Crisis | events")
     * @param {string} uri 
     */
    function createHashAndTitle(uri) {
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
        prev: function () {
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
        next: function (uri, header, addClass) {
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
        onHistoryChange: function (event) {
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
        change: function (uri, header, title, addClass) {
            if (!uri) {
                console.error("uri is missing");
                return;
            }

            // Load the uri in a container before adding it to the DOM because this makes the implementation of "addClass" easier.
            let container = document.createElement("div");
            if (addClass) container.classList.add(addClass);
            // Transform the URI to an absolute path.
            var fullUri = createAbsoluteUri(uri);
            $(container).load(fullUri);

            // $.html() has memory-management magic:
            // "jQuery removes other constructs such as data and event handlers from child elements 
            //  before replacing those elements with the new content" - http://api.jquery.com/html/#html2
            // $.html() also handles execution of our script code: this uses an evil eval, so never load untrusted/third-party content!
            $(contentElement).html(container);

            headerElement.innerText = header || defaultHeader;

            if (title) {
                try {
                    document.getElementsByTagName('title')[0].innerHTML = title.replace('<', '&lt;').replace('>', '&gt;').replace(' & ', ' &amp; ');
                }
                catch (Exception) { }
                document.title = title;
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
        },
    }

    // If in a browser, handle the user using the "back" or "forward" browser buttons. 
    window.onpopstate = navigate.onHistoryChange;

    // Determine the rootPath. This is needed later when constructing absolute paths.
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
    if (!rootPath.endsWith("/")) {
        rootPath += "/";
    }
    // Create read-only property because the root should never change.
    Object.defineProperty(navigate, "root", { value: rootPath, writable: false });

    // Capture `click` for desktop and `touchstart` for mobile.
    // https://stackoverflow.com/a/11507558/772086
    $(document).on("touchstart click", "[data-uri]", function (event) {
        event.stopPropagation();
        event.preventDefault();
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

    $(document).on("touchstart click", "[data-prev]", function (event) {
        event.stopPropagation();
        event.preventDefault();
        navigate.prev();
        event.handled = true;
    });

    return navigate;

})();

(function () {
    "use strict";

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

})();

// Handle the cordova "device ready" event.
(function () {
    "use strict";
    function onDeviceReady() {
        document.body.classList.add("display-virtual-back-button");
    }
    document.addEventListener("deviceready", onDeviceReady, false);
})();

// Load data stored in local storage.
(function () {
    "use strict";
    let weight = localStorage.getItem("weight");
    if (weight) {
        app.weight = +weight;
    }

    let currentLocation = localStorage.getItem("uri");

})();
