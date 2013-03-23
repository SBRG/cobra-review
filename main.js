// load Google visualization packages
google.load('visualization', '1.1', {packages: ['controls', 'geochart', 'table']});


function loadJson() {
    $.getJSON("data.json", function(json) {
        drawVisualization(json);
    });
    $.getJSON("map_statistics.json", function(json) {
        drawMap(json);
    });
}

function drawMap(json) {
    // console.log('map data');
    // console.log(json);
    window.map_data = new google.visualization.arrayToDataTable(json);

    window.map_options = {
        'region': 'US',
        'displayMode': 'markers',
        'magnifyingGlass': {'enable': false},
	'color': [0xFF8747, 0xFFB581, 0xc06000],
        'markerOpacity': 1.0
    };

    window.map = new google.visualization.GeoChart(document.getElementById('map'));

    $('#map-button').button( "option", "disabled", false );
}

function drawVisualization(json) {
    $("#table").height($(window).height()-$("#control1").height()-15);
    $("#charts").outerHeight($(window).height()*0.9);
    $("#charts").outerWidth($(window).width()*0.9);
    $("#charts").css('left', $(window).width()*0.05);
    $("#charts").css('top', Math.max($(window).height()*0.05, 70));

    // Prepare the data
    var data = new google.visualization.DataTable();

    for (var i=0; i<json.header.length; i++) {
        data.addColumn(json.header[i].type, json.header[i].name);
    }

    data.addRows(json.data);
    var show_data = new google.visualization.DataView(data);
    // for (var i=1, a=[]; i<=11; i++) a.push(i);
    show_data.hideColumns([11, 12]);

    // Define a slider control for the 'Donuts eaten' column
    var yearSlider = new google.visualization.ControlWrapper({
        'controlType': 'NumberRangeFilter',
        'containerId': 'control1',
        'containerId': 'yearControl',
        'options': {
            'filterColumnLabel': 'Year',
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var citationSlider = new google.visualization.ControlWrapper({
        'controlType': 'NumberRangeFilter',
        'containerId': 'citationControl',
        'options': {
            'filterColumnLabel': 'Total Citations',
            'ui': {'labelStacking': 'vertical'}
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
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var titleFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'titleControl',
        'options': {
            'filterColumnLabel': 'Title',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var journalFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'journalControl',
        'options': {
            'filterColumnLabel': 'Journal',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var predictionFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'predictionControl',
        'options': {
            'filterColumnLabel': 'Type of Prediction',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var dataFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'dataControl',
        'options': {
            'filterColumnLabel': 'Data Integration',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var appFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'appControl',
        'options': {
            'filterColumnLabel': 'Application of Prediction',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var expFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'expControl',
        'options': {
            'filterColumnLabel': 'Experimental Validation',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var orgFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'orgControl',
        'options': {
            'filterColumnLabel': 'Organism',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'vertical'}
        }
    });
    
    var locationFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'locControl',
        'options': {
            'filterColumnLabel': 'Location',
            'matchType': 'any',
            'caseSensitive': false,
            'ui': {'labelStacking': 'vertical'}
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

    // var chart2 = new google.visualization.ChartWrapper({
    // 	'chartType': 'Pie',
    // 	'containerId': 'chart1',
    // 	'options': {}
    // });

    // Create the dashboard.
    var dash = new google.visualization.Dashboard(document.getElementById('dashboard'));
    dash.bind([yearSlider, citationSlider, authorFilter, titleFilter, journalFilter, predictionFilter, dataFilter, appFilter, expFilter, orgFilter, locationFilter], [table]).draw(show_data);
    

    var set_widths = function ()  {
        // set the width of the column with the title "Name" to 100px
        var title = "Authors";
        $('.google-visualization-table-th:contains(' + title + ')').css('width', '100px');
    }
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
            }))
        }
    });
}


google.setOnLoadCallback(loadJson);
