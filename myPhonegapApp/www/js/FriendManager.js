

$(document).on("click", "#friendButton", function(){
	var command = $(this).attr("value");
});

$(document).on("click", "#friendLink", function(){
	var command = $(this).attr("value");
});

function setupFriends() {
	console.log("FriendManager.js: Setting up friends");

	//$("#friendRequests").css('overflow-y', 'scroll');

	populateRequests();
	populateFriends();

	$("#friendList").css("min-width", "200px");

    $("#findFriends").on("filterablebeforefilter", function(e, data) {
	    var $ul = $("#findFriends"),
	        $input = $(data.input),
	        value = $input.val(),
	        html = "";
	    $ul.html("");
	    console.log("SearchValue: " + value);

	    var li = "";

	    if (value && value.length > 1) {
	        $.getJSON(DEVSERVER_URL + "searchUsers/" + value, function(data) {
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
	    	});
	    }
	});

	$(document).on('click', '#findFriends li a', function (info) {
	    var source = $("findFriends").closest("li").attr("data-chapter");
		
	    $('input[data-type="search"]').val('');
	    $('input[data-type="search"]').trigger("keyup");

	    console.log("Clicked user: " + source);
	});
}

function populateFriends() {
	var friends = ['aaron', 'eddy', 'jess', 'lindsay', 'thomas'];
	friends = [];

	var list = $("#myFriends");

	list.listview();
	//list.css("min-width", "100px")

	var friendHTML = "";

	if (friends.length == 0) {
		friendHTML = '<li>Oops! You have no friends!</li>';
	} else {
		for (var i = 0; i < friends.length; ++i) {
			var current = "";
			current += '<li id="friendLink" value="' + friends[i] + '">' + friends[i] + '</li>';

			friendHTML += current;
		}
	}

	list.append(friendHTML);
	list.css('overflow-y', 'scroll');
	list.css('overflow', 'hidden');
	list.listview("refresh");
}

function populateRequests() {
	var requests = ['aaron', 'eddy', 'jess', 'lindsay', 'thomas', 'stalker'];
	//requests = [];

	var list = $("#requestList");
	var friendList = "";

	list.listview();

	if (requests.length == 0) {
		friendList = '<li>No friend requests!</li>'
	} else {
		for (var i = 0; i < requests.length; ++i) {
			var current = "";

			current += '<li><div class="ui-grid-a">';
			current += '<div class="left-li ui-block-a"><h3>';
			current += requests[i];
			current += '</h3></div><div class ="right-li ui-block-b">';
			current += '<a id="friendButton" value="add;' + requests[i] + '" class="ui-shadow ui-btn ui-corner-all ui-icon-check ui-btn-icon-notext ui-btn-inline">Button</a>';
			current += '<a id="friendButton" value="delete;' + requests[i] + '" class="ui-shadow ui-btn ui-corner-all ui-icon-delete ui-btn-icon-notext ui-btn-inline">Button</a>';
			current += '</div></div></li>';

			friendList += current;
		}
	}

	list.append(friendList);
	list.css('overflow-y', 'scroll');
	list.css('overflow', 'hidden');
	list.listview("refresh");
}