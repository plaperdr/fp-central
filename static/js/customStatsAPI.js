/**
 * API for the FP page of FP Central
 */

var api = {};

$(document).ready(function() {
    $('#period').slider({
        tooltip: 'always',
        formatter: function(value) {
            return value+" days";
        }
    });
});

api.sendRequest = function(){
    //Get the list of chosen attributes
    var selected = [];
    $('#selection input:checked').each(function() {
        selected.push($(this).attr('name'));
    });


    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/stats", true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
        }
    };
    xhr.send(JSON.stringify({"list":selected, "epoch": $('#period').slider('getValue')}));
};


api.changeCheckbox = function(group,bool){
    $('#'+group+"Group").find(':checkbox').each(function(){
        this.checked = bool;
    });
    api.updateBadge(group);
};

api.updateBadge = function(group){
    $('#'+group+'Badge').text($('#'+group+'Group').find(':checked').length);
};