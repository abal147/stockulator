//Parser written by some dude on stack overflow
function parseURL() {
	var url = document.URL;
    var queryStart = url.indexOf("?") + 1,
    queryEnd   = url.indexOf("#") + 1 || url.length + 1,
    query = url.slice(queryStart, queryEnd - 1),
    pairs = query.replace(/\+/g, " ").split("&"),
    parms = {}, i, n, v, nv;

    if (query === url || query === "") {
          return;
    }

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=");
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

    	if (!parms.hasOwnProperty(n)) {
       	 parms[n] = [];
    	}
    	parms[n].push(nv.length === 2 ? v : null);
	}
          
    //Only parse the first parameter which is the searched ASX code
    makeRequest(parms.code[0]);
}

function makeRequest(code){

    console.log("code is: " + code);

    $.getJSON("http://ec2-54-79-50-63.ap-southeast-2.compute.amazonaws.com:8080/data/" + code, function(data) {
    	console.log("hi");
    	console.log(data);        

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