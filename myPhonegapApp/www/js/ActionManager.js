// ActionHandler
// This JS has the following responsibilities :
// 1. Handle dynamic actions involved with boxes and elements of a page 
// 2. Handle Initialisation of page loading w.r.t jquery and javascript
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
	
		// Update the Server about user
		window.user.updateServer();
	}
}

function refreshStockInfo() {
// when called function will refresh all classes that contain the stock info 
// TO be used to refresh the buy and watch popup
	// Get the current stockObject
	stockObj=getCurrentStockObject();
	if (stockObj==null) {
		return; // leave as we cannot use it
	}
	
	$(".price").replaceWith("<div class=\"price\"> <p> Price : " + stockObj.currentPrice + "</p></div>");
  	$(".stockID").replaceWith("<div class =\"stockID\"> <p> StockID :" + stockObj.stockID + "</p> </div>");
  	$(".stockName").replaceWith("<div class = \"stockName\"> <p> stockName : " + stockObj.stockName + "</p></div>");
}

function buyWatchStock(stockID, state){
  // Function is called when one wants to buy a stock that is currently selected
  // state 0 is watching stock, state 1 is buying stock
	
	var stockName = window.myStockObj.stockName; // TODO - extract stock name?
	var quantity = parseFloat ($("#slider").val());
	var price = window.myStockObj.currentPrice;
  	var targetPrice = 0; // TODO - fix this
	if(state == 0) {
	  targetPrice = $("#targetPrice").val();
  	}
	console.log("TARGET PRICE IS: " + targetPrice);
	addStockToUser(stockID, stockName, quantity, price, targetPrice, state);
	
	//refresh appropriate document elements which display owned stocks...
	refreshStocks();
	console.log("Stock " + stockID + " is bought or watched"); 
}


//Create user if the data is valid...
$.validator.setDefaults({
		submitHandler: function() {
			alert("User Created Successfully!"); // TODO - change to jquery alert...
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
			var out = createUserFromData($('#name').val(),"undefined","undefined",$('#email').val(),$('#password').val());
			$.mobile.loading( "hide" );
		
			// If successful then return to main page...
			if (out ==1 ) {
				$.mobile.changePage("#home");
			}
		}
});




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
		refreshStockInfo();
	}
	
	// Change current stock in text Box
	// Execute appropriate action for current page...
// 	$("#search-3").change (function() {
// 		setCurrentStock($("#search-3").val());
// 	});
		
	$("#buyStock").click(function() {
		buyWatchStock(getCurrentStock(),1);
	});
	
	$("#pageSlider").change(function() {
			console.log("Value has changed");
			var val = parseInt ($("#slider").val());
			$(".cost").replaceWith("<div class = \"cost\"> <p> Cost : $" + window.myStockObj.currentPrice*val + " </p></div>"); 
		});
	
	$("#watchStock").click(function() {
		buyWatchStock(getCurrentStock(),0);
	});
	
	$( "#commentForm" ).validate({
    	rules: {

				name: {
					required: true,
					minlength: 5
				},
				password: {
					required: true,
					minlength: 5
				},
				confirm_password: {
					required: true,
					minlength: 5,
					equalTo: "#password"
				},
				email: {
					required: true,
					email: true
				},
		},
		highlight: function(label) {
            $(label).closest('.form-element').addClass('error')
            .closest('.form-element').removeClass('success');;
        },
        success: function(label) {
            label
            .text('OK!').addClass('valid')
            .closest('.form-element').addClass('success');
        },
    	messages: {
        	name: {
        		required:"UserName is required.",
        		minlength : "Your Username must be atleast 5 characters long"
        	},
        	email: {
            	required: "Email is required.",
            	email: "You must provide a valid email address."
        	},
        	password: {
					required: "Please provide a password",
					minlength: "Your password must be at least 5 characters long"
			},
			confirm_password: {
					required: "Please provide a password",
					minlength: "Your password must be at least 5 characters long",
					equalTo: "Please enter the same password as above"
			},
    	},
    	
    	focusInvalid: false
	});
	
	$("#historyView").click(function(){
		plotPortHistory();
	});
	
	$("#profitView").click(function(){
		plotProfitData();
	});
	
	$("#pieView").click(function(){
		plotPieChart("Stock BreakDown",window.user.ownedStocks);
	});
	
	// 4. Load Dynamic Content
	refreshStocks();
	populatePortfolio();
	populateWatchlist();
	
 

});



