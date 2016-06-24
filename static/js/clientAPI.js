/**
 * Fingerprint API for FP Central
 */

var attributes = [];
var api = {};

//Variable containing the current fingerprint and percentages
var fp = {};
var per = {};
var nbAttributes = 0;
var statsFetched = 0;

var value = "Val";
var percentage = "Per";
var fpTemp = "fpTemp";
var sendTemp = "sendTemp";
var perTemp = "perTemp";


//Check returning users and update the state of
//the page according to saved data
$(document).ready(function() {

    //if the cookie is present, we load data from localStorage
    //if it is not, this means that it either a new
    //  connection or that data stored in localStorage has expired
    if(document.cookie.indexOf("fpcentral") > -1) {
        if (localStorage.getItem(fpTemp) != null) {
            //Filling the HTML table
            fp = JSON.parse(localStorage.getItem(fpTemp));
            for (var attribute in fp) {
                var result = fp[attribute];
                if (typeof result === "object") {
                    for (var key in result) {
                        document.getElementById(attribute + "." + key + value).innerHTML = result[key];
                    }
                } else {
                    document.getElementById(attribute + value).innerHTML = result;
                }
            }

            //Disabling the run button
            document.getElementById("runBtn").classList.add("disabled");
            //Enabling the download button
            document.getElementById("dlBtn").classList.remove("disabled");

            if (localStorage.getItem(sendTemp) != null) {
                if (localStorage.getItem(perTemp) != null) {
                    //Adding the percentage to the HTML table
                    per = JSON.parse(localStorage.getItem(perTemp));
                    for (var attribute in per) {
                        document.getElementById(attribute).innerHTML = per[attribute];
                    }

                } else {
                    document.getElementById("statsBtn").classList.remove("disabled");
                }
            } else {
                document.getElementById("sendBtn").classList.remove("disabled");
            }
        }
    } else {
        localStorage.removeItem(fpTemp);
        localStorage.removeItem(sendTemp);
        localStorage.removeItem(perTemp);
    }
});


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

    var jsonFP = JSON.stringify(fp, null, '\t');

    //Storing the current fingerprint inside localStorage
    localStorage.setItem(fpTemp, jsonFP);

    //Enabling the send and download button
    document.getElementById("sendBtn").classList.remove("disabled");
    
    var data = "text/json;charset=utf-8," + encodeURIComponent(jsonFP);
    var dlBtn = document.getElementById("dlBtn");
    dlBtn.href = "data:"+data;
    dlBtn.download = "data.json";
    document.getElementById("dlBtn").classList.remove("disabled");

    //Disabling the run button
    document.getElementById("runBtn").classList.add("disabled");

    //Set up a cookie to indicate the time of the latest test
    var expiration_date = new Date ();
    expiration_date.setTime(expiration_date.getTime() + 1000*60*60*24*15);
    document.cookie = "fpcentral = true; expires=" + expiration_date.toUTCString();
};


api.store = function(){
    //Sending the complete fingerprint to the server
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/store", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(fp));
    
    //Storing the fact that we send the FP to the database
    localStorage.setItem(sendTemp, "yes");

    //Enabling the stats button
    document.getElementById("statsBtn").classList.remove("disabled");

    //Disabling the store button
    document.getElementById("sendBtn").classList.add("disabled");
};


api.stats = function(){
    //Get the total number of FPs
    var nbFPs = parseInt(api.getTotalFP());

    //Calculate the percentage for each attribute
    var attributes = Object.keys(fp);
    for(var i =0; i<attributes.length; i++){
        var name = attributes[i];
        var result = fp[name];

        //Display percentage in HTML table
        if(typeof result === "object"){
            for(var key in result){
                api.getPercentage(name+"."+key,JSON.stringify(result[key]),nbFPs);
                nbAttributes += 1;
            }
        } else {
            nbAttributes += 1;
            api.getPercentage(name,JSON.stringify(result),nbFPs);
        }
    }

    //Disabling the stats button
    document.getElementById("statsBtn").classList.add("disabled");
};

api.statsEnd = function(){
    //Store the percentages in localStorage if all percentages have been loaded
    if(nbAttributes == statsFetched) {
        localStorage.setItem(perTemp, JSON.stringify(per, null, '\t'));
    }
};


api.getPercentage = function(name,value,nbTotal){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/stats", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var percent = parseInt(xhr.responseText)*100/nbTotal;
            var val = percent.toFixed(2).toString();
            document.getElementById(name+percentage).innerHTML = val;
            per[name+percentage] = val;
            statsFetched += 1;
            api.statsEnd();
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