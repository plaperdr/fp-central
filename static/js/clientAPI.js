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
};


api.store = function(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/store", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(fp));
};


api.stats = function(){

};
