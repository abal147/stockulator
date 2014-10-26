// ActionHandler
// This JS has the following responsibilities :
// 1. Handle dynamic actions involved with boxes and elements of a page 
// 2. Handle Initialisation of page loading w.r.t jquery and javascript

//Constants
var WATCH_STOCK = 0;
var BUY_STOCK = 1;
var MODIFY_STOCK = 2;
var SELL_STOCK = 3;
var DEVSERVER_URL = "http://ec2-54-79-50-63.ap-southeast-2.compute.amazonaws.com:8080";
var AARONSERVER_URL = "http://ec2-54-66-137-0.ap-southeast-2.compute.amazonaws.com:8080";
//var DEVSERVER_URL = "http://0.0.0.0:8080";

function handle(e, code){
 	if(e.keyCode === 13){
 	// TODO - change this to focus etc...
 	// Also, change to be more of the jquery style etc...
 		// code = $("#search-3").val();
// 		console.log("Handler: Code is:" + code );
// 		setCurrentStock($("#search-3").val());
// 		plotData(code,300); // lets plot data from the last 300 days for the code...
// 		makeRequest(code); // call eddies script to make the request..
		console.log("Code is:" + code);
		setCurrentStock(code);
		window.location.href = "#stockInfo";    //redirects to stockInfo page
    	plotData(code, 200);                    //TODO - need to clear plot for invalid search code
		makeRequest(code);
 	}

}

function changeButtons (stockName) {
	if (stockName in window.user.ownedStocks) { // Check that this is correct
			// Stock is defined....if it is 
			console.log("Stock is already owned");
			$('#sellButton').removeClass('ui-disabled');
			$('#watchButton').addClass('ui-disabled');
	}
	else if (stockName in window.user.watchedStocks) {
			console.log("Stock is watched");
			$('#watchButton').addClass('ui-disabled');
			$('#sellButton').addClass('ui-disabled');
	}
	else {
			console.log("Stock is neither watched nor owned");
			$('#sellButton').addClass('ui-disabled');
			$('#watchButton').removeClass('ui-disabled');	
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

    //Refresh balance - bit of a dirty fix for positioning
    $(".balanceText").html("Balance: $" + window.user.availableFunds + "                       ");
	
		window.user.save();
	}
}

function refreshStockInfo() {
// when called function will refresh all classes that contain the stock info 
// TO be used to refresh the buy and watch popup
	// Get the current stockObject
	console.log("Refresh stock info");
	stockObj=getCurrentStockObject();
	if (stockObj==null) {
		return; // leave as we cannot use it
	}
	
	$(".price").replaceWith("<div class=\"price\"> <p> Price : " + stockObj.currentPrice + "</p></div>");
  	$(".stockID").replaceWith("<div class =\"stockID\"> <p> StockID :" + stockObj.stockID + "</p> </div>");
  	$(".stockName").replaceWith("<div class = \"stockName\"> <p> stockName : " + stockObj.stockName + "</p></div>");
	
	// Plot the guage for the stuff...
	//plotRatios();
}

function buyWatchStock(stockID, state,qty){
  // Function is called when one wants to buy or watch a stock that is currently selected
	
	var stockName = window.myStockObj.stockName;
	var quantity = parseFloat (qty);
	var price = window.myStockObj.currentPrice;
  var targetPrice = 0;
	if(state == WATCH_STOCK) {
	  targetPrice = $("#targetPrice").val();
  } else if(state == MODIFY_STOCK) {
    targetPrice = $("#modifyTargetPrice").val();
  }
	console.log("TARGET PRICE IS: " + targetPrice);

	addStockToUser(stockID, stockName, quantity, price, targetPrice, state);
	
	

  //Update the server
  if(state == BUY_STOCK) {
    window.user.availableFunds -= (quantity * price);
    window.user.updateServer(stockID, quantity, price, state);
  }

  //refresh appropriate document elements which display owned stocks...
	refreshStocks();
 
 // Refresh the buttons
 changeButtons(stockID);
 
}


// User name validation ... etc
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
			refreshStocks();
		}
});

