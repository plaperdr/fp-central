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
            api.renderGraph(JSON.parse(xhr.responseText));
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

api.renderGraph = function(result){
    //Transforming the data to suit the JS charting library
    var data = [];

    for(var i =0; i<result.length; i++){
        //Adding labels
        var label = "";
        var nbLabel = 0;
        for(var key in result[i]._id){
            if(nbLabel > 0) label+="<br/>";
            label += key+":"+result[i]._id[key];
            nbLabel += 1;
        }

        //Adding data
        data.push({name: label, y:result[i].count});
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
            text: ''
        },
        tooltip: {
            //pointFormat: '{series.name}<br/>{point.percentage:.1f}%'
            pointFormat: '{point.percentage:.1f}%'
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