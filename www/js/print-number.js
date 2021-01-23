// Purpose: Intelligently prints numbers. Removes trailing 0's.
(() => {
    "use strict";

    const useIntl = Intl != undefined && Intl.NumberFormat != undefined;

    /**
     * Expected Results: 
     *   const a = .02 * 35; // 0.7000000000000001
     *   app.printNumber(a) // 1
     *   app.printNumber(a, 1) // 0.7
     *   app.printNumber(a, 4) // 0.7000
     *   app.printNumber(a, 4, 8) // 0.7000
     *   const b = 0.123456
     *   app.printNumber(b) // 0
     *   app.printNumber(b, 1) // 0.1
     *   app.printNumber(b, 4) // 0.1235 - Note that .12345 is correctly rounded up to .1235!
     *   app.printNumber(b, 4, 8) // 0.123456
     * 
     * @param {number} value The value to round.
     * @param {number} minimumFractionDigits The minimum number of decimalPlaces (e.g., 0)
     * @param {number} maximumFractionDigits The maximum number of decimalPlaces (e.g., 4)
     */
    app.printNumber = (value, minimumFractionDigits, maximumFractionDigits) => {
        // Use `+` for a strict conversion to float because `parseFloat` will
        // convert strings that represent more than numbers (like "123 Fake Street" to "123".)
        // Note: `+` will convert the following
        //   - `undefined` to `NaN`
        //   - `null` to `0`
        //   - `window` to `NaN` (assume window is an object)
        //   - "1 Fake Street" to `NaN`
        //   - "100" to 100
        //   - "1e2" to 100
        //   - "-100" to -100

        if (useIntl) {
            try {
                return value.toLocaleString(app.language, { minimumFractionDigits, maximumFractionDigits });
            }
            catch (ex) {
                console.error(ex);
            }
        }

        // This is a fall-back when Intl.NumberFormat does not exist.
        function fallbackPrintNumber() {
            value = +value;
            if (value === undefined || isNaN(value)) {
                return "";
            }

            minimumFractionDigits = +minimumFractionDigits;
            maximumFractionDigits = +maximumFractionDigits;
            if (!minimumFractionDigits || minimumFractionDigits < 0) {
                minimumFractionDigits = 0;
            }
            if (!maximumFractionDigits || maximumFractionDigits <= minimumFractionDigits) {
                // If maxDecimalPlaces is falsey or a less than min, then it's invalid. 
                // So, just treat minDecimalPlaces === maxDecimalPlaces;
                return value.toFixed(minimumFractionDigits);
            }

            // Notes on toFixed: 
            // const a = 2/3; // 0.666666666666
            // console.log(a.toFixed(0)); // 1
            // console.log(a.toFixed(1)) // 0.7
            // console.log(a.toFixed(4)) // 0.6667

            const longValue = value.toFixed(maximumFractionDigits);
            let index = longValue.length - 1;
            const decimalPlace = longValue.indexOf(".");

            // if longNumber === "0.2345"
            // and minDecimalPlaces === 2
            // and decimalPlace === 1
            // then...
            // if index === 4 then continue
            // if index === 3 then stop (note that minDecimalPlaces + decimalPlace === 3)
            while (index > minimumFractionDigits + decimalPlace && longValue.charAt(index) === "0") {
                index -= 1;
            }

            // This would *truncate* the number.
            //return longNumber.substring(0, index + 1);
            // Instead, run toFixed (again) to *round* the number. 
            // Why? If maxDecimalPlaces === 2 and value === .6666, we want to return .67 instead of .66.
            return value.toFixed(index - decimalPlace);
        };

        var printedValue = fallbackPrintNumber();
        
        if (app.language == "es-ES")
            return printedValue.replace(".", ",");

        return printedValue;
    }

})();