// Custom validation method checks that user does not already exist...
jQuery.validator.addMethod("isUserNew",function(value) {
	
	var retval=false;
	// Lets call server to see if user exists
	console.log("Check if user is new!");
	
	// Make getJson synchronous as we want to wait to see if correct user or not...
	$.ajaxSetup({
		async:false
	});
	
	// TODO - change to correct server address..
	//$.getJSON("http://0.0.0.0:8080/isusernew/" + $('#name').val(), function(data) {
	$.getJSON(DEVSERVER_URL + "/isusernew/" + $('#name').val(), function(data) {
        if (data ==="yes") {
        	console.log("User is new!");
        	retval=true;
        }
        else {
        	console.log("User is not new!");
        	//retval=false;
        	retval=true; // TODO - remove this to enable username validity checking
        	// do this once the server is up to date
        }
    })
    .fail(function() {
    	console.log("Can't reach server ...fuck!");
    	//retval=false;
    	retval=true;
    	// TODO - remove this to enable username validity checking
        // do this once the server is up to date
    	
    	$.ajaxSetup({
			  async:true
		  });
      });
    
      // make sure all ajax calls from here on in are asynchronous
      $.ajaxSetup({
		    async:true
	    });
	
	return retval;
},"Username already exists!");

jQuery.validator.classRuleSettings.isUserNew = {isUserNew : true} ; // Not sure why I have to do this...
// End of user validation ....


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
		changeButtons(getCurrentStock());
	}
	
	// Change current stock in text Box
	// Execute appropriate action for current page...
