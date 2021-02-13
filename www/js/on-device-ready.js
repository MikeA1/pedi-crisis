// Purpose: when the `onDeviceReady` PhoneGap (Cordova) event is fired, implement logic that is dependent upon the host environment.
(() => {
    "use strict";

    // This object may be updated later by the `deviceready` event!
    app.device = {ios: false, safari: false};

    // Handle the cordova "device ready" event.
    const onDeviceReady = () => {

        // The `window.device` object is ready; its properties are documented here:
        // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-device/index.html
        app.device.safari = (device.model.toLowerCase() === "safari");

        // iOS has a few quirks - they're documented here.
        if (device.platform.toLowerCase() === "ios") {
            app.device.ios = true;

            // iOS doesn't have a physcial back button, so add one to the app.
            // Note: button visibility is driven via CSS rules.
            document.body.classList.add("display-virtual-back-button");
        }

        // Try to update the root path. It's important that this happens during `deviceready` for iOS.
        // It seems that Android can detect the root path before this `deviceready` event is fired,
        // but always fire `updateRootPath` in case that's not the case for all versions of Android.
        app.navigate.updateRootPath();

        // Need to load first page because the content container is empty on page load.
        if (history.state) {
            // If here, then the user hit "back button" on browser from another website. (This only makes sense for browser debugging.)
            // Move to the last location in the app. Note that `event` mimics the data received from `window.onpopstate`.
            let event = { state: history.state };
            app.navigate.onHistoryChange(event);
        } else {
            // Automatically navigate to the event page.
            let uri = "/html/{lang}/events/index.html";
            let header = "Pedi Crisis";
            let title = "Pedi Crisis";
            let hash = "#events";
            // Use `change` instead of `next` because we do not want to log history.
            app.navigate.change(uri, header, title);
            // Use `replaceState` instead of `pushState` because the current (soon-to-be-previous) state 
            // will show the nav bar but have blank contents.
            history.replaceState({ index: 1, uri: uri, header: header, title: title }, title, hash);
        }
    };
    document.addEventListener("deviceready", onDeviceReady, false);

})();
