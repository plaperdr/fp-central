/**
 * JS instructions to detect the level of the security slider
 */


document.getElementById("sliderNoJS").style.display = "none";

//Medium-Low level detection: support of MathML
var div = document.createElement("div");
div.style.position = "absolute"; div.style.top = div.style.left = 0;
div.style.visibility = "hidden"; div.style.width = div.style.height = "auto";
div.style.fontFamily = "serif"; div.style.lineheight = "normal";
div.innerHTML = "<math><mfrac><mi>xx</mi><mi>yy</mi></mfrac></math>";
document.body.appendChild(div);
var hasMathML = (div.offsetHeight > div.offsetWidth);

//Medium-High level detection: blocking of external scripts provided through HTTP
var hasHTTPBlocking = (typeof blockHTTP === "undefined");

//High level detection: support of SVG elements
var hasSVG = (document.getElementById("svg").height == undefined);

if(hasMathML){
    //Low level detected
    document.getElementById("sliderLow").style.display = "block";
} else {
    if(!hasHTTPBlocking){
        //Medium-Low level detected
        document.getElementById("sliderMediumLow").style.display = "block";
    } else {
        if(!hasSVG){
            //Medium-High level detected
            document.getElementById("sliderMediumHigh").style.display = "block";
        } else {
            //High level detected
            document.getElementById("sliderHigh").style.display = "block";
        }
    }
}


