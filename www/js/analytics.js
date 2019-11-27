// Adapted analytics.js to work with this app.
// See: https://developers.google.com/analytics/devguides/collection/analyticsjs
// Also: https://stackoverflow.com/a/42216498/772086
(() => {
    "use strict";
    try {

        (function (i, s, o, g, r, a, m) {
            i["GoogleAnalyticsObject"] = r; i[r] = i[r] || function () {
                (i[r].q = i[r].q || []).push(arguments)
            }, i[r].l = 1 * new Date(); a = s.createElement(o),
                m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
        })(window, document, "script", "https://www.google-analytics.com/analytics.js", "ga");

        var fields = {
            trackingId: "UA-124434075-1"
        };

        ga('set', 'anonymizeIp', true);

        // If we are in the app the protocol will be "file://
        var isBrowser = document.URL.startsWith("http");

        if (isBrowser) {
            ga("create", fields);
            app.logAction = (name) => {
                ga("send", {
                    // this is required, there are optional properties too if you want them
                    hitType: "pageview",
                    eventLabel: name,
                });
            }
        } else {

            // a callback function to get the clientId and store it ourselves
            ga(function (tracker) {
                localStorage.setItem("ga:clientId", tracker.get("clientId"));
            });

            // We store and provide the clientId ourselves in localStorage since there are no
            // cookies in Cordova.
            fields.clientId = localStorage.getItem("ga:clientId");
            // Disable GA"s cookie storage functions
            fields.storage = "none";

            ga("create", fields);

            // See: https://developers.google.com/analytics/devguides/collection/analyticsjs/screens
            ga("set", {
                // Skip protocol check because it's probably "file://
                checkProtocolTask: null,
                // do not expect cookies to be enabled
                checkStorageTask: null,
                // Since the appName field must be sent with all app hits, it's often best to set that field with the set command
                appName: "PediCrisis"
            });

            app.logAction = (name) => {
                // See: https://developers.google.com/analytics/devguides/collection/analyticsjs/screens
                ga("send", {
                    hitType: "screenview",
                    screenName: name
                });
            }
        }

    } catch (error) {
        console.error(error);
    }
})();
