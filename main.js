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
    var slider = new google.visualization.ControlWrapper({
        'controlType': 'NumberRangeFilter',
        'containerId': 'control1',
        'options': {
            'filterColumnLabel': 'Year',
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

    // Create the dashboard.
    var dash = new google.visualization.Dashboard(document.getElementById('dashboard'));
    dash.bind([slider, authorFilter, titleFilter, journalFilter], [table]).draw(show_data);
    

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
