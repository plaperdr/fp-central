/**
 * API for the FP page of FP Central
 */

var api = {};

$(document).ready(function() {

    $('#all').on('click', function(){
        $("#tags .btn, #tags :checkbox").prop('checked','true').attr('disabled','disabled');
    });
    $('#custom').on('click', function(){
        $("#tags .btn, #tags :checkbox").removeAttr('disabled');
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
                var data = JSON.parse(xhr.responseText);
                //Adding data to the main graph
                api.renderGraph(data,start,end);

                //Adding data to the HTML table
                api.renderTable(data);
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



api.renderGraph = function(jsData, startDate, endDate){
    //Transforming the data to suit the JS charting library
    var data = [];
    var result = jsData.data;
    var totalFP = jsData.totalFP;
    var otherFPs = 0;

    for(var i =0; i<result.length; i++){
        var count = result[i].count;
        var percentage = count*100/totalFP;

        //If percentage above 5%, we add it directly to the graph
        //If below 5%, we add it to the "Other values" section
        if(percentage > 5) {
            //Creating label
            var label = "";
            var nbLabel = 0;
            for (var key in result[i]._id) {
                if (nbLabel > 0) label += "<br/>";
                label += key + ":" + ((key == "timezone") ? "UTC+" + result[i]._id[key] / -60 : ('' + result[i]._id[key]).substring(0, 10));
                nbLabel += 1;
            }

            //Adding data
            data.push({name: label, y: count});
        } else {
            otherFPs += count;
        }
    }

    //Adding a section for the other values for the graph
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

api.renderTable = function(jsData){

    //Removing previous table data
    $('#table').bootstrapTable("destroy");

    //Get the name of the columns for the table header
    var columns = [
                {"field":"id","title": "N°","sortable":true, align: 'center',valign: 'middle'},
                {"field":"count","title":"Count","sortable":true,align: 'center',valign: 'middle'},
                {"field":"percentage","title":"Percentage","sortable":true,align: 'center',valign: 'middle'}
    ];
    for(var c in jsData.data[0]._id) columns.push({"field": c, "title": c.charAt(0).toUpperCase() + c.slice(1),
        "filterControl": "input","sortable":true, align: 'center',valign: 'middle'});

    //Flatten the "_id" part of the JSON file for the table data
    var tableData = [];
    for(var i = 0; i<jsData.data.length; i++){
        var tableElement = {"id":i+1, "count":jsData.data[i].count, "percentage":jsData.data[i].count*100/jsData.totalFP + '%'};
        for(var c in jsData.data[i]._id){
            tableElement[c] = jsData.data[i]._id[c]
        }
        tableData.push(tableElement);
    }

    //Create the HTML table
    $('#table').bootstrapTable({
        columns: columns,
        data: tableData,
        height: 500,
        showColumns: true,
        showMultiSort: true
    });

};