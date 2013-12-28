// Set up buttons
$("#filter-button").button({ disabled: false, icons: { primary: "ui-icon-circle-minus" } }).click(function (event) {
    if ($('#panel').css('display') == 'none') {
        event.preventDefault();
        showFilterOptions();
    } else {
        hideFilterOptions();
    }
});
$("#map-button").button({ disabled: false, icons: { primary: "ui-icon-circle-plus" } }).click(function (event) {
    event.preventDefault();
    if ($('#map').css('display') == 'none') {
	$('#loading').show();
        hideLegend();
        hideCharts();
        showMap();
    } else {
        hideMap();
    }
});
$("#terms-button").button({icons: { primary: "ui-icon-circle-plus" }}).click(function (event) {
    event.preventDefault();
    if ($('#terms').css('display') == 'none') {
        hideMap();
        hideCharts();
        showLegend();
    } else {
        hideLegend();
    }
});
$("#charts-button").button({icons: { primary: "ui-icon-circle-plus" }}).click(function (event) {
    event.preventDefault();
    if ($('#charts').css('display') == 'none') {
        hideMap();
        hideLegend();
        showCharts();
        showFilterOptions();
    } else {
        hideCharts();
    }
});

// load the map and table
hideFilterOptions();
loadJson();

// definitions
function showMap() {
    $('#map-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
    $('#map').css('z-index','50');
    $('#map').fadeIn('fast');
    var t = 70;
    $("#map").outerHeight($(window).height() - t - 20);
    $("#map").outerWidth($(window).width() - 20);
    $("#map").css('left', 10);
    $("#map").css('top', t);
    drawTheMap();
}
function hideMap() {
    $('#map-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
    $('#map').fadeOut('fast');
}
function showLegend() {
    $('#terms-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
    $('#terms').css('z-index','50');
    $('#terms').fadeIn('fast');
    var t = 70;
    $("#terms").outerHeight($(window).height() - t - 20);
    $("#terms").outerWidth($(window).width() - 20);
    $("#terms").css('left', 10);
    $("#terms").css('top', t);
}
function hideLegend() {
    $('#terms-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
    $('#terms').fadeOut('fast');
}
function showFilterOptions() {
    $('#filter-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
    $("#panel").slideDown("fast", function() {
        // $("#table").height($(window).height()-$("#buttons").height()-$("#panel").height()-15);
	// $(".google-visualization-table-table").parent().height('100%');
    });
    if ($('#terms').css('display')=='block') hideLegend();
    if ($('#map').css('display')=='block') hideMap();
}
function hideFilterOptions() {
    $('#filter-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
    $("#panel").slideUp("fast", function() {
        // $("#table").height($(window).height()-$("#buttons").height()-15);
	// $(".google-visualization-table-table").parent().height('100%');
    });
    if ($('#charts').css('display')=='block') hideCharts();
}
function showCharts() {
    $('#charts-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
    $('#charts').css('z-index','50');
    sizeTheCharts();
    $('#charts').fadeIn('fast');
}
function hideCharts() {
    $('#charts-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
    $('#charts').fadeOut('fast');
}
function sizeTheCharts() {
    var t = 190;
    $("#charts").outerHeight($(window).height() - t - 20);
    $("#charts").outerWidth($(window).width() - 20);
    $("#charts").css('left', 10);
    $("#charts").css('top', t);
}
function drawTheMap() {
    window.map.draw(window.map_data, window.map_options);
}

// load the json
function loadJson() {
    console.log('loading data');
    $.getJSON("data.json", function(json) {
        drawVisualization(json);
    })
        .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ', ' + error;
            console.log( "Request Failed: " + err);
        });
    $.getJSON("map_statistics.json", function(json) {
        drawMap(json);
    });
}

function drawMap(json) {
}

function drawVisualization(json) {
    console.log('drawing table');

    var columns = json.header,
	data = json.data;
	// count = 0,
	// col_object = {};
    columns.map(function(c) {
	c.sTitle = c.name;
	c.bVisible = !(c.name == 'Great papers');
	// if (c.name=='Authors') c.sWidth = '500px';
	// col_object[c.name] = count;
	// count++;
    });
    // data.map(function(d) {
    // });
    console.log(columns);

    $('#table').dataTable({"aaData": data, 
			   "aoColumns": columns,
			   "sScrollX": "100%",
			   "sScrollY": "100%",
			   "bScrollCollapse": true,
			   "bPaginate": false});

    $('#loading').hide();
}
