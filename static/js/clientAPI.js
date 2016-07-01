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

//Function for dashboard transition
function btnTransition(name){
    //Disabling the run button and providing feedback to the user
    var btn = document.getElementById(name+"Btn");
    btn.classList.add("disabled");
    btn.classList.remove("btn-info");
    btn.classList.add("btn-success");
    document.getElementById(name+"Ok").classList.add("glyphicon-ok-circle");
}


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
                api.addTable(attribute,result);
            }

            //Disabling the run button and providing visual feedback to the user
            btnTransition("run");

            //Enabling the download button
            var data = "text/json;charset=utf-8," + encodeURIComponent(localStorage.getItem(fpTemp));
            var dlBtn = document.getElementById("dlBtn");
            dlBtn.href = "data:" + data;
            dlBtn.download = "fingerprint.json";
            dlBtn.classList.remove("disabled");

            if (localStorage.getItem(sendTemp) != null) {
                btnTransition("send");
                if (localStorage.getItem(perTemp) != null) {
                    btnTransition("stats");
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

api.addTable = function(name,result){
    if (result.constructor === {}.constructor) {
        for (var key in result) {
            api.addTable(name + "." + key, result[key]);
        }
    } else {
        document.getElementById(name + value).innerHTML = result;
    }
};

api.run = function (){
    var promises = [];

    //Running registered tests
    for(var i =0; i<attributes.length; i++){
        var name = attributes[i].name;
        var result = attributes[i].code();
        //Display results in HTML table
        if (typeof result.then === "function") {
            //Result is a promise, wait for the result
            promises.push(result);
            result.then(function(result){
                fp[result.name] = result.data;
                api.addTable(result.name,result.data);
            });
        } else {
            //Result is either a single value or a JSON object
            fp[name] = result;
            api.addTable(name, result);
        }
    }

    //Adding HTTP headers
    var headers = document.getElementById("headers");
    for(var j=0; j<headers.children.length; j++){
        var header = headers.children[j];
        fp[header.cells[0].textContent] = header.cells[1].textContent;
    }

    if(promises.length == 0) {
        api.postRun();
    } else {
        Promise.all(promises).then(function(){
           api.postRun();
        });
    }
};

api.postRun = function(){
    var jsonFP = JSON.stringify(fp, null, '\t');

    //Storing the current fingerprint inside localStorage
    localStorage.setItem(fpTemp, jsonFP);


    //Enabling the send and download button
    document.getElementById("sendBtn").classList.remove("disabled");

    var data = "text/json;charset=utf-8," + encodeURIComponent(jsonFP);
    var dlBtn = document.getElementById("dlBtn");
    dlBtn.href = "data:" + data;
    dlBtn.download = "fingerprint.json";
    document.getElementById("dlBtn").classList.remove("disabled");

    //Disabling the run button and providing visual feedback to the user
    btnTransition("run");

    //Set up a cookie to indicate the time of the latest test
    var expiration_date = new Date();
    expiration_date.setTime(expiration_date.getTime() + 1000 * 60 * 60 * 24 * 15);
    document.cookie = "fpcentral = true; expires=" + expiration_date.toUTCString();
};

api.store = function(){
    //Sending the complete fingerprint to the server
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/store", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                //Storing the fact that we send the FP to the database
                localStorage.setItem(sendTemp, "yes");

                //Enabling the stats button
                document.getElementById("statsBtn").classList.remove("disabled");

                //Disabling the store button and providing visual feedback to the user
                btnTransition("send");
            } else {
                console.log("Error when sending data to server");
            }
        }
    };

    xhr.send(JSON.stringify(fp));
};


api.stats = function(){
    //Get the total number of FPs
    var nbFPs = parseInt(api.getTotalFP());

    //Calculate the percentage for each attribute
    var attributes = Object.keys(fp);
    for(var i =0; i<attributes.length; i++){
        var name = attributes[i];
        var result = fp[name];
        api.exploreJSON(name,result,nbFPs);
    }

    //Disabling the stats button and providing visual feedback to the user
    btnTransition("stats");
};

api.exploreJSON = function(name,result,nbFPs){
    if (result.constructor === {}.constructor) {
        for (var key in result) {
            api.exploreJSON(name + "." + key, result[key],nbFPs);
        }
    } else {
        api.getPercentage(name,JSON.stringify(result),nbFPs);
        nbAttributes += 1;
    }
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