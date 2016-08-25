/**
 * Fingerprint API for FP Central
 */

var attributes = [];
var api = {};

//Variable containing the current fingerprint and stats
var fp = {};
var stats = {"fp": {}};
var tags = [];
var nbAttributes = 0;
var statsFetched = 0;
var showAcceptable = false;

var value = "Val";
var percentage = "Per";
var acceptable = "Acc";
var popover = "Pop";
var fpTemp = "fpTemp";
var sendTemp = "sendTemp";
var statsTemp = "statsTemp";
var undef = "Undefined";
var perColumns = ["Per","PerLimit","PerTotal","PerTotalLimit"];

//Functions for dashboard and table transitions
function btnTransition(name){
    //Disabling the run button and providing feedback to the user
    var btn = document.getElementById(name+"Btn");
    btn.classList.add("disabled");
    btn.classList.remove("btn-info");
    btn.classList.add("btn-success");
    document.getElementById(name+"Ok").classList.add("fa-check-circle-o");

    if(name == "stats"){
        $("#percSelection").css("display","inline");
    }
}

function dlBtnTransition(fpData){
    var data = "text/json;charset=utf-8," + encodeURIComponent(fpData);
    var dlBtn = document.getElementById("dlBtn");
    dlBtn.href = "data:" + data;
    dlBtn.download = "fingerprint.json";
    dlBtn.classList.remove("disabled");
}

function setTooltip(nbFPs,tagPresent,limitPresent){
    //Add a tooltip on each table header
    var tooltip = "Out of "+nbFPs+" fingerprints";
    var id  = "";
    if(tagPresent){
        tooltip += " with tags: ["+tags.toString()+"]";
    } else {
        id += "Total";
    }
    if(limitPresent){
        tooltip += " collected in the past 90 days";
        id += "Limit";
    }
    document.getElementById("httpPer"+id+"Header").title = tooltip;
    document.getElementById("JSPer"+id+"Header").title = tooltip;
}

function showAcceptableColumn(){
    //Show columns
    $("#httpTable,#jsTable").toggleClass("hideAcc");

    //Show legend
    $("#acceptableLegend").show();

    //Activate all popover elements
    $("i[id$='"+popover+"']").popover()
}

function switchPercentages(withTags,withLimit) {
    $("#httpTable,#jsTable").addClass('hidePer hidePerLimit hidePerTotal hidePerTotalLimit');
    if(withTags){
        if(withLimit){
            $("#httpTable,#jsTable").removeClass('hidePerLimit');
        } else {
            $("#httpTable,#jsTable").removeClass('hidePer');
        }
    } else {
        if(withLimit){
            $("#httpTable,#jsTable").removeClass('hidePerTotalLimit');
        } else {
            $("#httpTable,#jsTable").removeClass('hidePerTotal');
        }
    }

}


