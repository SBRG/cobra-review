// Set up buttons
$("#filter-button").button({ disabled: false, icons: { primary: "ui-icon-circle-minus" } }).click(function (event) {
    if ($('#panel').css('display') == 'none') {
        event.preventDefault();
        showFilterOptions();
    } else {
        hideFilterOptions();
    }
});
// load the map and table
loadJson();

// definitions
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
}
function drawVisualization(json) {
    console.log('drawing table');

    // go through data
    var columns = json.header,
	data = json.data,
	count = 0,
	col_object = {},
	min_year = 3000,
	max_year = 0;
    columns.map(function(c) {
	c.sTitle = c.name;
	c.bVisible = !(c.name == 'Great papers' || c.name == 'authors_all');
	if (c.name == 'Short Description') c.sWidth = '450px';
	// if (count < 6) c.bVisible = false;
	col_object[c.name] = count;
	count++;
    });
    data.map(function(d) {
	var year = d[col_object['Year']]; 
	min_year = year < min_year ? year : min_year;
	max_year = year > max_year ? year : max_year;
    });

    // Custom filtering function which will filter data in column four between
    // two values
    $.fn.dataTableExt.afnFiltering.push(
	function( oSettings, aData, iDataIndex ) {
            var min = parseInt($("#year-slider").slider("values", 0)),
		max = parseInt($("#year-slider").slider("values", 1)),
		val = parseInt(aData[col_object['Year']]);
            return (min <= val && val <= max);
	}
    );
    
    var table = $('#table').dataTable({
	"aaData": data, 
	"aoColumns": columns,
	"sScrollX": "100%",
	"sScrollXInner": "2000px",
        "bAutoWidth": false,
	"bPaginate": false,
	"bSortClasses": false,
	"sDom": '<"#panel"if>t',
	"aaSorting": [[col_object['Year'], 'asc'],
		      [col_object['Authors'], 'asc']],
	// "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
	//     nRow.className = aData[col_object['Great papers']] == "" ? 
	// 	nRow.className : 
	// 	nRow.className + " great";
	// }
    });

    // Add the filter    
    $('<div id="year-slider"></div>').appendTo('#panel').slider({
	range: true,
	min: min_year,
	max: max_year,
	values: [min_year, max_year],
	slide: function( event, ui ) {
            $( "#year-text" ).text(ui.values[ 0 ] + " - " + ui.values[ 1 ]);
	},
	change: function( event, ui ) {
	    table.fnDraw();
	}
    });

    $('<label class="right" id="year-text"></label>').appendTo('#panel')
	.text($( "#year-slider" ).slider( "values", 0 ) + " - " + $( "#year-slider" ).slider( "values", 1 ));
    $('<label class="right">Year: </label>').appendTo('#panel');

    table.fnDraw();		// TODO fix this; it's redundant

    // hide the filters && loading div
    // hideFilterOptions();
    $('#loading').hide();
}
