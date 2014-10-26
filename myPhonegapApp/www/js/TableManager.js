
//Can probably re-write this function without specifically parsing the stringified JSON
function makeRequest(code){

  console.log("Making request with code: " + code);

  
  $.getJSON(DEVSERVER_URL + "/data/" + code, function(data) {
    setCurrentStockObject (data);
    
  });
} 

function makeRequestIndex(code, indexName){

  console.log("Making request with code: " + code);

  
  $.getJSON(DEVSERVER_URL + "/data/" + code, function(data) {
  	//console.log("Data is:\n" + JSON.stringify(data));        
   
        
    var index = data;
    var difference = index.Change;
    var text = index.LastTradePriceOnly;
    var changeText = index.Change + " (" + index.PercentChange + ")"
    var changeSpan = '<span style="font-size:75%">'
    //var li = '<li class="portfolioRow ui-btn ui-btn-icon-right" id="' + index.symbol + '">';
    
 
    if(index.Change > 0) {
      //a = a + 'ui-icon-arrow-u">';
      span = '<span style="color:green">';
    } else if(index.Change == 0) {
      //a = a + 'ui-icon-minus">';
      span = '<span style="color:black">';
    } else {
      //a = a + 'ui-icon-arrow-d">';
      span = '<span style="color:red">';
    }
    
    $("#indexes").append(indexName +"  "+ span + text + "   " +changeSpan + changeText +'</span>' +'</span><br/>');
    //console.log($("#indexes"))
  });
 
}  

function populateWatchlist() {

  console.log("Populating watchlist");

  //Removes everything of class "portfolioRow"
  $(".watchlistRow").remove();

  //Append to list for each stock in watchedStocks
  for(var key in window.user.watchedStocks) {
  
   
    var stock = window.user.watchedStocks[key];
    var difference = stock.absChange;
    var text = stock.stockID + " Difference: " + difference + " " + stock.percentChange + "%"
      + " Current Price: " + stock.currentPrice + " Target Price: " + stock.targetPrice;

    var li = '<li class="watchlistRow ui-btn ui-btn-icon-right" id="' + stock.stockID + '">';
    var span = "";

    var a = '<a href="#watchlistDialog" data-rel="popup" data-position-to="window" data-transition="pop" class="watchedStock ui-btn ui-btn-icon-right carat-r" ';

    if(stock.absChange > 0) {
      //a = a + 'ui-icon-arrow-u">';
      span = '<span style="color:green">';
    } else if(stock.absChange == 0) {
      //a = a + 'ui-icon-minus">';
      span = '<span style="color:FFAA00">';
    } else {
      //a = a + 'ui-icon-arrow-d">';
      span = '<span style="color:red">';
    }

    $("#myWatchlist").append(li + a + span + text + '</span></a></li>');
  }
  
  $("#myWatchlist .watchlistRow:first-child").addClass("ui-first-child");
  $("#myWatchlist .watchlistRow:last-child").addClass("ui-last-child");
  
}

function populateTotalPortfolio() {
 
    $("#myPortfolioTotal").empty()
    $("#myPortfolioTotalHome").empty()
    var totalQuantity = 0;
    var totalDiff = 0;
    var totalValue = 0;
    for(var key in window.user.ownedStocks) {
      var stock = window.user.ownedStocks[key];
      
      totalDiff += stock.getQuantity() * stock.absChange;
      totalValue += stock.getQuantity() * stock.currentPrice;
      console.log(stock.getQuantity() * stock.currentPrice);
    }

    window.user.portfolioValue = totalValue;
    var weightedPercent = (totalDiff/(totalValue-totalDiff))*100;
    
 
    
    var text = totalValue.toFixed(3);
    var changeText = "";
    var changeSpan = '<span style="font-size:75%">';
    //var li = '<li class="portfolioRow ui-btn ui-btn-icon-right" id="' + index.symbol + '">';
    
 
    if(totalDiff > 0) {
      //a = a + 'ui-icon-arrow-u">';
      changeText = "+" + totalDiff.toFixed(2) + " (+" + weightedPercent.toFixed(2) + "%)";
      span = '<span style="color:green">';
    } else if(totalDiff == 0) {
      changeText = "=" + totalDiff.toFixed(2);
      //a = a + 'ui-icon-minus">';
      span = '<span style="color:FFAA00">';
    } else {
      changeText = totalDiff.toFixed(2) + " (" + weightedPercent.toFixed(2) + "%)";
      //a = a + 'ui-icon-arrow-d">';
      span = '<span style="color:red">';
    }
    
    $("#myPortfolioTotal").append("Total Portfolio   "+ span + text + "   " +changeSpan + changeText +'</span>' +'</span><br/>');
    $("#myPortfolioTotalHome").append("Total Portfolio   "+ span + text + "   " +changeSpan + changeText +'</span>' +'</span><br/>');
 
}


//TODO: left, center and right-align text in the same line
function populatePortfolio() {

  console.log("Populating portfolio");

  //Removes everything of class "portfolioRow"
  $(".portfolioRow").remove();

  //Append to list for each stock in ownedStocks
  for(var key in window.user.ownedStocks) {
  
    var stock = window.user.ownedStocks[key];
    var difference = stock.absChange;
    var text = stock.stockID + " Difference: " + difference + " " + stock.percentChange + "%";

    var li = '<li class="portfolioRow ui-btn ui-btn-icon-right" id="' + stock.stockID + '">';
    var span = "";

    var a = '<a href="#stockInfo" class="boughtStock ui-btn ui-btn-icon-right ui-icon-carat-r" ';              //Can change href to a popup window for selling stocks
 
    if(stock.absChange > 0) {
      //a = a + 'ui-icon-arrow-u">';
      span = '<span style="color:green">';
    } else if(stock.absChange == 0) {
      //a = a + 'ui-icon-minus">';
      span = '<span style="color:FFAA00">';
    } else {
      //a = a + 'ui-icon-arrow-d">';
      span = '<span style="color:red">';
    }

    $("#myPortfolio").append(li + a + span + text + '</span></a></li>');
    
  }

 
   populateTotalPortfolio();
  $("#myPortfolio .portfolioRow:first-child").addClass("ui-first-child");
  $("#myPortfolio .portfolioRow:last-child").addClass("ui-last-child");
  
}



   
