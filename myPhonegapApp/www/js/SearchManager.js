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

// Commented out for now, but we have this function in tablemanager
// function makeRequest(code){
// 
//     console.log("code is: " + code);
// 
//     $.getJSON("http://ec2-54-79-50-63.ap-southeast-2.compute.amazonaws.com:8080/data/" + code, function(data) {
//     	console.log("hi");
//     	console.log(data);        
// 
//     	var table = document.getElementById("myTable");
// 
//     	//Clean out the rows from a previous search if any
//         var rowCount = table.rows.length;
//         while(rowCount > 0) {
//             table.deleteRow(-1);
//             rowCount--;
//         }
//             
//         //String formatting
//         var string = JSON.stringify(data);
// 
//         //Check for invalid search query
//         if(string.indexOf("No such ticker symbol") > -1) {
//             var currRow = table.insertRow();
//             var data = document.createElement("TD");
//             var text = document.createTextNode("Invalid ASX Code: " + code);
//             data.appendChild(text);
//             currRow.appendChild(data);
//             return;
//         }
//             
//         string = string.replace(/{/g, "");
//         string = string.replace(/}/g, "");
//         string = string.replace(/"/g, "");
//         string = string.replace(/:/g, "  :  ");
// 
//         //Insert rows into table
//         var rows = string.split(",");
//                   
//         for(var i = 0; i < rows.length; ++i) {
//             var currRow = table.insertRow();
// 
//             console.log("row is: " + rows[i]);
//             var data = document.createElement("TD");
//             var text = document.createTextNode(rows[i]);
//             data.appendChild(text);
//             currRow.appendChild(data);           
//               
//         }
//     });
// }        

/*
    Event handler for key presses into the search bar on the search page
*/
function handleNameSearch(e){
    refreshASXCodes();

    //Grab search code
    code = $('#nameSearch').val();

    //Refresh the results table first by deleting all rows
    var table = document.getElementById("searchTable");

    var rowCount = table.rows.length;
    while(rowCount > 0) {
        table.deleteRow(-1);
        rowCount--;
    }

    //if the search bar is empty show no results
    if (code.length <= 1) {
        return false;
    }

    var ASXcodes = localStorage.getItem("stockCSV").split("\n");
    var re = new RegExp(code.toUpperCase());

    /*
        For each row in the ASX code list,
        match it against the search term
        for any match, return that row
    */
    
    for (var i = 3; i < ASXcodes.length; ++i) {
        if (re.test(ASXcodes[i].toUpperCase())) {
            var stock = ASXcodes[i].split(",");

            var currRow = table.insertRow();

            // Create a dynamic button to link to the stock page            
            var text = document.createTextNode(ASXcodes[i]);
            var $button = $('<input/>', {
                type: 'button',
                'class': 'dynBtn',
                id: stock[1],
                text: stock[0].replace(/\"/g, ''),
                value: stock[0].replace(/\"/g, ''),
                inline: false,
                click: function() {

                    makeRequest(this.id);
                    setCurrentStock(this.id);
                    plotData(getCurrentStock(),200);

                    document.location = "#stockInfo";
                    console.log("Clicked: " + this.id);
                }
            });

            $button.appendTo(document.getElementById("searchTable").insertRow());
        }
    }

    return false;
}

function refreshASXCodes() {
    //console.log("Step1");

    var grabbed = false;
    //console.log("Step1");
    var lines = localStorage.getItem("stockCSV");
    //console.log("Step1");
    if (lines == null) {
        // If there is no stored list, grab it
        grabASXCodes();
        grabbed = true;
        lines = localStorage.getItem("stockCSV");
    } else {

        //If a list is in local storage, grab a new one if it was grabbed before today

        var firstLine = lines.split("\n")[0].split(" ");
        //looks like
        //"ASX listed companies as at Tue Oct 14 20:14:17 EST 2014"
        var lastPulled = firstLine[6] + " " + firstLine[7] + ", " + firstLine[10];

        var dateLastPulled = new Date(lastPulled);
        var today = new Date(Date.now());

        var lastPulledDateInt = 0;
        lastPulledDateInt += 10000 * dateLastPulled.getFullYear();
        lastPulledDateInt += 100 * dateLastPulled.getMonth();
        lastPulledDateInt += dateLastPulled.getDate();

        console.log("Last pulled on: " + lastPulledDateInt);

        if (today.getDate() != dateLastPulled.getDate() ||
                today.getMonth() != dateLastPulled.getMonth() ||
                today.getFullYear() != dateLastPulled.getFullYear()) {
            grabASXCodes();
            grabbed = true;
        }
    }
    if (grabbed) {
        console.log("Grabbed new ASX codes");
    } else {
        console.log("Using existing ASX Codes");
    }
    return grabbed;
}

/*
    Grabs ASX codes from the asx page and cleans the results a bit
*/
function grabASXCodes() {

    $.getJSON(DEVSERVER_URL + "/asxcodes"
        , function(data) {

            var lines = data["data"].split("\n");
            for (var i = 1; i < lines.length; ++i) {
                var stock = lines[i].split(",");
                stock[1] = stock[1] + ".AX";
                lines[i] = stock.join(",");
            }

            data = lines.join("\n");

            //console.log(data);

            localStorage.setItem("stockCSV", data);
        }
    );
}

filterStockCodes = function (text, searchVal) {
    console.log("true");
    return false;
}

