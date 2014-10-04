// DataManager
// The following javascript does the following:
// 1. Handles Fetching Metric Data from server and storing locally
// 2. Handles fetching appropriately locally stored data...

// !!!!!! NB : this file must be linked first in webpage!!!!
// TODO - perhaps take an oo approach...???

// --------------------------------------------------- //
// Function Definitions....
// --------------------------------------------------- //
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
// ------------------------------------------------------------ 


// ------------------------------------------------------------ 
// --------------------Initialisation-------------------------- 
// ------------------------------------------------------------ 

// 1. Check to see if the user is defined for this application...

