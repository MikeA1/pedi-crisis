// Purpose: Fades in and out the logo.
(() => {
    const pediCrisis = document.getElementById("logo-pedi-crisis");
    const spa = document.getElementById("logo-spa");
    const switchTime = 10000;
    let isSpaVisible = true;
    const fade = () => {
        if (isSpaVisible) {
            pediCrisis.classList.remove("fade-in");
            pediCrisis.classList.add("fade-out");
            spa.classList.remove("fade-out");
            spa.classList.add("fade-in");
        } else {
            pediCrisis.classList.remove("fade-out");
            pediCrisis.classList.add("fade-in");
            spa.classList.remove("fade-in");
            spa.classList.add("fade-out");
        }
        isSpaVisible = !isSpaVisible;
    };
    // The style property `opacity` is set to `0` in the spa logo element. Remove this property
    // right before the fade occurs because style rules always override class rules.
    setTimeout(() => {spa.style.opacity = ""}, switchTime - 1);
    setInterval(fade, switchTime);
})();
