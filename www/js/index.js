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

app.navigate = (function (defaultTitle) {
    "use strict";
    var contentElement = document.getElementById("content");
    var titleElement = document.getElementById("title");
    var navigate = {};
    navigate.history = [];
    /**
     * This function does not affect history. Use `prev` and `next` to change history.
     * @param {string} uri the page to load
     * @param {string} title the title of the page
     */
    navigate.change = function (uri, title, addClass) {
        if (!uri) {
            console.warn("uri is missing");
            return;
        }

        // Phonegap works best on multiple platforms if all URIs are absolute.
        // The uri is absolute if uri contains a protocol: file:///android_asset/www/html/events/index.html
        let hasProtocol = uri.indexOf('://') > 0;
        // Not confirmed to occur in PhoneGap app, but guard against a context-implied protocol: //localhost:3000/index.html
        let hasImpliedProtocol = uri.indexOf('//') === 0;

        if (!hasProtocol && !hasImpliedProtocol) {
            // If here then assume uri is relative.
            // We don't know what the full path is at compile time (it's different for each platform) so `navigate.root` is captured once when this script is first run.
            // Avoid breaking Android by doubling-up forward slashes. This bad-uri-example has two slashes between "www" and "html": file:///android_asset/www//html/events/index.html
            while (navigate.root && navigate.root.endsWith("/") && uri && uri.startsWith("/")) {
                uri = uri.substring(1);
            }
            uri = navigate.root + uri;
        }

        var container = document.createElement("div");
        container.classList.add(addClass);
        $(container).load(uri);

        // $.html() has memory-management magic:
        // "jQuery removes other constructs such as data and event handlers from child elements 
        //  before replacing those elements with the new content" - http://api.jquery.com/html/#html2
        // $.html() also handles execution of our script code: this uses an evil eval, so never load untrusted/third-party content!
        $(contentElement).html(container);

        titleElement.innerText = title || defaultTitle;
        if (navigate.onChange) {
            navigate.onChange(uri, title);
        }
    }
    /**
     * Navigate to the specified page. Adds page to the history stack.
     * @param {string} uri the page to load
     * @param {string} title the tile of the page
     */
    navigate.next = function (uri, title) {

        var prevPage = navigate.history.length && navigate.history[navigate.history.length - 1];

        if (prevPage && prevPage.uri === uri) {
            // Clicked on a link that leads to the same place. Don't navigate.
            return;
        }

        navigate.history.push({ uri: uri, title: title });
        navigate.change(uri, title, "slide-left")
    };
    /**
     * Navigate to previous page in the history stack.
     */
    navigate.prev = function () {
        // If there's one item in history then that item is the current page. Nothing to see here, need to bounce.
        if (navigate.history.length <= 1) {
            return;
        }
        // Remove the current page from history and then navigate to the previous page.
        navigate.history.pop();
        var page = navigate.history[navigate.history.length - 1];
        navigate.change(page.uri, page.title, "slide-right");
    };

    // The primary "index.html" file should be the first (and only) page that references this script.
    var rootPath = window.location.href;
    if (rootPath.endsWith("index.html")) {
        rootPath = rootPath.slice(0, rootPath.length - 10);
    }
    Object.defineProperty(navigate, "root", { value: rootPath, writable: false });

    // Capture `click` for desktop and `touchstart` for mobile.
    // https://stackoverflow.com/a/11507558/772086
    $(document).on("touchstart click", "[data-uri]", function (event) {
        event.stopPropagation();
        event.preventDefault();
        // `currentTarget` is the "the element to which the event handler has been attached".
        var attributes = (event.currentTarget || event.target).attributes;
        var uri = attributes.getNamedItem("data-uri").value;
        // The attribute `data-title` is optional.
        var titleAttr = attributes.getNamedItem("data-title");
        var title = titleAttr ? titleAttr.value : undefined;
        navigate.next(uri, title);
        event.handled = true;
    });

    $(document).on("touchstart click", "[data-prev]", function (event) {
        event.stopPropagation();
        event.preventDefault();
        navigate.prev();
        event.handled = true;
    });

    return navigate;

})("Pedi Crisis");

// When a navigation change occurs, add or remove emphasis to pertinent header buttons.
// Note: this `onChange` event is implemented separate from the rest of the `navigate` definition
// to keep the above code cleaner and more isolated.
(function () {
    "use strict";

    var eventButton = $("#events");
    var phoneButton = $("#phone");
    var weightButton = $("#weight");

    app.navigate.onChange = function (uri, title) {

        var isEvent = uri.includes("html/events/");
        var isPhone = uri.includes("html/phone/");
        var isWeight = uri.includes("html/weight/");

        if (isEvent) {
            eventButton.addClass("emphasis");
        } else {
            eventButton.removeClass("emphasis");
        }

        if (isPhone) {
            phoneButton.addClass("emphasis");
        } else {
            phoneButton.removeClass("emphasis");
        }

        if (isWeight) {
            weightButton.addClass("emphasis");
        } else {
            weightButton.removeClass("emphasis");
        }

    };

    // Automatically navigate to the event page.
    app.navigate.next("/html/events/index.html");
})();

// Handle the cordova "device ready" event.
(function () {
    "use strict";
    function onDeviceReady() {
        // Hijack the Android back button. See: https://stackoverflow.com/a/18465461/772086
        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            app.navigate.prev();
        });
    }
    document.addEventListener("deviceready", onDeviceReady, false);
})();

// Load data stored in local storage.
(function () {
    "use strict";
    var weight = localStorage.getItem("weight");
    if (weight) {
        app.weight = +weight;
    }

    var currentLocation = localStorage.getItem("uri");

})();
