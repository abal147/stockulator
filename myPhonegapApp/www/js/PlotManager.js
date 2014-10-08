// DataPlotter
// This JS is responsible for the following:
// 1. Plotting various graphs based on received data ... graphs include:
//		- Stock Line graphs with appropriate metrics
// 		- Pie Chart of portfolio breakdown
// 2. 

function plotPieChart (title,stocks) {
// Input : title is a string, stocks is a dict of stockObj
	
	// 1. Calculate number of stocks held
	var totalStocks=0;
	for (var stockID in stocks) {
		totalStocks += stocks[stockID].quantity;
	}
	
	// 2. Create the required graph series ...
	var seriesData = [];
	for (var stockID in stocks) {
		seriesData.push([stockID , (stocks[stockID].quantity/totalStocks) * 100.00 ] );
		// TODO - could implement it such that the most profitable stock is sliced..
	}
	
	// 3. Plot the data
	// TODO Could potentially implement more information in tooltips...i.e an actual number of stocks...
	 $('#pieChart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1,//null,
            plotShadow: false
        },
        title: {
            text: title
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: seriesData
        }]
    });
}

function plotHistData (code,seriesData) {
// The function to replace plotData below once local storage is implemented correctly...
	$('#stockChart').highcharts('StockChart', {
            rangeSelector : {
                selected : 1,
                inputEnabled: $('#container').width() > 480
            },

            title : {
                text :  code + ' - Stock Price'
            },

            series : seriesData
    });
    $.mobile.loading( "hide" ); // TODO - perhaps move elsewhere...
};

// TODO - potentially replace this code with the new history based version...
function plotData(code,numDays) {
			// Function, will plot into #stockChart the data for a code and numDays...
			
			vars={};
			vars['code']=code+".ax";
			vars['numDays']=numDays;
			console.log("Update the plot with :" + vars);
			
			// Lets show a loading widget
			$.mobile.loading( 'show', {
				text: 'Loading Data',
				textVisible: true,
				theme: "a",
				html: ""
			});
			$.getJSON('http://ec2-54-79-50-63.ap-southeast-2.compute.amazonaws.com:8080/data_historical/'+ code + '/' + numDays).done( function (data) {
        console.log("Process the data!");
        
        // 1. Fix up the json since it is not formatted correctly
        obj = stringToJSON(data);
        
        // 2. Convert the JSON Object to a series for plotting
        var seriesData = objToSeries(obj);
        
		// 3. Plot the shit		        
		$('#stockChart').highcharts('StockChart', {
            rangeSelector : {
                selected : 1,
                inputEnabled: $('#container').width() > 480
            },

            title : {
                text :  code + ' - Stock Price'
            },

            series : seriesData
        });
        $.mobile.loading( "hide" );
     	})
     	.fail (function(jqxhr,textStatus,error) {
     		var err = textStatus + ", " + error;
    		console.log( "Request Failed: " + err );
    		console.log("Done!");
    		$.mobile.loading( "hide" );
    	});
}
