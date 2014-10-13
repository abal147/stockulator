
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

  //Removes everything of class "portfolioRow"
  $(".watchlistRow").remove();

  //Append to list for each stock in watchedStocks
  for(var key in window.user.watchedStocks) {
  
    var li = '<li class="watchlistRow ui-btn ui-btn-icon-right">';
    var stock = window.user.watchedStocks[key];
    var difference = stock.purchasePrice - stock.currentPrice;
    var text = stock.stockID + " Diff: " + difference + " " + (difference / stock.purchasePrice) + "%"
      + " Current Price: " + stock.currentPrice + " Target Price: " + stock.targetPrice;
    var span = "";
    var a = '<a href="#" class="ui-btn ui-btn-icon-right ';

    
    if(stock.currentPrice > stock.purchasePrice) {
      a = a + 'ui-icon-arrow-u">';
      span = '<span style="color:green">';
    } else if(stock.currentPrice == stock.purchasePrice) {
      a = a + 'ui-icon-minus">';
      span = '<span style="color:black">';
    } else {
      a = a + 'ui-icon-arrow-d">';
      span = '<span style="color:red">';
    }

    $("#myWatchlist").append(li + a + span + text + '</span></a></li>');
    
  }
  
  $("#myWatchlist .watchlistRow:first-child").addClass("ui-first-child");
  $("#myWatchlist .watchlistRow:last-child").addClass("ui-last-child");
  
}



//TODO: left, center and right-align text in the same line
function populatePortfolio() {

  console.log("Populating portfolio");

  //Removes everything of class "portfolioRow"
  $(".portfolioRow").remove();

  //Append to list for each stock in ownedStocks
  for(var key in window.user.ownedStocks) {
  
    var li = '<li class="portfolioRow ui-btn ui-btn-icon-right">';
    var stock = window.user.ownedStocks[key];
    var difference = stock.purchasePrice - stock.currentPrice;
    var text = stock.stockID + " Difference: " + difference + " " + (difference / stock.purchasePrice) + "%";
    var span = "";
    var a = '<a href="#" class="ui-btn ui-btn-icon-right ';              //Can change href to a popup window for selling stocks

    
    if(stock.currentPrice > stock.purchasePrice) {
      a = a + 'ui-icon-arrow-u">';
      span = '<span style="color:green">';
    } else if(stock.currentPrice == stock.purchasePrice) {
      a = a + 'ui-icon-minus">';
      span = '<span style="color:black">';
    } else {
      a = a + 'ui-icon-arrow-d">';
      span = '<span style="color:red">';
    }

    $("#myPortfolio").append(li + a + span + text + '</span></a></li>');
    
  }
  
  $("#myPortfolio .portfolioRow:first-child").addClass("ui-first-child");
  $("#myPortfolio .portfolioRow:last-child").addClass("ui-last-child");
  
}



   