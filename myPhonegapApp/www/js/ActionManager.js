// ActionHandler
// This JS has the following responsibilities :
// 1. Handle dynamic actions involved with boxes and elements of a page 
// 2. Handle Initialisation of page loading w.r.t jquery and javascript
function handle(e, code){
 	if(e.keyCode === 13){
 	// TODO - change this to focus etc...
 	// Also, change to be more of the jquery style etc...
 		//code = $("#search-3").val();
    //code = document.getElementbyId("search-3").value;

		console.log("Code is:" + code);
		setCurrentStock(code);
		window.location.href = "#stockInfo";    //redirects to stockInfo page
    plotData(getCurrentStock(), 200);
		makeRequest(code);
 	}

}

$("#search-3").bind( "focus", function(event, ui) {
  console.log("hi");
});


function clear() {
  console.log("Search bar clicked");
  document.getElementById(id).value = "";
}

function refreshStocks() {
// Function will refresh the lists and dynamic elements in a page with stocks...
	if (window.user) {
		// Refresh the stock pie chart breakdown with bought data...
		plotPieChart('Stock Breakdown',window.user.getStocks(1));
	
		// Update the Server about user
		window.user.updateServer();
	}
}

function buyWatchStock(stockID,state){
// Function is called when one wants to buy a stock that is currently selected
	var stockName="woolworths";
	var quantity = parseInt ($("#slider").val());
	var price = 100; // TODO - fix this...
	addStockToUser(stockID,stockName,quantity,price,state);
	
	//refresh appropriate document elements which display owned stocks...
	refreshStocks();
	console.log("Stock " + stockID + " is bought or watched"); 
}


// Main Document Manipulation Script
// This script will be run by all documents to perform manipulation of the page..
$(document).ready (function(){

	console.log("Document Manipulation Script has been run");
	
	// 1. initialise mobile loader
	$( document ).bind( 'mobileinit', function(){
  	$.mobile.loader.prototype.options.text = "loading";
  	$.mobile.loader.prototype.options.textVisible = false;
  	$.mobile.loader.prototype.options.theme = "a";
  	$.mobile.loader.prototype.options.html = "";
	});
	
	//2. Load Appropriate Stock in text Box
	$(".search").val(getCurrentStock());
	
	//3. Plot historical graph of Stock if required ...
	// TODO - implement some sort of selectivity...
	if (currentStockDefined()) {
		plotData(getCurrentStock(),200);
		makeRequest(getCurrentStock());
	}
	
	// Change current stock in text Box
	// Execute appropriate action for current page...
// 	$("#search-3").change (function() {
// 		setCurrentStock($("#search-3").val());
// 	});
	
	// JQuery asynchronous watching functions...
	$("#signupSubmit").click(function() {
		console.log("Signup submit clicked");
		// Lets show a loading widget
		$.mobile.loading( 'show', {
			text: 'Loading Data',
			textVisible: true,
			theme: "a",
			html: ""
		});
		// TODO - check that values input are consistent o correct
		// highlight if wrong ...
		
		// Create the user
		var out = createUserFromData($('#username').val(),$('#firstname').val(),$('#lastname').val(),$('#email').val());;
		$.mobile.loading( "hide" );
		
		// If successful then return to main page...
		if (out ==1 ) {
			$.mobile.changePage("#home");
		}
	});
	
	$("#buyStock").click(function() {
		buyWatchStock(getCurrentStock(),1);
	});
	
	$("#watchStock").click(function() {
		buyWatchStock(getCurrentStock(),0);
	});
	
	console.log("here");
	// 4. Load Dynamic Content
	refreshStocks();


});

