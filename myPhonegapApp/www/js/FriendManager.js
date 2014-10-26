
/*
	Triggered when a user accepts/rejects a friend request
*/
$(document).on("click", "#friendButton", function(){
	var command = $(this).attr("value");
	console.log(command);
	commands = command.split(";");
	var serverCommand = "";
	if (commands[0] == "add") {
		serverCommand = "acceptfriend";
	} else {
		serverCommand = "rejectfriend";
	}
	var suffix = "/" + serverCommand + "/" + window.user.userName + "/" + commands[1];
	console.log(suffix);

	$.getJSON(DEVSERVER_URL + suffix,
		function (data) {}
	);

	populateRequests();
	populateFriends();
});

$(document).on("click", "#friendLink", function(){
	var friend = $(this).attr("value");
	console.log(friend);

	$("#friendList").popup("close");
	$('#friendFolio').popup("open");

	$('#friendFolioHeader').text(friend + "'s Portfolio");

	$.getJSON(DEVSERVER_URL + "/getportfolio/" + friend
		, function(portfolio) {
			console.log(portfolio);
		}
	);
});



$(document).on('click', '#requestFriendConfirm', function(){

	friend = localStorage.getItem('pendingRequest');
	console.log('reqqing ' + friend);

	$.getJSON(DEVSERVER_URL + '/reqfriend/' + window.user.userName + '/' + friend
		, function() {}
	);

	$('input[data-type="search"]').val('');
	$('input[data-type="search"]').trigger('keyup');
	$('input[data-type="search"]').val(localStorage.getItem('lastFriendSearch'));
	$('input[data-type="search"]').trigger('keyup');
});

$(document).on("click", "#deleteFriend", function() {
	var friend = $(this).attr("value");

	localStorage.setItem('pendingDelete', friend);

	$('#confirmDelete').popup('open');

	$('#confirmDeleteMessage').text('Unfriend ' + friend + '?');
});

$(document).on("click", '#deleteFriendConfirm', function() {
	var friend = localStorage.getItem('pendingDelete');


	$.getJSON(DEVSERVER_URL + '/rmfriendo/' + window.user.userName + '/' + friend
		, function(data) {
			console.log(DEVSERVER_URL + '/rmfriendo/' + window.user.userName + '/' + friend);
		}

	);

	populateRequests();
	populateFriends();

	console.log(friend + " got rekt");
});

function setupFriends() {
	console.log("FriendManager.js: Setting up friends");

	if (window.user == undefined) {
		console.log("ERROR: USER NOT DEFINED");
		var object = new Object();
		object.userName = "mark";
		window.user = object;
		//return
	}

	populateRequests();
	populateFriends();

    $("#findFriends").on("filterablebeforefilter", function(e, data) {
	    var $ul = $("#findFriends"),
	        $input = $(data.input),
	        value = $input.val(),
	        html = "";
	    $ul.html("");
	    console.log("Friends: " + value);
	    localStorage.setItem("lastFriendSearch", value);

	    if (value && value.length > 1) {
	    	console.log(DEVSERVER_URL + "/findfriends/" + window.user.userName + "/" + value);
	        $.getJSON(DEVSERVER_URL + "/findfriends/" + window.user.userName + "/" + value
	        	, function(data) {

	        		console.log(data);
					var li = "";

			        $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
			        $ul.listview( "refresh" );

			        for (var i = 0; i < data.length; ++i) {
			        	li += '<li value="' + data[i] + '" data-icon="plus"><a>' + data[i] + "</a></li>";
			        }
			        //console.log(li);
			        $ul.append(li);
			        $ul.listview("refresh");
			        $ul.trigger("updatelayout");
	    		}
	    	);
	    }
	});

	$("#findFriends").on('click', 'li', function() {
		console.log($(this).attr("value"));

		friend = $(this).attr("value");

		localStorage.setItem('pendingRequest', friend);

		$('#confirmRequestMessage').text("Friend " + friend + "?");

		$('#confirmRequest').popup('open');

	});
/*
	$(document).on('click', '#findFriends li a', function (info) {
	    var source = $("findFriends").closest("li").attr("data-chapter");
		
	    $('input[data-type="search"]').val('');
	    $('input[data-type="search"]').trigger("keyup");

	    console.log("Clicked user: " + source);

	    $.getJSON(DEVSERVER_URL + "/reqfriend/" + window.user.userName + "/" + source
	    	, function(data) {}
	    );
	});

*/
	setInterval(function() {populateFriends()}, 30000);
	setInterval(function() {populateRequests()}, 30000);
	console.log("FRIENDS ALL INSTANTIATED");
}

function populateFriends() {
	var friends = ['aaron', 'eddy', 'jess', 'lindsay', 'thomas'];
	//friends = [];

	$.getJSON(DEVSERVER_URL + "/getfriends/" + window.user.userName
		, function(friends) {

			var list = $("#myFriends");

			list.listview();
			list.empty();

			var friendHTML = "";

			//friends = data["data"];
			//console.log(friends);
			if (friends.length == 0) {
				friendHTML = '<li>Oops! You have no friends!</li>';
			} else {
				for (var i = 0; i < friends.length; ++i) {
					var current = "";
					current += '<li><a id="friendLink" value="' + friends[i] + '">' + friends[i] + '</a><a id="deleteFriend" value="' + friends[i] + '"></a></li>';

					friendHTML += current;
				}
			}
			
			list.append(friendHTML);
			list.css('overflow-y', 'scroll');
			list.listview("refresh");
		}
	);


}

function populateRequests() {

	$.getJSON(DEVSERVER_URL + "/getrequests/" + window.user.userName
		, function(requests) {

		var list = $("#requestList");
		var friendList = "";

		list.listview();
		list.empty();

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
		list.listview("refresh");

	});
}