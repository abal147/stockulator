// ActionHandler
// This JS has the following responsibilities :
// 1. Handle dynamic actions involved with boxes and elements of a page 
// 2. Handle Initialisation of page loading w.r.t jquery and javascript
function handle(e){
 	if(e.keyCode === 13){
 	// TODO - change this to focus etc...
 	// Also, change to be more of the jquery style etc...
 		code = $("#search-3").val();
		console.log("Code is:" + code);
		setCurrentStock($("#search-3").val());
		plotData(code,300); // lets plot data from the last 300 days for the code...
 	}
 	return false;
}


// Main Document Manipulation Script
// This script will be run by all documents to perform manipulation of the page..
$(document).ready (function(){
	
	$( document ).bind( 'mobileinit', function(){
  	$.mobile.loader.prototype.options.text = "loading";
  	$.mobile.loader.prototype.options.textVisible = false;
  	$.mobile.loader.prototype.options.theme = "a";
  	$.mobile.loader.prototype.options.html = "";
	});
	
	//Load Appropriate Stock in text Box
	$("#search-3").val(getCurrentStock());
	
	// Plot Stock if required ...
	// TODO - implement some sort of selectivity...
	if (currentStockDefined()) {
		plotData(getCurrentStock(),200);
	}
	
	// Change current stock in text Box
	// Execute appropriate action for current page...
// 	$("#search-3").change (function() {
// 		setCurrentStock($("#search-3").val());
// 	});

});


//Clear Text Box : When text box is clicked...clear it
// TODO


