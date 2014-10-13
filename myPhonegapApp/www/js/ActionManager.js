// ActionHandler
// This JS has the following responsibilities :
// 1. Handle dynamic actions involved with boxes and elements of a page 
// 2. Handle Initialisation of page loading w.r.t jquery and javascript
function handle(e){
 	if(e.keyCode === 13){
 	// TODO - change this to focus etc...
 	// Also, change to be more of the jquery style etc...
 		code = $("#search-3").val();
		console.log("Handler: Code is:" + code );
		setCurrentStock($("#search-3").val());
		plotData(code,300); // lets plot data from the last 300 days for the code...
		makeRequest(code); // call eddies script to make the request..
 	}
 	return false;
}

function handleNameSearch(e){
	console.log("handleNameSearch: keyCode: " + e.keyCode);
	if (e.keyCode === 13) {
		refreshASXCodes();
	}
	code = $('#nameSearch').val();
	console.log("handleNameSearch: code:" + code);
	return false;
}

function refreshASXCodes() {
/*
	$.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.asx.com.au%2Fasx%2Fresearch%2FASXListedCompanies.csv%22&format=json"
		, function(data) {
			var result = data.query.results.body.p;
			var csvLines = result.split("\" ");
			for(var i = 0; i < csvLines.length; ++i) {
				console.log(csvLines[i]);
			}
		});
*/
	$.get("http://www.asx.com.au/asx/research/ASXListedCompanies.csv"
		, function(data) {
			localStorage.setItem("stockCSV",data);
			console.log("Downloaded CSV")
		}
	);

	var lines = localStorage.getItem("stockCSV");
	for (var i = 0; i < 10; ++i) {
		console.log(lines.split("\n")[i]);
	}
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


//Clear Text Box : When text box is clicked...clear it
// TODO