//Updating the state of the collection page
$(document).ready(function() {

    //We change the shown percentages on click
    $('#withoutTags').on('click', function(){ switchPercentages(false,$("#withLimit").hasClass('active')); } );
    $('#withTags').on('click', function(){ switchPercentages(true,$("#withLimit").hasClass('active')); } );
    $('#withoutLimit').on('click', function(){ switchPercentages($("#withTags").hasClass('active'),false); } );
    $('#withLimit').on('click',function(){ switchPercentages($("#withTags").hasClass('active'),true); } );

    //if the cookie is present, we load data from localStorage
    //if it is not, this means that it is either a new
    //connection or that data stored in localStorage has expired
    if(document.cookie.indexOf("fpcentral") > -1) {
        if (localStorage.getItem(fpTemp) != null) {
            //Filling the HTML table
            fp = JSON.parse(localStorage.getItem(fpTemp));
            for (var attribute in fp) {
                var result = fp[attribute];
                api.addValue(attribute,result);
            }

            //Disabling the run button and providing visual feedback to the user
            btnTransition("run");

            //Enabling the download button
            dlBtnTransition(localStorage.getItem(fpTemp));

            if (localStorage.getItem(sendTemp) != null) {
                btnTransition("send");
                tags = JSON.parse(localStorage.getItem(sendTemp));

                if (localStorage.getItem(statsTemp) != null) {

                    //We get the percentages if each value + the number of FP
                    stats = JSON.parse(localStorage.getItem(statsTemp));

                    //Add a tooltip on each table header
                    setTooltip(stats["numberPer"],true,false);
                    setTooltip(stats["numberPerLimit"],true,true);
                    setTooltip(stats["numberPerTotal"],false,false);
                    setTooltip(stats["numberPerTotalLimit"],false,true);
                    $('[data-toggle="tooltip"]').tooltip({placement : 'top'});

                    //We perform the transition on the dashboard
                    btnTransition("stats");

                    //Adding the percentage to the HTML table
                    for(var attribute in stats["fp"]) {
                        var att = stats["fp"][attribute];
                        for(var i=0; i<perColumns.length; i++) {
                            api.addPercentage(attribute, perColumns[i], att[perColumns[i]]);
                        }
                        api.addAcceptable(attribute,att);
                    }

                    if(showAcceptable) {
                        //We display the table headers and columns that were hidden
                        showAcceptableColumn();
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
        localStorage.removeItem(statsTemp);
    }
});


/************ API FUNCTIONS ************/

//Registering name and tests of attributes
api.register = function(name,code){
    attributes.push({'name':name,'code':code});
};



//Functions to add values in the HTML table
api.addValue = function(name, result){
    if(result != null) {
        if (result.constructor === {}.constructor) {
            for (var key in result) {
                api.addValue(name + "." + key, result[key]);
            }
        } else {
            document.getElementById(name + value).innerHTML = result;
        }
    }
};

api.addPercentage = function(name, type, result){
    document.getElementById(name + type).innerHTML = result;
};

api.addAcceptable = function(name,jsonData){
    //Add the acceptable value
    if(jsonData.hasOwnProperty("acceptable")) {
        api.addAcceptableValue(name, jsonData.acceptable);

        //Add the info if present
        if (jsonData.hasOwnProperty("popular")) {
            api.addAcceptableInfo(name, jsonData.percentage, jsonData.popular);
        }

        //Add the helper link if present
        if (jsonData.hasOwnProperty("link")) {
            api.addAcceptableHelper(name, jsonData.link);
        }
    }
};

api.addAcceptableValue = function(name, value){
    var glyph = "";
    var color = "";
    if(value == "Yes") {
        color = "#B9D98A";
        glyph = "check";
        showAcceptable = true;
    } else if (value == "No") {
        color = "#FF8080";
        glyph = "times";
        showAcceptable = true;
    } else {
        color = "#A3A3C2";
        glyph = "minus";
    }
    document.getElementById(name + acceptable).innerHTML ="<i class='fa fa-" + glyph + "' style='color:"+color+"'></i>";
};


api.addAcceptableInfo = function(name,percent,popular){
    var text = "Only "+percent+"% of collected fingerprints share the same value as you for the \""+name+"\" attribute. The most ";
    text += "popular value is \""+popular[0]._id+"\" shared by "+(popular[0].count*100/stats["numberPer"]).toFixed(2).toString()+"% of the population.";

    var idHtml = name+popover;
    var addHTML = "&nbsp; <i id='"+idHtml+"' class='fa fa-info-circle  clickableGlyph'";
    addHTML +=  "data-container='body' data-toggle='popover' data-placement='left' data-content='"+text+"'></i>";

    document.getElementById(name + acceptable).innerHTML += addHTML;
};

api.addAcceptableHelper = function(name,link){
    document.getElementById(name + acceptable).innerHTML +=
        "&nbsp; <a href='tor#"+link+"' target='_blank' style='color: #3E3F3A'><i class='fa fa-question-circle'></i></a>";
};



//Functions for the different phases of the collection process
api.run = function (){
    var promises = [];

    //Running registered tests
    for(var i =0; i<attributes.length; i++){
        var name = attributes[i].name;
        var result = attributes[i].code();
        //Display results in HTML table
        if (result != undefined && typeof result.then === "function") {
            //Result is a promise, wait for the result
            promises.push(result);
            result.then(function(result){
                var checkedResult = api.checkResult(result.data);
                fp[result.name] = checkedResult;
                api.addValue(result.name,checkedResult);
            });
        } else {
            //Result is either undefined, a single value or a JSON object
            var checkedResult = api.checkResult(result);
            fp[name] = checkedResult;
            api.addValue(name, checkedResult);
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

api.checkResult = function(result){
    //Replace undefined values with the "Undefined" string
    if(result == undefined){
        return undef;
    } else {
        if (result.constructor === {}.constructor) {
            for (var key in result) {
                result[key] = api.checkResult(result[key]);
            }
            return result;
        } else {
            return result;
        }
    }
};

api.postRun = function(){
    var jsonFP = JSON.stringify(fp, null, '\t');

    //Storing the current fingerprint inside localStorage
    localStorage.setItem(fpTemp, jsonFP);

    //Enabling the send and download button
    document.getElementById("sendBtn").classList.remove("disabled");
    dlBtnTransition(jsonFP);

    //Disabling the run button and providing visual feedback to the user
    btnTransition("run");

    //Set up a cookie to indicate the time of the latest test
    var expiration_date = new Date();
    expiration_date.setTime(expiration_date.getTime() + 1000 * 60 * 60 * 24 * 15);
    document.cookie = "fpcentral = true; expires=" + expiration_date.toUTCString();
};

api.send = function(){
    //Sending the complete fingerprint to the server
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/store", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if(xhr.status == 200) {
                //Storing the tags even if empty
                var res = JSON.parse(xhr.responseText);
                tags = res.tags;
                localStorage.setItem(sendTemp, JSON.stringify(tags));

                //Enabling the stats button
                document.getElementById("statsBtn").classList.remove("disabled");

                //Disabling the send button and providing visual feedback to the user
                btnTransition("send");

            } else {
                console.log("Error when sending data to server");
            }
        }
    };

    xhr.send(JSON.stringify(fp));
};


api.stats = function(){
    //Calculate the percentage for each attribute
    //And get the acceptable values if the list of
    //tags is not empty
    var attributes = Object.keys(fp);
    for(var i =0; i<attributes.length; i++){
        var name = attributes[i];
        var result = fp[name];
        api.exploreJSON(name,result);
    }
};

api.exploreJSON = function(name,result){
    if (result.constructor === {}.constructor) {
        for (var key in result) {
            api.exploreJSON(name + "." + key, result[key]);
        }
    } else {
        api.getPerAndAcc(name,JSON.stringify(result));
        nbAttributes += 1;
    }
};

api.statsEnd = function(){
    //If all stats have been loaded
    if(nbAttributes == statsFetched) {
        //Store them in localStorage
        localStorage.setItem(statsTemp, JSON.stringify(stats, null, '\t'));

        //Disabling the stats button and providing visual feedback to the user
        btnTransition("stats");

        //We display the table headers that were hidden if
        //there are acceptable values
        if(showAcceptable) {
            showAcceptableColumn();
        }
    }
};

api.getPerAndAcc = function(name,value){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/stats", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {

            //Parsing JSON result
            var jsonData = JSON.parse(xhr.responseText);

            //Adding percentages to the table
            for(var i=0; i<perColumns.length; i++) {
                var val = (parseInt(jsonData[perColumns[i]]) * 100 /  stats["number"+perColumns[i]]).toFixed(2).toString();
                jsonData[perColumns[i]] = val;

                //Adding percentage to Table
                api.addPercentage(name, perColumns[i], val);
            }

            //Adding acceptable value if present
            api.addAcceptable(name,jsonData);

            //We store the result in the stats JSON object
            //And increase the number of statsFetched by 1
            stats["fp"][name] = jsonData;
            statsFetched += 1;

            api.statsEnd();
        }
    };

    xhr.send(JSON.stringify({"name": name, "value": value, "tags": tags, "tagComb": "all"}));
};

api.getNumberFP = function(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/stats/number", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var jsonData = JSON.parse(xhr.responseText);

            //Add a tooltip on each table headers
            stats["numberPer"] = jsonData["numberPer"];
            setTooltip(jsonData["numberPer"],true,false);
            stats["numberPerLimit"] = jsonData["numberPerLimit"];
            setTooltip(jsonData["numberPerLimit"],true,true);
            stats["numberPerTotal"] = jsonData["numberPerTotal"];
            setTooltip(jsonData["numberPerTotal"],false,false);
            stats["numberPerTotalLimit"] = jsonData["numberPerTotalLimit"];
            setTooltip(jsonData["numberPerTotalLimit"],false,true);
            $('[data-toggle="tooltip"]').tooltip({placement : 'top'});

            //Get the percentages of every values
            api.stats();
        }
    };
    xhr.send(JSON.stringify({"tags":tags, "tagComb": "all"}));
};