// Implement polyfills. 
(function () {

    // Polyfill for Internet Explorer browsers.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function (search, this_len) {
            if (this_len === undefined || this_len > this.length) {
                this_len = this.length;
            }
            return this.substring(this_len - search.length, this_len) === search;
        };
    }

    // Polyfill for Internet Explorer and FireFox.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    if (!String.prototype.includes) {
        String.prototype.includes = function (search, start) {
            'use strict';
            if (typeof start !== 'number') {
                start = 0;
            }

            if (start + search.length > this.length) {
                return false;
            } else {
                return this.indexOf(search, start) !== -1;
            }
        };
    }
})();

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
     * @param {string} href the page to load
     * @param {string} title the tile of the page
     */
    navigate.change = function (href, title, addClass) {
        if (!href) {
            console.warn("href is missing");
            return;
        }
        // This is a little tricky - if a URL is relative then prefix it with the root URL.
        if (href[0] === "/") {
            href = navigate.root + href;
        }
        var container = document.createElement("div");
        container.classList.add(addClass);
        $(container).load(href);
        $(contentElement).html(container);
        titleElement.innerText = title || defaultTitle;
        if (navigate.onChange) {
            navigate.onChange(href, title);
        }
    }
    /**
     * Navigate to the specified page. Adds page to the history stack.
     * @param {string} href the page to load
     * @param {string} title the tile of the page
     */
    navigate.next = function (href, title) {

        var prevPage = navigate.history.length && navigate.history[navigate.history.length - 1];

        if (prevPage && prevPage.href === href) {
            // Clicked on a link that leads to the same place. Don't navigate.
            return;
        }

        navigate.history.push({ href: href, title: title });
        navigate.change(href, title, "slide-left")
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
        navigate.change(page.href, page.title, "slide-right");
    };

    var rootPath = window.location.href;
    if (rootPath.endsWith("index.html")) {
        rootPath = rootPath.slice(0, rootPath.length - 10);
    }
    Object.defineProperty(navigate, "root", { value: rootPath, writable: false });

    // Capture `click` for desktop and `touchstart` for mobile.
    // https://stackoverflow.com/a/11507558/772086
    $(document).on("touchstart click", "[data-href]", function (event) {
        event.stopPropagation();
        event.preventDefault();
        // `currentTarget` is the "the element to which the event handler has been attached".
        var attributes = (event.currentTarget || event.target).attributes;
        var href = attributes.getNamedItem("data-href").value;
        // The attribute `data-title` is optional.
        var titleAttr = attributes.getNamedItem("data-title");
        var title = titleAttr ? titleAttr.value : undefined;
        navigate.next(href, title);
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

    app.navigate.onChange = function (href, title) {

        var isEvent = href.includes("html/events/");
        var isPhone = href.includes("html/phone/");
        var isWeight = href.includes("html/weight/");

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

(function () {
    "use strict";

    // Hijack the Android back button. See: https://stackoverflow.com/a/18465461/772086
    function onDeviceReady() {
        document.addEventListener("backbutton", function (e) {
            e.preventDefault();
            app.navigate.prev();
        });
    }
    document.addEventListener("deviceready", onDeviceReady, false);

})();