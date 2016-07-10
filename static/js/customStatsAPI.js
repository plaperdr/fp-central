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
    $("#submitBtn").popover();
});

api.sendRequest = function(){
    //Get the list of chosen attributes
    var selected = [];
    $('#selection input:checked').each(function() {
        selected.push($(this).attr('name'));
    });

    if(selected.length > 0) {
        $("#submitBtn").popover('destroy');
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/stats", true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                api.renderGraph(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(JSON.stringify({"list": selected, "epoch": $('#period').slider('getValue')}));
    } else {
        $("#submitBtn").popover('show');
    }
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

api.renderGraph = function(jsData){
    //Transforming the data to suit the JS charting library
    var data = [];
    var nbFP = 0;
    var result = jsData.data;
    
    for(var i =0; i<result.length; i++){
        //Creating label
        var label = "";
        var nbLabel = 0;
        for(var key in result[i]._id){
            if(nbLabel > 0) label+="<br/>";
            label += key+":"+result[i]._id[key];
            nbLabel += 1;
        }

        //Adding data
        data.push({name: label, y:result[i].count});

        //Computing stats
        nbFP += result[i].count;
    }

    //Getting date for graph title
    var d = new Date();
    var days = $('#period').slider('getValue');
    var currentDate = d.toLocaleDateString();
    d.setDate(d.getDate()- days);
    var startDate = d.toLocaleDateString();

    //Adding a section for the other values
    var otherFPs = jsData.totalFP - nbFP;
    if(otherFPs > 0) {
        data.push({name: "Other values", y: otherFPs});
    }

    //Rendering the graph
     $('#chart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ""+jsData.totalFP+" fingerprints collected between "+startDate+" and "+currentDate+ " ("+days+" days)"
        },
        tooltip: {
            //pointFormat: '{series.name}<br/>{point.percentage:.1f}%'
            pointFormat: '{point.percentage:.1f}%<br>{point.y:.0f}'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}<br/>{point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            colorByPoint: true,
            data: data
        }]
    });
};