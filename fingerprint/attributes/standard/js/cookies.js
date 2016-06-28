(function() {
    api.register("cookies", function () {
        return window.navigator.cookieEnabled ? "yes" : "no";
    });
})();