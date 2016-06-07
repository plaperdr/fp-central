api.register("timezone", function() {
    return new Date().getTimezoneOffset();
});