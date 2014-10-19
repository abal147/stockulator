// ActionHandler
// This JS has the following responsibilities :
// 1. Handle dynamic actions involved with boxes and elements of a page 
// 2. Handle Initialisation of page loading w.r.t jquery and javascript

//Constants
var WATCH_STOCK = 0;
var BUY_STOCK = 1;
var MODIFY_STOCK = 2;
var DEVSERVER_URL = "http://ec2-54-79-50-63.ap-southeast-2.compute.amazonaws.com:8080";


function handle(e, code){
 	if(e.keyCode === 13){
 	// TODO - change this to focus etc...
 	// Also, change to be more of the jquery style etc...


		console.log("Code is:" + code);
		setCurrentStock(code);
		window.location.href = "#stockInfo";    //redirects to stockInfo page
    plotData(code, 200);                    //TODO - need to clear plot for invalid search code
		makeRequest(code);
 	}

}

function refreshStocks() {
// Function will refresh the lists and dynamic elements in a page with stocks...
	if (window.user) {
		// Refresh the stock pie chart breakdown with bought data...
		plotPieChart('Stock Breakdown',window.user.getStocks(1));

    // Refresh watchlist
    populateWatchlist();

    // Refresh portfolio
    populatePortfolio();
	
		window.user.save();
	}
}

function buyWatchStock(stockID, state){
  // Function is called when one wants to buy, watch or modify a stock that is currently selected
	var stockName = "woolworths"; // TODO - extract stock name?
	var quantity = parseInt ($("#slider").val());   //TODO - add to current quantity if stock already owned, may cause a bug with updateServer
	var price = 100; // TODO - fix this...
  var targetPrice = 0;
  
	if(state == WATCH_STOCK) {
	  targetPrice = $("#targetPrice").val();
  } else if(state == MODIFY_STOCK) {
    targetPrice = $("#modifyTargetPrice").val();
  }
  
	//console.log("TARGET PRICE IS: " + targetPrice);
	addStockToUser(stockID, stockName, quantity, price, targetPrice, state);
	
	//refresh appropriate document elements which display owned stocks...
	refreshStocks();

  //Update the server
  if(state == BUY_STOCK) {
    window.user.updateServer(stockID, quantity, price, state);
  }
  //TODO - update server for selling stocks as well
	
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
	

	$(".buyStock").click(function() {
		buyWatchStock(getCurrentStock(), BUY_STOCK);
	});
	
	$("#watchStock").click(function() {
		buyWatchStock(getCurrentStock(), WATCH_STOCK);
	});

  //Same as watchStock but called to modify an already watched stock
  $("#setTargetPrice").click(function() {
		buyWatchStock(getCurrentStock(), MODIFY_STOCK);
	});

  //Besides the handle function, when does currentStock get set?
  $("#unwatchStock").click(function() {
    console.log("Unwatching stock: " + getCurrentStock());
    deleteStock(getCurrentStock());
  });




  //Can't seem to write a named function instead of using the same
  //anonymous function without getting an error

  //Called when something with the "a" tag and "watchedStock" class is clicked
  $(document).on("click", "a.watchedStock" , function (event) {
    //Traverse up tree until an element has an id
    
    //Necessary because for some reason this function is still called when the
    //text part is clicked (which doesn't have the class "watchedStock")
    var target = event.target || event.srcElement;
    while (target && !target.id) {
        target = target.parentNode;
    }
        
    setCurrentStock(target.id);
    console.log("Current stock is:" + getCurrentStock());
    //console.log("Event id is: " + target.id);
  });

  //Called when something with the "a" tag and "boughtStock" class is clicked
  $(document).on("click", "a.boughtStock" , function(event) {
    //Traverse up tree until an element has an id
    var target = event.target || event.srcElement;
    while (target && !target.id) {
        target = target.parentNode;
    }
    setCurrentStock(target.id);
    //console.log("Current stock is:" + getCurrentStock());
    //console.log("Event id is: " + target.id);
  });


  //Set a 10 second interval for refreshing current stock prices in user's portfolio
  window.user.upDate(); //Not sure why initial call doesn't refresh watchlist/portfolio
  setInterval(function() {window.user.upDate()}, 10000);

	// 4. Load Dynamic Content
	//refreshStocks();
 

});



