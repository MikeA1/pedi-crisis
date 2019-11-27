(() => {
    var isBrowser = document.URL.startsWith("http");
    if (isBrowser) return; // Insomnia doesn't work on a browser.
    var tenSeconds = 10 * 1000;
    setInterval(() => {
        try {
            if (document.body.classList.contains("hasInsomnia")) {
                console.log("keepAwake");
                window.plugins.insomnia.keepAwake();
            } else {
                console.log("allowSleepAgain");
                window.plugins.insomnia.allowSleepAgain()
            }
        } catch (error) {
            console.error(error);
        }
    }, tenSeconds);
})();
