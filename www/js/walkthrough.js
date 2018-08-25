// Purpose: If this is the first time the user loaded the app, then navigate to the walkthrough.
(() => {
    "use strict";

    if (!app.lastOpenTime) {
        // Load the disclaimer, which navigates on to the walkthrough.
        const uri = "/html/settings/disclaimer.html";
        app.navigate.next(uri);
    }

})();
