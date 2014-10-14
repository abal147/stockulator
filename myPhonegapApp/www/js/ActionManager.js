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


/*
	Event handler for key presses into the search bar on the search page
*/
function handleNameSearch(e){
	refreshASXCodes();

	//Grab search code
	code = $('#nameSearch').val();

	//Refresh the results table first by deleting all rows
	var table = document.getElementById("searchTable");

	var rowCount = table.rows.length;
    while(rowCount > 0) {
        table.deleteRow(-1);
        rowCount--;
    }

    //if the search bar is empty show no results
	if (code.length == 0) {
		return false;
	}

	var ASXcodes = localStorage.getItem("stockCSV").split("\n");
	var re = new RegExp(code.toUpperCase());

	/*
		For each row in the ASX code list,
		match it against the search term
		for any match, return that row
	*/
	
	for (var i = 3; i < ASXcodes.length; ++i) {
		if (re.test(ASXcodes[i].toUpperCase())) {
			var stock = ASXcodes[i].split(",");

			var currRow = table.insertRow();

			// Create a dynamic button to link to the stock page            
            var text = document.createTextNode(ASXcodes[i]);
			var $button = $('<button/>', {
				type: 'button',
				'class': 'dynBtn',
				id: stock[1],
				text: stock[0].replace(/\"/g, ''),
				inline: false,
				click: function() {

					makeRequest(this.id);
					setCurrentStock(this.id);
					plotData(getCurrentStock(),200);

					document.location = "#stockInfo";
					console.log("Clicked: " + this.id);
				}
			});

			$button.appendTo(document.getElementById("searchTable").insertRow());
		}
	}

	return false;
}

function refreshASXCodes() {

	var grabbed = false;

	var lines = localStorage.getItem("stockCSV");
	if (lines == null) {
		// If there is no stored list, grab it
		grabASXCodes();
		grabbed = true;
		lines = localStorage.getItem("stockCSV");
	} else {

		//If a list is in local storage, grab a new one if it was grabbed before today

		var firstLine = lines.split("\n")[0].split(" ");
		//looks like
		//"ASX listed companies as at Tue Oct 14 20:14:17 EST 2014"
		var lastPulled = firstLine[6] + " " + firstLine[7] + ", " + firstLine[10];

		var dateLastPulled = new Date(lastPulled);
		var today = new Date(Date.now());

		if (today.getDate() != dateLastPulled.getDate() ||
				today.getMonth() != dateLastPulled.getMonth() ||
				today.getFullYear() != dateLastPulled.getFullYear()) {
			grabASXCodes();
			grabbed = true;
		}
	}
	if (grabbed) {
		console.log("Grabbed new ASX codes");
	} else {
		console.log("Using existing ASX Codes");
	}
	return grabbed;
}


/*
	Grabs ASX codes from the asx page and cleans the results a bit
*/
function grabASXCodes() {
	$.get("http://www.asx.com.au/asx/research/ASXListedCompanies.csv"
			, function(data) {
				var lines = data.split("\n");
				for (var i = 3; i < lines.length; ++i) {
					var stock = lines[i].split(",");
					stock[1] = stock[1] + ".AX";
					lines[i] = stock.join(",");
				}
				data = lines.join("\n");
				localStorage.setItem("stockCSV",data);
			}
		);
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


