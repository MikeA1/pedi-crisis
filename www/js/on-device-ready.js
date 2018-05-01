// Purpose: when the `onDeviceReady` PhoneGap (Cordova) event is fired, implement logic that is dependent upon the host environment.
(() => {
    "use strict";

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

})();
