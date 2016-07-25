/**
 * API for the FP page of FP Central
 */

var api = {};

$(document).ready(function() {

    $('#tagSelection').on('click', function(){
        if($(this).find(".active").attr('id')=="all"){
            $("#tags .btn, #tags :checkbox").removeAttr('disabled');
        } else {
            $("#tags .btn, #tags :checkbox").attr('disabled','disabled');
        }
    });



    var start = moment("2016-07-01");
    var end = moment();

    function cb(start, end) {
        $('#period span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }

    $('#period').daterangepicker({
        startDate: start,
        endDate: end,
        minDate: start,
        maxDate: end,
        ranges: {
            'Past day': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Past week': [moment().subtract(6, 'days'), moment()],
            'Past Month': [moment().subtract(1, 'month'), moment()],
            'Lifetime': [start,end]
        }
    }, cb);

    cb(start, end);


    $("#submitBtn").popover();
});

api.sendRequest = function(){

    var tags;
    if($('#tagSelection .active').attr('id') == "custom") {
        //Get the list of chosen tags
        tags = [];
        $('#tags input:checked').each(function () {
            tags.push($(this).attr('name'));
        });
    } else {
        tags = "all";
    }

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
                api.renderGraph(JSON.parse(xhr.responseText),start,end);
            }
        };
        var d = $('#period').data('daterangepicker');
        var format = "YYYY-MM-DD";
        var start = d.startDate.format(format);
        var end = d.endDate.format(format);
        xhr.send(JSON.stringify({"list": selected, "start": start, "end": end, "tags": tags}));
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

api.renderGraph = function(jsData,startDate,endDate){
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
            label += key+":"+ ((key == "timezone")?  "UTC+"+result[i]._id[key]/-60 :result[i]._id[key]);
            nbLabel += 1;
        }

        //Adding data
        data.push({name: label, y:result[i].count});

        //Computing stats
        nbFP += result[i].count;
    }

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
            text: ""+jsData.totalFP+" fingerprints collected between "+startDate+" and "+endDate
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