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
   

    function showFilterOptions() {
        $('#filter-button').button( "option", "icons", { primary: "ui-icon-circle-minus" });
        $("#panel").slideDown("fast", function() {
            // $("#table").height($(window).height()-$("#buttons").height()-$("#panel").height()-15);
	    // $(".google-visualization-table-table").parent().height('100%');
	});
    }
    function hideFilterOptions() {
        $('#filter-button').button( "option", "icons", { primary: "ui-icon-circle-plus" });
        $("#panel").slideUp("fast", function() {
            // $("#table").height($(window).height()-$("#buttons").height()-15);
	    // $(".google-visualization-table-table").parent().height('100%');
	});
    }

    function drawTheMap() {
        window.map.draw(window.map_data, window.map_options);
    }

    // load Google visualization packages
    google.load('visualization', '1.1', {packages: ['controls', 'table']});

    // load the json
    function loadJson() {
        $.getJSON("data.json", function(json) {
            drawVisualization(json);
        })
            .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ', ' + error;
                console.log( "Request Failed: " + err);
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

        var show_data = new google.visualization.DataView(data);

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

        var keywordFilter = new google.visualization.ControlWrapper({
            'controlType': 'StringFilter',
            'containerId': 'keywordControl',
            'options': {
                'filterColumnLabel': 'Keywords',
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
        dash.bind([yearSlider, authorFilter, titleFilter, journalFilter, keywordFilter],
                  [table]).draw(show_data);

        // Set up resize listeners
        var set_widths = function ()  {
            // set the width of the width of column with the title "Name"
            var title = "Authors";
            $('.google-visualization-table-th:contains(' + title + ')').css('width', '150px');
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
            $('#loading').hide();
	    // better scrollbar management
	    if (number_of_results == 1000) {
		$("#table").height('100%');
		$(".google-visualization-table-table").parent().height('100%');
	    }
        });
    }

    // load the map after page load
    google.setOnLoadCallback(loadJson);
}
