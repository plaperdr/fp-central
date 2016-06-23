/**
 * JS instructions for the acceptable FP page
 */

//Screen resolution
var aWidth = screen.availWidth;
var aHeight = screen.availHeight;
var height = screen.height;
var width = screen.width;

var commonWidths = [800,1024,1152,1280,1440,1600,1680,1920,2560,3840];
var commonHeights = [600,720,768,800,900,1024,1050,1080,1200,1440,1600,2160];

document.getElementById("screen").innerHTML = width+"x"+height;
document.getElementById("screenNoJS").style.display = "none";
if((aWidth==1000 && aHeight==1000) || (width%200==0 && height%100==0)){
    document.getElementById("screenRes").className += " glyphicon-ok";
    document.getElementById("screenOk").style.display = "block";
} else {
    document.getElementById("screenRes").className += " glyphicon-remove";
    document.getElementById("screenNotOk").style.display = "block";
}

//Plugins absence
document.getElementById("pluginsNoJS").style.display = "none";
if(navigator.plugins.length==0){
    document.getElementById("plugins").innerHTML = "Empty";
    document.getElementById("pluginsRes").className += " glyphicon-ok";
    document.getElementById("pluginsOk").style.display = "block";
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
    for (i = 0; i < np.length; i++) plugins+= "Plugin "+i+": " + plist[i];
    document.getElementById("plugins").innerHTML = plugins;
    document.getElementById("pluginsRes").className += " glyphicon-remove";
    document.getElementById("pluginsNotOk").style.display = "block";
}