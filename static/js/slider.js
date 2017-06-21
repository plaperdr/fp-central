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

//High level detection: support of SVG elements
var hasSVG = (document.getElementById("svg").height == undefined);

if(hasMathML){
    //Low level detected
    document.getElementById("sliderLow").style.display = "block";
} else {
    if(!hasSVG){
        //Medium level detected
        document.getElementById("sliderMedium").style.display = "block";
    } else {
        //High level detected
        document.getElementById("sliderHigh").style.display = "block";
    }
}


