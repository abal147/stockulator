// DataPlotter
// This JS is responsible for the following:
// 1. Plotting various graphs based on received data ... graphs include:
//		- Stock Line graphs with appropriate metrics
// 		- Pie Chart of portfolio breakdown
// 2. 
function stringToJSON (data) {
		var out=String(data);
    var re = /NaN/gi
    out=out.replace(re,"-1");
        
    // Convert to JSON Object for manipulation
    var obj = JSON.parse(out);
    
    //console.log(" JSON Object is " + obj);
    return obj;
}

function objToSeries(obj){
// converts a JSON Object to an array of series for plotting
// Create relevant data series
    var datesRaw = obj[0];
    var smaRaw = obj[1];
    var emaRaw = obj[2];
    var trendRaw = obj[3];
           
    // Create the sma, ema charts ....
    var outArr= [];
    var inArr=[];
    
    // Create sma graph
    for (var i =0;i<smaRaw.length ; ++i ) {
      if (smaRaw[i] != -1) {
        inArr.push([datesRaw[i]*1000,smaRaw[i]]);
      }
    }
    outArr.push ({name:"sma",data:inArr , tooltip: {valueDecimals: 2}});
		
		// Create ema graph
		var emArr =[]
		for (var i =0;i<emaRaw.length ; ++i ) {
      if (emaRaw[i] != -1) {
        emArr.push([datesRaw[i]*1000,emaRaw[i]]);
      }
    }
    outArr.push ({name:"ema",data:emArr , tooltip: {valueDecimals: 2}});
    
    return outArr;
}
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
