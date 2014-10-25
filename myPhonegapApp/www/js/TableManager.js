
//Can probably re-write this function without specifically parsing the stringified JSON
function makeRequest(code){

  console.log("Making request with code: " + code);

  
  $.getJSON(DEVSERVER_URL + "/data/" + code, function(data) {
  	//console.log("Data is:\n" + JSON.stringify(data));        

  	var table = document.getElementById("myTable");
   
	  //Clean out the rows from a previous search if any
    var rowCount = table.rows.length;
    while(rowCount > 0) {
      table.deleteRow(-1);
      rowCount--;
    }
        
    //String formatting
   
        
   
    setCurrentStockObject (data);
    
    $.each(data, function(index, item) {
      tr = $('<tr>');
      tr.append('<td>' + index + '</td>');
      tr.append('<td>' + item + '</td>');
      $("#myTable").append(tr);
    })
  });
}  

function populateWatchlist() {

  console.log("Populating watchlist");

  //Removes everything of class "portfolioRow"
  $(".watchlistRow").remove();

  //Append to list for each stock in watchedStocks
  for(var key in window.user.watchedStocks) {
  
   
    var stock = window.user.watchedStocks[key];
    var difference = stock.currentPrice - stock.purchasePrice;
    var text = stock.stockID + " Diff: " + difference + " " + (difference * 100 / stock.purchasePrice) + "%"
      + " Current Price: " + stock.currentPrice + " Target Price: " + stock.targetPrice;

    var li = '<li class="watchlistRow ui-btn ui-btn-icon-right" id="' + stock.stockID + '">';
    var span = "";

    var a = '<a href="#watchlistDialog" data-rel="popup" data-position-to="window" data-transition="pop" class="watchedStock ui-btn ui-btn-icon-right"';
    
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
  
    var stock = window.user.ownedStocks[key];
    var difference = stock.currentPrice - stock.purchasePrice;
    var text = stock.stockID + " Difference: " + difference + " " + (difference * 100 / stock.purchasePrice) + "%";
    var li = '<li class="portfolioRow ui-btn ui-btn-icon-right" id="' + stock.stockID + '">';
    var span = "";
    var a = '<a href="#" class="boughtStock ui-btn ui-btn-icon-right ';              //Can change href to a popup window for selling stocks
 
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



   
