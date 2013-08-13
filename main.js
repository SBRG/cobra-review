var load_review = function(number_of_results) {
    if (number_of_results=='all') number_of_results = 1000;

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

        google.visualization.events.addListener(window.map, 'ready', function () {
	    console.log('map ready');
	    $('#loading').hide();
	});
    }

    function drawVisualization(json) {
        console.log('drawing table');

        // Prepare the data
        var data = new google.visualization.DataTable();

        for (var i=0; i<json.header.length; i++) {
            data.addColumn(json.header[i].type, json.header[i].name);
        }

        data.addRows(json.data);

        // highlight "Great papers"
        for (var i=0; i<data.getNumberOfRows(); ++i) {
            for (var j=0; j<data.getNumberOfColumns(); ++j) {
                if (json.data[i][0] != "") data.setProperty(i, j, 'style', 'background:rgb(248, 218, 185);');
            }
        }

        var show_data = new google.visualization.DataView(data);
        show_data.hideColumns([0]);     // hide "Great papers" column

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
            'headerRow': 'medium-font',// 'small-font blue-background',
            'tableRow': 'small-font',
            'oddTableRow': 'small-font',
            'selectedTableRow': 'white-background',
            'hoverTableRow': 'white-background',
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
                'alternatingRowStyle': false,
                'page': 'enable',
                'pageSize': 650,
                'cssClassNames': cssClassNames,
                'allowHtml': true,
		'pageSize': number_of_results
            }
        });
        window.table = table;
        window.added_listener = false;
        window.added_width_listener = false;

	$("#charts").show(); 
	sizeTheCharts();
	var first = true;

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
            // set the width of the width of column with the title "Name"
            var title = "Authors";
            $('.google-visualization-table-th:contains(' + title + ')').css('width', '150px');
        };

	// too slow
	// google.visualization.events.addListener(yearSlider, 'statechange', function () {
	//     $('#loading').show();
	// });

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
            $('#loading').hide();
	    if (first) {	//hide the charts after the first load
		$("#charts").hide();
		first = false;
	    }
	    // better scrollbar management
	    if (number_of_results == 1000) {
		$("#table").height('100%');
		$(".google-visualization-table-table").parent().height('100%');
	    }
	    // resize on resize
            if (!window.added_listener) {
                window.added_listener = true;
                $(window).resize( $.debounce( 250, function() {
                    console.log('redrawing');
                    if (false) {
                        $('#loading').show();
                        window.setTimeout(function() {
                            window.table.draw();
                            if ($('#charts').css('display')=='block') {
                                sizeTheCharts();
                            }
                        }, 10);
                    } else {
                        sizeTheCharts();
                    }
                }));
            }
        });
    }

    // load the map after page load
    google.setOnLoadCallback(loadJson);
}
