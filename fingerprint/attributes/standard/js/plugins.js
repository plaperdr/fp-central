api.register("plugins", function() {
    var np = window.navigator.plugins;
    var plist = [];
    for (var i = 0; i < np.length; i++) {
        plist[i] = np[i].name + "; ";
        plist[i] += np[i].description + "; ";
        plist[i] += np[i].filename;
        plist[i] += ". ";
    }
    var plugins = "";
    for (i = 0; i < np.length; i++)
        plugins+= "Plugin "+i+": " + plist[i];
    return plugins;
});