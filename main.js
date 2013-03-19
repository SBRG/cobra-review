// load Google visualization packages
google.load('visualization', '1.1', {packages: ['controls', 'geochart', 'table']});


function loadJson() {
    $.getJSON("data.json", function(json) {
        drawVisualization(json); // this will show the info it in firebug console
    });
}

function drawVisualization(json) {
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
    var stringFilter = new google.visualization.ControlWrapper({
        'controlType': 'StringFilter',
        'containerId': 'control2',
        'options': {
            'filterColumnLabel': 'Authors',
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
	    'height': '800px',
            'pageSize': 50,
            'cssClassNames': cssClassNames
        }
    });

    // Create the dashboard.
    new google.visualization.Dashboard(document.getElementById('dashboard'))
        .bind([slider, stringFilter], [table])
    // Draw the dashboard
        .draw(show_data);


    var map_data = new google.visualization.DataView(data);
    map_data.setColumns([11]);
    for (var i=1, a=[]; i<=20; i++) a.push(i);
    map_data.setRows(a);

    var options = {
        'region': 'world',
        'displayMode': 'markers',
        'magnifyingGlass': {'enable': false},
        'markerOpacity': 0.5
    };

    var chart = new google.visualization.GeoChart(document.getElementById('map'));
    chart.draw(map_data, options);

}


google.setOnLoadCallback(loadJson);
