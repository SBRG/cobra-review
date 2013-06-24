
// Set up buttons

$("#filter-button").button({ disabled: false, icons: { primary: "ui-icon-circle-plus" } }).click(function (event) {
    if ($('#panel').css('display') == 'none') {
        event.preventDefault();
        showFilterOptions();
    } else {
        hideFilterOptions();
    }
});
$("#map-button").button({ disabled: false, icons: { primary: "ui-icon-circle-plus" } }).click(function (event) {
    event.preventDefault();
    if ($('#map').css('visibility') == 'hidden') {
        hideLegend();
        hideCharts();
        showMap();

    } else {
        hideMap();
    }
});
$("#terms-button").button({icons: { primary: "ui-icon-circle-plus" }}).click(function (event) {
    event.preventDefault();
    if ($('#terms').css('visibility') == 'hidden') {
        hideMap();
        hideCharts();
        showLegend();
    } else {
        hideLegend();
    }
});
$("#charts-button").button({icons: { primary: "ui-icon-circle-plus" }}).click(function (event) {
    event.preventDefault();
    if ($('#charts').css('visibility') == 'hidden') {
        hideMap();
        hideLegend();
        showCharts();
        showFilterOptions();
    } else {
        hideCharts();
    }
});

function showMap() {
    $('#map-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
    $('#map').css('visibility','visible');
    $('#map').css('z-index','50');
    $("#map").outerHeight($(window).height()*0.9);
    $("#map").outerWidth($(window).width()*0.9);
    $("#map").css('left', $(window).width()*0.05);
    $("#map").css('top', Math.max($(window).height()*0.05, 70));
    drawTheMap();
}
function hideMap() {
    $('#map-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
    $('#map').css('visibility','hidden');
}
function showLegend() {
    $('#terms-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
    $('#terms').css('visibility','visible');
    $('#terms').css('z-index','50');
    $("#terms").outerHeight($(window).height()*0.9);
    $("#terms").outerWidth($(window).width()*0.9);
    $("#terms").css('left', $(window).width()*0.05);
    $("#terms").css('top', Math.max($(window).height()*0.05, 70));
}
function hideLegend() {
    $('#terms-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
    $('#terms').css('visibility','hidden');
}
function showFilterOptions() {
    $('#filter-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
    $("#panel").slideDown("slow", function() {
	for (var i=0; i<window.redrawFilters.length; i++) {
	    window.redrawFilters[i].draw();
	}
    });
}
function hideFilterOptions() {
    $('#filter-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
    $("#panel").slideUp("slow");
}
function showCharts() {
    $('#charts-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
    $('#charts').css('visibility','visible');
    $('#charts').css('z-index','50');
    sizeTheCharts();
}
function hideCharts() {
    $('#charts-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
    $('#charts').css('visibility','hidden');
}

$("#logout-button").button();

function sizeTheCharts() {
    var t =  Math.max($(window).height()*0.05, 180);
    $("#charts").outerHeight(($(window).height() - t)*0.9);
    $("#charts").outerWidth($(window).width()*0.9);
    $("#charts").css('left', $(window).width()*0.05);
    $("#charts").css('top', t);
}

function drawTheMap() {
    window.map.draw(window.map_data, window.map_options);
}



// load Google visualization packages
google.load('visualization', '1.1', {packages: ['controls', 'geochart', 'table']});

// load the json
function loadJson() {
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
    console.log('drawing map');
    window.map_data = new google.visualization.arrayToDataTable(json);

    window.map_options = {
        'region': 'world',
        'displayMode': 'markers',
        'magnifyingGlass': {'enable': false},
        'color': [0xFF8747, 0xFFB581, 0xc06000],
        'markerOpacity': 1.0,  
	'backgroundColor': '#FFFFFF',
	'datalessRegionColor': '#E5E5E5',
	'colorAxis': { 'colors': ['#6BAED6','#08519C']},
	'sizeAxis':  {'minSize': 5,  'maxSize': 10}
	// 'resolution'
    };

    window.map = new google.visualization.GeoChart(document.getElementById('map'));
}

function drawVisualization(json) {
    console.log('drawing table');
    $("#table").height($(window).height()-$("#control1").height()-15);
    sizeTheCharts();

    // Prepare the data
    var data = new google.visualization.DataTable();

    for (var i=0; i<json.header.length; i++) {
        data.addColumn(json.header[i].type, json.header[i].name);
    }

    data.addRows(json.data);
    var show_data = new google.visualization.DataView(data);
    // for (var i=1, a=[]; i<=11; i++) a.push(i);
    // show_data.hideColumns([11, 12, 13]);

    // Define a slider control for the 'Donuts eaten' column
    var yearSlider = new google.visualization.ControlWrapper({
        'controlType': 'NumberRangeFilter',
        'containerId': 'control1',
        'containerId': 'yearControl',
        'options': {
            'filterColumnLabel': 'Year',
            'ui': {'labelStacking': 'horizontal'}
        }
    });

    window.redrawFilters = [yearSlider];

    // Define a StringFilter control for the 'Name' column
    var authorFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'authorControl',
        'options': {
            'filterColumnLabel': 'Authors',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });

    var titleFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'titleControl',
        'options': {
            'filterColumnLabel': 'Title',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });
    
    var journalFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'journalControl',
        'options': {
            'filterColumnLabel': 'Journal',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });

    var predictionFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'predictionControl',
        'options': {
            'filterColumnLabel': 'Computational Prediction',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });

    var dataFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'dataControl',
        'options': {
            'filterColumnLabel': 'High-throughput data integration',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });

    var appFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'appControl',
        'options': {
            'filterColumnLabel': 'Prediction Application',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });

    var expFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'expControl',
        'options': {
            'filterColumnLabel': 'Consistent with experiments',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });

    var orgFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'orgControl',
        'options': {
            'filterColumnLabel': 'Organism',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });

    var locationFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'locControl',
        'options': {
            'filterColumnLabel': 'Location',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'horizontal'}
        }
    });
     
    var cssClassNames = {
        'headerRow': '',// 'small-font blue-background',
        'tableRow': 'small-font',
        'oddTableRow': 'small-font',
        'selectedTableRow': '',
        'hoverTableRow': '',
        'headerCell': '',
        'tableCell': '',
        'rowNumberCell': ''
    };

    // Define a table
    var table = new google.visualization.ChartWrapper({
        'chartType': 'Table',
        'containerId': 'table',
        'options': {
            'showRowNumber': true,
            'alternatingRowStyle': true,
            'page': 'enable',
            'pageSize': 50,
            'cssClassNames': cssClassNames,
            'allowHtml': true
        }
    });
    window.table = table;
    window.added_listener = false;
    window.added_width_listener = false;

    var chart1 = new google.visualization.ChartWrapper({
        'chartType': 'PieChart',
        'containerId': 'chart1',
        'width': '100%',
        'height': '100%',
        'chartArea': {
            'width': '100%',
            'height': '100%'
        },
        'options': {
            'sliceVisibilityThreshold': 0.01,
            'width': '100%'
        },
        'view': {'columns': [9]}
    });

    // Create the dashboard.
    var dash = new google.visualization.Dashboard(document.getElementById('dashboard'));
    dash.bind([yearSlider, authorFilter, titleFilter, journalFilter,
               predictionFilter, dataFilter, appFilter, expFilter, orgFilter, locationFilter],
              [table, chart1]).draw(show_data);


    // Set up resize listeners
    var set_widths = function ()  {
        // set the width of the column with the title "Name" to 100px
        var title = "Authors";
        $('.google-visualization-table-th:contains(' + title + ')').css('width', '100px');
    };
    google.visualization.events.addListener(table, 'ready', function () {
        console.log('table ready');
        set_widths();
        if (!window.added_width_listener) {
            window.added_width_listener = true;
            google.visualization.events.addListener(table.getChart(), 'sort', set_widths);
        }
    });

    google.visualization.events.addListener(dash, 'ready', function () {
        console.log('dash ready');
        if (!window.added_listener) {
            window.added_listener = true;
            $(window).resize( $.debounce( 250, function() {
                console.log('redrawing');
                window.table.draw();
            }));
        }
    });
}

// load the map after page load
google.setOnLoadCallback(loadJson);
