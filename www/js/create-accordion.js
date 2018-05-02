// Purpose: Creates an accordion: up to one item is visible in an accordion.
// See: https://en.wikipedia.org/wiki/Accordion_(GUI)
(() => {
    "use strict";
    /**
     * 
     * @param [{button, content}] items - an array of objects - each object has two properties: `button` and `content` (both are DOM elements.)
     */
    app.createAccordion = (items) => {
        let currentIndex = null;
        const updateVisibility = () => {
            items.forEach((item, idx) => {
                item.content.style.display = currentIndex === idx ? "block" : "none";
            });
        }
        items.forEach((item, idx) => {
            const index = idx;
            item.button.addEventListener("click", () => {
                // This next statement just says "if currently open, then close it; otherwise, open it."
                currentIndex = currentIndex === index ? null : index;
                updateVisibility();
            })
            // Hide all content elements by default. So, as long as the button-content pair
            // is accurate, there should always be *one or fewer* content elements visible at one time.
            item.content.style.display = "none";
        });
    };    
})();
