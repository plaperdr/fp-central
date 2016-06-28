(function() {
    api.register("screen", function () {
        return {
            "width": window.screen.width,
            "height": window.screen.height,
            "depth": window.screen.colorDepth,
            "availTop": window.screen.availTop,
            "availLeft": window.screen.availLeft,
            "availHeight": window.screen.availHeight,
            "availWidth": window.screen.availWidth,
            "left": window.screen.left,
            "top": window.screen.top
        };
    });
})();