// 	$("#search-3").change (function() {
// 		setCurrentStock($("#search-3").val());
// 	});
		
	$('#ticker').rssfeed('https://au.finance.yahoo.com/news/category-stocks/?format=rss',{}, function(e) {
		$(e).find('div.rssBody').vTicker({showItems: 5});
	});

	plotDataIndicie("^AORD", "ALL ORDINARIES",60,"#indicie1");
	plotDataIndicie("^AXDJ", "S&P/ASX 200 Consumer Discretionary Index" ,60,"#indicie2");
	plotDataIndicie("^AXNJ", "S&P/ASX 200 Industrials Index " ,60,"#indicie3");

	$("#buyStock").click(function() {
		buyWatchStock(getCurrentStock(),1,$("#slider").val());
		// Create the user
		$.mobile.loading( "hide" );
		
		// If successful then return to main page...
		if (out ==1 ) {
			$.mobile.changePage("#home");
		}
	});
	
	$("#buyStock2").click(function() {
		buyWatchStock(getCurrentStock(),1,$("#slider2").val());
		// Create the user
		$.mobile.loading( "hide" );
		
		// If successful then return to main page...
		if (out ==1 ) {
			$.mobile.changePage("#home");
		}
	});
	
	$(".sellStock").click(function() {
		sellStock(getCurrentStock(),$("#sellSliderVal").val(),window.myStockObj.currentPrice);
	});
	
	$("#pageSlider").change(function() {
			//console.log("Value has changed");
			var val = parseInt ($("#slider").val());
			$(".cost").replaceWith("<div class = \"cost\"> <p> Cost : $" + parseInt(window.myStockObj.currentPrice*val) + " </p></div>"); 
	});
	
	$("#pageSlider2").change(function() {
			console.log("Value has changed");
			var val = parseInt ($("#slider2").val());
			$(".cost").replaceWith("<div class = \"cost\"> <p> Cost : $" + parseInt(window.myStockObj.currentPrice*val) + " </p></div>"); 
	});
	
	$("#sellSlider").change(function() {
			console.log("Sell Qty has changed");
			var val = parseInt ($("#sellSliderVal").val());
			$(".sellCost").replaceWith("<div class = \"sellCost\"> <p> Sell Value : $" + parseInt(window.myStockObj.currentPrice*val)+ " </p></div>"); 
	});
	
	$("#sellButton").click(function() {
		// Set the Sell quantity to be correct
		console.log("Sell button is clicked!");
		var thisStock = window.user.ownedStocks[getCurrentStock()];
		// NB: assuming that the stock can be bought....
		$("#sellSliderVal").attr("max",thisStock.getQuantity());
		$(".stockCurrQty").replaceWith("<div class = \"stockCurrQty\"> <p> Current Stock Qty: " + thisStock.getQuantity() + " </p></div>" );
	});
	
	$("#watchStock").click(function() {
		buyWatchStock(getCurrentStock(), WATCH_STOCK);
	});
	
	$( "#commentForm" ).validate({
    	rules: {

				name: {
					required: true,
					minlength: 5 ,
					isUserNew : true
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
	
  //Same as watchStock but called to modify an already watched stock
  $("#setTargetPrice").click(function() {
		buyWatchStock(getCurrentStock(), MODIFY_STOCK);
	});

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


  //Set a 120 second interval for refreshing current stock prices in user's portfolio
  window.user.upDate(); //Not sure why initial call doesn't refresh watchlist/portfolio
  setInterval(function() {window.user.upDate()}, 120000);

	// 4. Load Dynamic Content
	//refreshStocks();
 

});

$(document).on("click", ".navbutton", function(event) {
	console.log("Navbutton clicked");
	$('input[data-type="search"]').val('');
	$('input[data-type="search"]').trigger("keyup");
});

/********************** Awesomeness - one menu panel for all pages :D - could probably do this for search bar *****************/
//Only downside is writing html in one line =_=

var panel =     '<div data-role="panel" data-position="right" data-position-fixed="false" data-display="overlay" id="menu" data-theme="a" class="ui-panel ui-panel-position-right ui-panel-display-overlay ui-body-c ui-panel-animate ui-panel-open">';
panel = panel +   '<div data-role="header" data-position="fixed">';
panel = panel +     '<a href="#" data-icon="gear" data-rel="close" data-iconpos="notext" data-role="button" class="ui-btn-right"></a>';
panel = panel +   '</div>';

//panel = panel +   '<div data-role="main" class="ui-content" data-theme="a">';
//panel = panel +     '<a href="#" id="chargeButton" data-rel="popup" data-position-to="window" data-transition="pop"';
//panel = panel +       'class="ui-btn ui-li ui-corner-all ui-shadow ui-btn-inline ui-btn-b">Charge</a>';

panel = panel +   '<div class="ui-panel-inner">';
panel = panel +   '<ul data-role="listview" data-icon="false">';
panel = panel +     '<li id="panelDivider" data-role="list-divider">Menu</li>';
panel = panel +     '<li><a href="#">Twitter</a></li>';
panel = panel +     '<li><a href="#">Facebook</a></li>';
panel = panel +     '<li><a href="#">Google +</a></li>';
panel = panel +   '</ul>';
panel = panel +   '</div>';

panel = panel + '</div>';


$(document).one('pagebeforecreate', function () {
  $.mobile.pageContainer.prepend(panel);
  $("#menu").panel().enhanceWithin();
});

/*************************************************/




//Clear Text Box : When text box is clicked...clear it
// TODO
//function setupSearch(code = "#searchStock") { // this is wrong

function setupSearch(code) {
console.log("________________________________________________________________");
    $(code).listview();

    $(code).on("filterablebeforefilter", function(e, data) {
        var $ul = $(this),
            $input = $(data.input),
            value = $input.val(),
            html = "";
        $ul.html("");
        console.log("SearchValue: " + value);

        var li = "";

        if (value && value.length > 1) {
            var codes = localStorage.getItem("stockCSV").split("\n");

            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            $ul.listview( "refresh" );

            for (var i = 3; i < codes.length; ++i) {
                if (codes[i].toLowerCase().indexOf( value.toLowerCase() ) != -1) {
                    var info = codes[i].split(",");
                    li += '<li data-chapter="' + info[1] + '" data-filtertext="' + codes[i].replace(/\"/g, '') + '"><a href="#stockInfo">' + info[0].replace(/\"/g, '') + '</a></li>\n';
                }
            }
            //console.log(li);
            $ul.append(li);
            $ul.listview("refresh");
            $ul.trigger("updatelayout");
        }
    });

    $(document).on('click', code + ' li a', function (info) {
        var source = $(this).closest("li").attr("data-chapter");

        makeRequest(source);
        setCurrentStock(source);
        plotData(getCurrentStock(),200);
        $('input[data-type="search"]').val('');
        $('input[data-type="search"]').trigger("keyup");

        console.log("CLICKITY CLACKITY ");
    });
}
