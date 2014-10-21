// DataManager
// The following javascript does the following:
// 1. Handles Fetching Metric Data from server and storing locally
// 2. Handles fetching appropriately locally stored data...
// 3. Handles storing user and historical data appropriately...

// !!!!!! NB : this file must be linked first in webpage!!!!
// TODO - perhaps take an oo approach...???

// --------------------------------------------------- //
// Function Definitions....
// --------------------------------------------------- //
function stringToJSON (data) {
// since currently json is returned as a string .. annoying...
	var out=String(data);
    var re = /NaN/gi
    out=out.replace(re,"-1");
        
    // Convert to JSON Object for manipulation
    var obj = JSON.parse(out);
    
    //console.log(" JSON Object is " + obj);
    return obj;
}

function objToSeries(obj){
// converts a JSON Object from raw data to an array of series for plotting
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

function checkStoreEnabled() {
// Function will check if the store.js is enabled ...
	init()
    function init() {
        if (!store.enabled) {
            alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.')
            return
        }
        var user = store.get('user')
        // ... and so on ...
    }
}

function checkForUser () {
// Outline: function checks if user exists, returns true if user established
	if (localStorage.getItem("userName") == undefined) {
		console.log("User does not exist");
		return false;
	}
	return true;
}

function getUser() {
// Returns the username of this app
	if (checkForUser) {
		return localStorage.getItem("userName");
	}
	return undefined;
}

function setUser(user) {
// Set the current user of this application
	localStorage.setItem("userName",user);
}

// Deprecate ......
function setCurrentStock (stockName) {
// Sets the local variable for the current stock
	localStorage.setItem("currStock",stockName);
	console.log("Set the Current Stock as:" + stockName);
	
	// Lets pull all of the data again...and reload...
	plotData(stockName,200);
	makeRequest(stockName);
}

// This is horirble.... but fuck it
function setCurrentStockObject (stockID,stockName,pegRatio,marketCap,peRatio,currentPrice,previousClose,earningShare) {
	var myStockObj={};
	
	// Create a basic stock object and append to window
	myStockObj.stockID=stockID;
	myStockObj.stockName=stockName;
	myStockObj.pegRatio=parseFloat (pegRatio);
	myStockObj.marketCap=parseFloat(marketCap);
	myStockObj.peRatio=parseFloat(peRatio);
	myStockObj.currentPrice=parseFloat(currentPrice);
	myStockObj.previousClose=parseFloat(previousClose);
	myStockObj.earningShare=parseFloat(earningShare);
	
	window.myStockObj=myStockObj;
	
	// Save to localstorage to retrive later perhaps
	store.set('currentStock',window.myStockObj);
	refreshStockInfo();
}

function getCurrentStockObject(){
	return window.myStockObj;
}

// Deprecate me ...!!!!
function getCurrentStock () {
// Gets the Current Stock we are looking at in the app
	var out = localStorage.getItem("currStock");
	if (out == undefined) {
		out = "Enter ASX Code";
	}
	console.log("Current Stock is: " + out);
	return out;
}

function currentStockDefined() {
// Determines if the current stock is defined by our app
	var out = localStorage.getItem("currStock");
	if (out == null) {
		return false;
	}
	return true;
}

function createUserFromData(userName,firstName,secondName,email,password){
	
	// 1. Create user object
	var user = new userObj(userName,firstName,secondName,email,password);
	console.log("User is : " + user);
	
	// 2. Store in memory
	store.set('user',user);
	
	// 3. Get the window user...
	window.user=user;
	
	// 4. Let the server know that we have created a new user...
	var output = user.userName + "," + user.email + "," + user.password;
	
	$.ajax({
        url: DEVSERVER_URL + "/adduser",
        //url: "0.0.0.0:8080/adduser",//TODO - change to correct server address...
        type: "POST",
        data: {user: output},
        beforeSend: function(x) {
          if (x && x.overrideMimeType) {
            x.overrideMimeType("application/j-son;charset=UTF-8");
          }
        },
        success: function(result) {
          console.log("Success!" + result);
        }
        // TODO - insert something for fail here...
      });
	
	
	return 1;
}

function sellStock(stockID,quantity,price) {
// Function is called to sell a stock

	if (stockID in window.user.ownedStocks) {
		//if (quantity > ...) TODO - implement quantity checking
		addStockToUser(stockID,stockID,-quantity,price,0,1);
	}
	else {
		console.log("error - cannot sell a stock that we do not own");
	}
}

function addStockToUser (stockID,stockName,quantity,price,targetPrice,state){
// This function will add a given stock to our user object
// State determines if the stock is bought = 1 , or watching = 0
	// 1. Check if stock already exists in user object

		if (stockID in window.user.ownedStocks){
			if (state == 1 ) {
				console.log("Stock : " + stockID + " already exists");
				window.user.ownedStocks[stockID].quantity.push(quantity);
				window.user.ownedStocks[stockID].purchaseDate.push(new Date().getTime());
				window.user.ownedStocks[stockID].purchasePrice.push(price);
			}
			else {
				// We have a bought stock that someone wants to watch
				// this does not make sense -- logic error - should not be allowed...
				console.log("Stock is not added to watched list since it is already bought!");
			}
		}
		else if (stockID in window.user.watchedStocks) {
			
			if (state == 1) {
				// The stock is currently in the watched list ... remove from watched list and add to bought list
				delete window.user.watchedStocks[stockID];
				var tempStock = new Stock(stockID,stockName,quantity,price,targetPrice);
				tempStock.pegRatio=window.myStockObj.pegRatio;
				tempStock.marketCap=window.myStockObj.marketCap;
				tempStock.peRatio=window.myStockObj.peRatio;
				tempStock.currentPrice=window.myStockObj.currentPrice;
				tempStock.previousClose=window.myStockObj.previousClose;
				tempStock.earningShare=window.myStockObj.earningShare;
				window.user.addStock(tempStock,state);
			}
			else {
				// stock is already watched but someone wants to watch it again --- logic error
				console.log("Stock already watched");
			}
		}
		else {	
			console.log("Fuck this shit....!!! - where is my fucking stockobj");
			var tempStock = new Stock(stockID,stockName,quantity,price,targetPrice);
			// Update Stock Data with Data from current stockObject
			tempStock.pegRatio=window.myStockObj.pegRatio;
			tempStock.marketCap=window.myStockObj.marketCap;
			tempStock.peRatio=window.myStockObj.peRatio;
			tempStock.currentPrice=window.myStockObj.currentPrice;
			tempStock.previousClose=window.myStockObj.previousClose;
			tempStock.earningShare=window.myStockObj.earningShare;
			
			// 2. Append to the correct user dict
			window.user.addStock(tempStock,state);
		}
	window.user.save();
	console.log("User is:");
	console.log(window.user);
}

//Deletes stock from watchlist
function deleteStock(stockID) {
  delete window.user.watchedStocks[stockID];
  refreshStocks();
  window.user.save();
}
// ------------------------------------------------------------ 


// --------------------------------------------------- //
// Object Definitions....
// --------------------------------------------------- //
// We have three main types of objects
// 1. User object : only ever one, has all of the user data including a list of stock objects
// 2. Stock Object : stores basic data w.r.t a stock. Should never be instantiated without being used in 
// in association with user object
// 3. StockHistory Object: stores the historical data of the stock object...

function attachUserMethods(userObject) {
// This function will attach appropriate methods to the user...


	userObject.upDate = function() {
		console.log('Update our user');
		// Function used by user object to update ....
		// Question : since prototype, should we perhaps define this after pulling object from store.js ...
		// TODO : need to create some kind of backend call suitable for getting the data for a user...


    //Update current price of stocks in portfolio
    var code = "";
    for(var stock in this.ownedStocks) {
      code = code + this.ownedStocks[stock].stockID + " ";
    }
		//console.log("Code is: " + code);
		$.getJSON(DEVSERVER_URL + "/price/" + code, function(data) {
  	  console.log("Portfolio data is:\n" + JSON.stringify(data));

      if(data[0]) {  //There is more than one stock queried so it has been wrapped in a key-index array
        var i = 0;
        for(stock in this.ownedStocks) {
          //console.log(">>>>>>>>" + data[i].AskRealtime);
          this.ownedStocks[stock].currentPrice = data[i].AskRealtime;
          i++;
        }  
      } else {  //Only one stock was queried
        for(stock in window.user.ownedStocks) { //Use for loop to get the key
          this.ownedStocks[stock].currentPrice = data.AskRealtime;
        } 
      }
  	});


    //Update current price of stocks in watchlist
  	code = "";
    for(var stock in this.watchedStocks) {
      code = code + this.watchedStocks[stock].stockID + " ";
    }
		//console.log("Code is: " + code);

		$.getJSON(DEVSERVER_URL + "/price/" + code, function(data) {
  	  console.log("Watchlist data is:\n" + JSON.stringify(data));

      if(data[0]) { //There is more than one stock queried so it has been wrapped in a key-index array
        var i = 0;
        for(stock in this.watchedStocks) {
          //console.log(">>>>>>>>" + data[i].AskRealtime);
          this.watchedStocks[stock].currentPrice = data[i].AskRealtime;
          i++;
        }  
      } else {  //Only one stock was queried
        for(stock in this.watchedStocks) { //Use for loop to get the key
          this.watchedStocks[stock].currentPrice = data.AskRealtime;
        }
      }   
  	});  	
    refreshStocks();
	}

	
	userObject.save = function(){ // function used to save this object to memory...
		console.log('Save our user');
		store.set('user',this);
	// TODO perhaps figure out how this can be triggered everytime a change occurs to this object...?
	}
	userObject.addStock = function (stockObject,state) {
		console.log('AddStock : ' + stockObject.stockID);
		if (state == 1) { // it is an owned stock
			// TODO - implement some type of checking if stock already exists...
			this.ownedStocks [stockObject.stockID] = stockObject; // add the stock
		}
		else { // it is a watched stock
			this.watchedStocks [stockObject.stockID] = stockObject;
		}		
	}
	userObject.getStock = function (stockID,state) {
		console.log('Get a particular Stock Object : ' + stockID);
		if (state == 1) { // owned stock
			return this.ownedStocks[stockID];
		}
		else {// watched stock
			return this.watchedStocks[stockID];
		}
	}
	userObject.getStocks = function (state) {
		console.log('Get stocks from ' + state);
		if (state == 1) { // owned stock
			return this.ownedStocks;
		}
		else {// watched stock
			return this.watchedStocks;
		}
	}
	
	userObject.getValue = function() {
	// Function will return the value of all stocks
		var value=0;
		for (var stockID in this.ownedStocks) {
			value=value+this.ownedStocks[stockID].getCurrentValue();
		}
		return value;
	}

	userObject.updateServer = function(stockID, quantity, price, state){
	// This function updates the server when transactions are made

	  console.log("user object to be sent is: " + JSON.stringify(this));

    if(state == BUY_STOCK) {
      //The commented one is plain object format
	    //var transactionData = '{"username:"' + this.userName + '", "stockID:"' + stockID 
	    //  + '", "originalPrice:"' + price + '", "amount:"' + quantity + '"}'; 

      //This one is just string format delimited by commas
      var transactionData = this.userName + ", " + stockID + ", " + price + ", " + quantity;

          
	    $.ajax({
        url: DEVSERVER_URL + "/update",
        type: "POST",
        data: {transaction: transactionData},
        beforeSend: function(x) {
          if (x && x.overrideMimeType) {
            x.overrideMimeType("application/j-son;charset=UTF-8");
          }
        },
        success: function(result) {
          console.log("Success!" + result);
        }
      });
    }
    //TODO - same thing except for selling stocks
	}
	
}

function attachStockMethods(stockObject){
	stockObject.getQuantity=function() {
		// Return quantity of the stock
		var out=0;
		for (var quantity in this.quantity ) {
			out=this.quantity[quantity] + out;
		}
		return out;
	}
	
	stockObject.getCurrentValue=function(){
		// Returns the total value of a stock
		return this.getQuantity() * this.currentPrice; 
		// NB - assuming current price is correct....
		// Check that current price is correct
	}
	
	stockObject.getProfit=function(){
		var out=0;
		for (var i=0;i<stockObject.quantity.length;i++) {
			out+=this.quantity[i] * this.purchasePrice[i];
		}
		return 1;
	}
	
	stockObject.getHistoricalData= function () {
		// 1. Check if stocks historical data is already stored in object
		if (this.historicalData != null ) { // it is defined 
			return this.historicalData;	// assume stock is already up to date		
		}
		else {
			// Check if defined in localMemory...
			// some people claim it throws an error whilst others claim it is null
			try {
				var temp = stocks.get(this.stockID);
				if (temp == null ) {
					throw "Stock is not defined"
				}
				else {
					historicalData=temp; // assign this to the private variable
				}
			}
			catch (err) {
				// we have some sort of error
				console.log ("Error with getting stock - stock is " + err);
				// Pull all of the data again... assumes server works
				// TODO ....
			}
		
			// 3. Update historicalData if it is needed
				// NB: Be careful with concurrent access to data
				// TODO - perhaps change this if a single update request is issued...
		}
	
	}
}

// 1. User Object
function userObj (userName,firstName,lastName,email,password) {
// used to store user data etc ... whilst the program is running
	this.userName=userName;
	this.firstName= firstName;
	this.lastName= lastName;
	this.email = email;
	this.netProfit=0; // not sure if we need this..
	this.lastUpdate=0; // update has not occured today
	this.availableFunds=0; // These are funds that user has on their account which are able to be used to purchase stocks
	this.password=password;
	
	this.ownedStocks = {}; // associative array of owned stock objects
	this.watchedStocks = {}; // associative array of watching stocks
	attachUserMethods(this); // attach the user methods to this object..
}

// 2. Stock Object
// had to do a name change for some reason as shit was fucking up...
function Stock (stockID,stockName,quantity,price,targetPrice) {
	this.stockID=stockID;
	this.stockName = stockName;
	// Implementing quantity, purchaseDate and purchasePrice as corresponding 
	// arrays - purchase is +quantity, sell is -quantity...
	this.quantity=[quantity];
	this.purchaseDate = [new Date().getTime()]; // epoch time in ms
	this.purchasePrice=[price];  // list of purchase prices corresponding to dates
	this.currentPrice=price;
  	this.targetPrice=targetPrice;   //Used for watchlist.. i.e watch/alert when it reaches/ goes above or below target price
  	this.targetDirection = true; // true for greater than target price, false for below target price...
	
	// I have decided to put these metrics into the object
	// perhaps saves a bit of redundancy...??
	this.peRatio=0;
	this.pegRatio=0;
	this.marketCapitalisation = 0;
	this.previousClose=0;
	this.earningShare=0;
	
	//var historicalData=null; // private variable...
	// historical data remains undefined until it is pulled for that stock
	// at which point it remains until the application closes....
	attachStockMethods(this);
}

// 3. stockHistory Object - used to store the history of a particular stock...
// TODO - implement this later on...
function stockHistory (stockName,startDate,endDate) {
	this.stockName=stockName;
	this.startDate=startDate; // start date of stock history...
	this.endDate=endDate; // end date of stock history...
	this.times=[]; // time series of history
	this.SMA=[]; // RAW SMA data series which matches up with time series
	this.EMA=[]; // RAW EMA data series which matches up with time series
	this.update = function () {
	// calls the server explicitly to update this stocks data ....
	}
	this.addData = function (data) {
	// adds the standard raw data from the server to this stock
	}
	this.getPlotData = function () {
	// returns the plot data in the format required for plotting
	}
}

// ------------------------------------------------------------ 
// --------------------Initialisation-------------------------- 
// ------------------------------------------------------------ 
// Time to actually do some shit ... this will initialise and create our user object...
 
$(function() {

	// 1. Check to see if the user is defined for this application... if not then
	try {
		// 2. Load Stored user data
		window.user = store.get('user');
		
		// a. Attach user methods to user Object
		attachUserMethods(window.user);
		
		// b. Attach Stock Methods to the stock Objects ..
		for (var index in window.user.ownedStocks) {
			attachStockMethods(window.user.ownedStocks[index]); // attach the stock methods..
		}
		for (var index in window.user.watchedStocks) {
			attachStockMethods(window.user.watchedStocks[index]); // attach the stock methods..
		}
		console.log("User object is :");
		console.log(window.user);
		
		if (window.user == null) {
			throw "undefined user";
		} 
	
		// 3. Begin Update Process ...
			// TODO - call the server and update our user object...
			// Edward......
	}
	catch (err) {
		console.log("Error is: " + err);
		console.log("Change page!");
		//if (err.match("undefined user")) {
			// Error is from undefined user - switch to new user div...
		$.mobile.changePage("#signup"); // lets switch to the signup page...
		//}
		//else {
			// not entirely sure what has gone wrong
		//	console.log("Well that's fucked ! Error is not known (yet)");
		//}
	}

/*
	$("#searchStock").empty();
	refreshASXCodes();

	var codes = localStorage.getItem("stockCSV").split("\n");

	$("#searchStock").listview().listview("refresh");

	for (var i = 3; i < 100; ++i) {
		var info = codes[i].split(",");
		var li = '<li><a href="#stockInfo">' + info[0] + '</a></li>';
		//console.log("Appending: " + li);
		$('#searchStock').append(li).listview('refresh');
	}

	console.log(codes.length);

	$("#searchStock").listview().listview("refresh");
*/

    //console.log("AARON IS CRYINGGGGGGG");
    refreshASXCodes();
    //console.log("I FUCKING HATE THIS FUCKING THING");
    
    var codes = ["#searchStock", "#searchStock2", "#searchStock3"];

    for (var i = 0; i < codes.length; ++i) {
    	var code = codes[i];
    	if (i == 0) {
    		code = "#searchStock";
    	} else if (i == 1) {
    		code = "#searchStock2";
    	}
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

	            for (var i = 1; i < codes.length; ++i) {
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

	        //console.log("CLICKITY CLACKITY ");
	    });
    }

    //console.log("I FUCKING HATE THIS FUCKING THING EVEN");


}); // self executing anonymous function ....

