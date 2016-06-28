(function() {
    try {
        localStorage.fp = "test";
        sessionStorage.fp = "test";
    } catch (ex) {
    }

    try {
        domLocalStorage = "";
        if (localStorage.fp == "test") {
            domLocalStorage = "yes";
        } else {
            domLocalStorage = "no";
        }
    } catch (ex) {
        domLocalStorage = "no";
    }

    try {
        domSessionStorage = "";
        if (sessionStorage.fp == "test") {
            domSessionStorage = "yes";
        } else {
            domSessionStorage = "no";
        }
    } catch (ex) {
        domSessionStorage = "no";
    }
    api.register("storage", function() {
        return {"local":domLocalStorage, "session":domSessionStorage};
    });
})();