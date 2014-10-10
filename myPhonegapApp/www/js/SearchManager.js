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
