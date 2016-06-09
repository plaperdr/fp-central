/**
 * Fingerprint API for FP Central
 */

var attributes = [];
var api = {};

//Variable containing the current fingerprint
var fp = {};

var value = "Val";
var percentage = "Per";

api.register = function(name,code){
    attributes.push({'name':name,'code':code});
};

api.run = function (){
    //Running registered tests
    for(var i =0; i<attributes.length; i++){
        var name = attributes[i].name;
        var result = attributes[i].code();
        fp[name] = result;

        //Display results in HTML table
        if(typeof result === "object"){
            for(var key in result){
                document.getElementById(name+"."+key+value).innerHTML = result[key];
            }
        } else {
            document.getElementById(name+value).innerHTML = result;
        }
    }

    //Adding HTTP headers
    var headers = document.getElementById("headers");
    for(var j=0; j<headers.children.length; j++){
        var header = headers.children[j];
        fp[header.cells[0].textContent] = header.cells[1].textContent;
    }
    
    //Enabling the send button
    document.getElementById("sendBtn").classList.remove("disabled");
};


api.store = function(){
    //Sending the complete fingerprint to the server
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/store", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(fp));

    //Enabling the stats button
    document.getElementById("statsBtn").classList.remove("disabled");
};


api.stats = function(){
    //Get the total number of FPs
    var nbFPs = parseInt(api.getTotalFP());
    var attributes = Object.keys(fp);
    for(var i =0; i<attributes.length; i++){
        var name = attributes[i];
        var result = fp[name];

        //Display percentage in HTML table
        if(typeof result === "object"){
            for(var key in result){
                api.getPercentage(name+"."+key,JSON.stringify(result[key]),nbFPs);
            }
        } else {
            api.getPercentage(name,JSON.stringify(result),nbFPs);
        }
    }
};


api.getPercentage = function(name,value,nbTotal){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/stats", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var percent = parseInt(xhr.responseText)*100/nbTotal;
            document.getElementById(name+percentage).innerHTML = percent.toFixed(2).toString();
        }
    };
    xhr.send(JSON.stringify({"name":name, "value":value}));
};

api.getTotalFP = function(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/stats/total", false);
    xhr.send(null);
    return xhr.responseText;
};