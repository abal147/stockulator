//Can probably re-write this function without specifically parsing the stringified JSON
function makeRequest(code){

  console.log("Making request with code: " + code);

  
  $.getJSON("http://ec2-54-79-50-63.ap-southeast-2.compute.amazonaws.com:8080/data/" + code, function(data) {
  	console.log("Data is:\n" + data);        

  	var table = document.getElementById("myTable");

	  //Clean out the rows from a previous search if any
    var rowCount = table.rows.length;
    while(rowCount > 0) {
      table.deleteRow();
      rowCount--;
    }
        
    //String formatting
    var string = JSON.stringify(data);

    //Check for invalid search query
    if(string.indexOf("No such ticker symbol") > -1) {
      var currRow = table.insertRow();
      var data = document.createElement("TD");
      var text = document.createTextNode("Invalid ASX Code: " + code);
      data.appendChild(text);
      currRow.appendChild(data);
      return;
    }
        
    string = string.replace(/{/g, "");
    string = string.replace(/}/g, "");
    string = string.replace(/"/g, "");
    string = string.replace(/:/g, "  :  ");

    //Insert rows into table
    var rows = string.split(",");
              
    for(var i = 0; i < rows.length; ++i) {
      var currRow = table.insertRow();

      console.log("row is: " + rows[i]);
      var data = document.createElement("TD");
      var text = document.createTextNode(rows[i]);
      data.appendChild(text);
      currRow.appendChild(data);           
    }
  });
}  


function populateWatchlist() {

  console.log("Populating watchlist");
 
  var table = document.getElementById("myWatchlist");

  //Clean out the rows from earlier watchlists
  var rowCount = table.rows.length;
  while(rowCount > 0) {
    table.deleteRow();
    rowCount--;
  }
      
  //Insert rows into table

  for(var key in window.user.watchedStocks) {
    var stock = window.user.watchedStocks[key];
    //console.log(stock.stockID + "  " + stock.purchasePrice + "  " + stock.currentPrice);

    var currRow = table.insertRow();
    var data = document.createElement("TD");
    var text = document.createTextNode(stock.stockID + "   Original Price: " + stock.purchasePrice 
      + "   Current Price: " + stock.currentPrice + "   Target Price: " + stock.targetPrice);
    data.appendChild(text);
    currRow.appendChild(data);    
  }
} 


//For some retarded reason, this function works the first time it's called, and then
//never again as intended until you refresh the page
function populatePortfolio() {

  console.log("Populating portfolio");

  //Removes everything of class "portfolioRow"
  $(".portfolioRow").remove();

  for(var key in window.user.ownedStocks) {
    var stock = window.user.ownedStocks[key];
    var text = stock.stockID;
    
    var li = '<li class="portfolioRow ui-btn" ';
    var span = "";
    
    if(stock.currentPrice > stock.purchasePrice) {
      li = li + 'data-icon="arrow-u">';
      span = '<span style="color:green">';
    } else if(stock.currentPrice == stock.purchasePrice) {
      li = li + 'data-icon="minus">';
      span = '<span style="color:black">';
    } else {
      li = li + 'data-icon="arrow-d">';
      span = '<span style="color:red">';
    }
    
    $("#myPortfolio").append(li + '<a href="#">' + span + text + '</span></a></li>');
    
  }
  
}



   
