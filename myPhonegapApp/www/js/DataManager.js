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

function setCurrentStock (stockName) {
// Sets the local variable for the current stock
	localStorage.setItem("currStock",stockName);
	console.log("Set the Current Stock as:" + stockName);
}

function getCurrentStock () {
// Gets the Current Stock we are looking at in the app
	var out = localStorage.getItem("currStock");
	if (out == undefined) {
		out = "Enter ASX Code";
	}
	console.log("Current Stock is" + out);
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

function createUserFromData(userName,firstName,secondName,email){
	
	// 1. Create user object
	var user = new userObj(userName,firstName,secondName,email);
	
	console.log("User is : " + user);
	// 2. Store in memory
	store.set('user',user);
	
	// 3. Get the window user...
	window.user=user;
	// TODO - potentially change this in future if not successful
	return 1;
}

function addStockToUser (stockID,stockName,quantity,price,targetPrice,state){
// This function will add a given stock to our user object
// State determines if the stock is bought = 1 , or watching = 0
	// 1. Create the stock Object
	var tempStock = new stockObj(stockID,stockName,quantity,price,targetPrice);
	
	// 2. Append to the correct user dict
	window.user.addStock(tempStock,state);
	
	// 3. Save the window user again such that the stock is saved
	window.user.save();
	
	console.log("User is:");
	console.log(window.user);
	
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
	userObject.updateServer = function(){
	// This function will update the server with the current state of this object...
	// 	var out = JSON.stringify(this);
// 		$.ajax ({
// 			url: 'http://ec2-54-79-50-63.ap-southeast-2.compute.amazonaws.com:8080/data_historical/' , // server address
// 			type:'POST',
// 			contentType : 'application/json',
// 			data: { json: out},
// 			dataType:'json'
// 		});
	
	}
}

// 1. User Object
function userObj (userName,firstName,lastName,email) {
// used to store user data etc ... whilst the program is running
	this.userName=userName;
	this.firstName= firstName;
	this.lastName= lastName;
	this.email = email;
	this.netProfit=0; // not sure if we need this..
	this.lastUpdate=0; // update has not occured today
	
	this.ownedStocks = {}; // associative array of owned stock objects
	this.watchedStocks = {}; // associative array of watching stocks
	attachUserMethods(this); // attach the user methods to this object..
}

// 2. Stock Object
function stockObj (stockID,stockName,quantity,price,targetPrice) {
	this.stockID=stockID;
	this.stockName = stockName;
	this.quantity=quantity;
	this.purchaseDate = 0;
	this.purchasePrice=price;       //Or price of stock if being added to watchlist
	this.currentPrice=price;
  this.targetPrice=targetPrice;   //Used for watchlist
	
	var historicalData=null; // private variable...
	// historical data remains undefined until it is pulled for that stock
	// at which point it remains until the application closes....
	this.getHistoricalData= function () {
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

// 3. stockHistory Object - used to store the history of a particular stock...
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
		attachUserMethods(window.user);
		console.log("User object is :");
		console.log(window.user);
		
		if (window.user == null) {
			throw "undefined user"
		} 
	
		// 3. Begin Update Process ...
			// TODO - call the server and update our user object...
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
}); // self executing anonymous function ....
