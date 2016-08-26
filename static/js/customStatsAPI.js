/**
 * API for the FP page of FP Central
 */

var api = {};

$(document).ready(function() {

    $('#all').on('click', function(){
        $("#customDiv").css("display","none");
    });
    $('#tbb').on('click', function(){
        $("#customDiv").css("display","none");
    });
    $('#custom').on('click', function(){
        $("#customDiv").css("display","block");
    });

    var start = moment("2016-07-01");
    var end = moment();

    function cb(start, end) {
        $('#period span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }

    var ranges = {};
    ranges[pastDayText] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
    ranges[pastWeekText] = [moment().subtract(6, 'days'), moment()];
    ranges[pastMonthText] = [moment().subtract(1, 'month'), moment()];
    ranges[lifetimeText] = [start,end];
    $('#period').daterangepicker({
        startDate: start,
        endDate: end,
        minDate: start,
        maxDate: end,
        ranges: ranges
    }, cb);

    cb(start, end);


    $("#submitBtn").popover();
});

api.sendRequest = function(){

    var tags = [];
    var tagComb = "in";
    var selection = $('#tagSelection .active').attr('id');
    if(selection == "custom") {
        //Get the list of chosen tags
        $('#tags input:checked').each(function () {
            tags.push($(this).attr('name'));
        });
        if($("#tagAll").hasClass('active')){
            tagComb = "all";
        }
    } else if(selection == "tbb") {
        //Get the list of all Tor tags
        $("#tags").find("[name^='Tor']").each(function () {
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
        xhr.open("POST", "/customStats"+window.location.search, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var data = JSON.parse(xhr.responseText);
                //Adding data to the main graph
                api.renderGraph(data,selected,start,end);

                //Adding data to the HTML table
                api.renderTable(data,selected);
            }
        };
        var d = $('#period').data('daterangepicker');
        var format = "YYYY-MM-DD";
        var start = d.startDate.format(format);
        var end = d.endDate.format(format);
        var includeNoJS = $("#includeNoJS").prop('checked').toString();
        xhr.send(JSON.stringify({"name": selected, "start": start, "end": end, "tags": tags,
                                 "tagComb": tagComb, "includeNoJS": includeNoJS}));
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



api.renderGraph = function(jsData, attributeList, startDate, endDate){
    //Transforming the data to suit the JS charting library
    var data = [];
    var result = jsData.data;
    var fpCounter = 0;
    var totalFP = jsData.totalFP;
    var otherFPs = 0;

    for(var i =0; i<result.length; i++){
        var count = result[i].count;
        fpCounter += count;
        var percentage = count*100/totalFP;

        //If percentage above 5%, we add it directly to the graph
        //If below 5%, we add it to the "Other values" section
        if(percentage > 5) {
            //Creating label
            var label = "";
            var nbLabel = 0;
            for (var j=0; j<attributeList.length; j++){
                var att = attributeList[j];
                if (nbLabel > 0) label += "<br/>";
                label += att + " : ";
                if(result[i]._id[att] != null){
                    if(att == "timezone"){
                        label+= "UTC+" + result[i]._id[att] / -60;
                    } else {
                        label += ('' + result[i]._id[att]).substring(0, 10);
                        if(result[i]._id[att].length>10) label += '...';
                    }
                } else {
                    label += "-";
                }
                nbLabel += 1;
            }
            //Adding data
            data.push({name: label, y: count});
        } else {
            otherFPs += count;
        }
    }

    //We add other values that are not present in the given data
    if(fpCounter<totalFP){
        otherFPs += (totalFP - fpCounter);
    }

    //Adding a section for the other values for the graph
    if(otherFPs > 0) {
        data.push({name: otherText, y: otherFPs});
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
            text: ""+jsData.totalFP+" "+fpCollectText+" "+startDate+" "+andText+" "+endDate
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

api.renderTable = function(jsData, columnList){

    //Removing previous table data
    $('#table').bootstrapTable("destroy");

    //Get the name of the columns for the table header
    var columns = [
                {"field":"id","title": "N°","sortable":true, align: 'center',valign: 'middle'},
                {"field":"count","title":countText,"sortable":true,align: 'center',valign: 'middle'},
                {"field":"percentage","title":percentageText,"sortable":true,align: 'center',valign: 'middle'}
    ];
    for(var i=0; i<columnList.length; i++) columns.push({"field": columnList[i].replace(/[.()]/g,''),
        "title": columnList[i].charAt(0).toUpperCase() + columnList[i].slice(1),
        "filterControl": "input","sortable":true, align: 'center',valign: 'middle'});

    //Flatten the "_id" part of the JSON file for the table data
    var tableData = [];
    for(var i = 0; i<jsData.data.length; i++){
        var tableElement = {"id":i+1, "count":jsData.data[i].count, "percentage":(jsData.data[i].count*100/jsData.totalFP).toFixed(2) + '%'};
        for(var c in jsData.data[i]._id){
            tableElement[c.replace(/[.()]/g,'')] = jsData.data[i]._id[c]
        }
        tableData.push(tableElement);
    }

    //Create the HTML table
    $('#table').bootstrapTable({
        columns: columns,
        data: tableData,
        height: 1000,
        showColumns: true,
        showMultiSort: true,
        pageSize: 20,
        pageList: [10, 20, 50, 100]
    });

};