/**
 * JS instructions for the acceptable FP page
 */
$(document).ready(function() {

    //Colors and strings
    var red = "#FF8080";
    var green = "#B9D98A";
    var res = "Res";
    var panel = "Panel";

    //Helper functions
    function setPanel(name,val){
        if(val=="Ok"){
            $("#"+name+res).toggleClass("fa-check").css("color", green);
            $("#"+name+"Ok").css("display", "block");
        } else {
            $("#"+name+res).toggleClass("fa-times").css("color", red);
            $("#"+name+"NotOk").css("display", "block");
        }
    }

    //Screen resolution
    var aWidth = screen.availWidth;
    var aHeight = screen.availHeight;
    var height = screen.height;
    var width = screen.width;

    var commonWidths = [800, 1024, 1152, 1280, 1440, 1600, 1680, 1920, 2560, 3840];
    var commonHeights = [600, 720, 768, 800, 900, 1024, 1050, 1080, 1200, 1440, 1600, 2160];

    $("#screen").html(width + "x" + height);
    $("#screenNoJS").css("display", "none");
    if ((aWidth == 1000 && aHeight == 1000) || (width % 200 == 0 && height % 100 == 0)) {
        setPanel("screen","Ok");
    } else {
        setPanel("screen","NotOk");
    }

    //Plugins absence
    $("#pluginsNoJS").css("display", "none");
    if (navigator.plugins.length == 0) {
        $("#plugins").html("Empty");
        setPanel("plugins","Ok");
    } else {
        var np = window.navigator.plugins;
        var plist = [];
        for (var i = 0; i < np.length; i++) {
            plist[i] = np[i].name + "; ";
            plist[i] += np[i].description + "; ";
            plist[i] += np[i].filename;
            plist[i] += ". ";
        }
        var plugins = "";
        for (i = 0; i < np.length; i++) plugins += "Plugin " + i + ": " + plist[i];
        $("#plugins").html(plugins);
        setPanel("plugins","NotOk");
    }

    //We open the right panel if it is indicated in the URL
    var url = document.location.toString();
    if (url.match('#')){
        $("#" + url.split('#')[1] + panel).collapse('show');
    }
});