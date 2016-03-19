var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";

$(document).ready(function() {

    /**
     * Summary: Logs the current user out of the application
     */
    $("#logout").click(function (event) {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        console.log("Logging out user: " + currentUser.email);

        $.ajax({
            type: "GET",
            dataType: "json",
            headers: {'Authorization': 'Token ' + currentUser.auth_token},
            contentType: "application/json",
            url: production + "logout/",
            success: function (data) {
                console.log("Logout Successful");
                localStorage.clear();

                //Store email for easier login
                localStorage.setItem('loginEmail', JSON.stringify(currentUser.email));

                window.location.assign("index.html");
            },
            error: function (data) {
                console.log(data);
                console.log("Logout failed.");
            }
        });
    });

    /**
     * Summary: Creates a new relationship between one user and another
     */
    $("#createFriendHandler").click(function(event){
        console.log("Creating Friendship");
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        var friend = $("#friendEmailCreationField").val();
        friend = friend.toLowerCase();
        var lookup = currentUser.email + "" + friend;
        var parameters = {from_friend: currentUser.email, from_friend_email: currentUser.email, to_friend: friend, to_friend_email: friend, lookupField: lookup};

        //Post relationship to API
        $.ajax({
            type: "POST",
            data: JSON.stringify(parameters),
            dataType: "json",
            contentType: "application/json",
            url: production + "rendezvous/friends/",
            success: function (data) {
                //registerPass
                console.log("Friendship created.");
                alert("Your created friend " + parameters.to_friend);
                getFriends(currentUser.auth_token, currentUser.email);
            },
            error: function (data) {
                console.log(data);
                console.log("Friendship creation failed");
                alert("Friendship creation failed");
            }
        });
    });
});

/**
 * Summary: Sends a GET request to retrieve all people who the user is friends with.
 *          It then populates the friends view with these users.
 */
function populateFriendsList()
{
    console.log("Populating friends list");

    var userLoginData = JSON.parse(localStorage.getItem('user'));
    var friendsList = JSON.parse(localStorage.getItem('friendsList'));
    var listOfFriends = document.getElementById('listOfFriends');

    for (i = 0; i < friendsList.length; i++)
    {
        $.ajax({type: "GET",
            dataType: "json",
            headers: { 'Authorization': 'Token ' + userLoginData.auth_token},
            contentType: "application/json",
            url: production + "rendezvous/users/" + friendsList[i] + "/",
            success: function(data){
                console.log(data);
                var newFriend = "<li data-icon=\"true\">" +
                        "<button id=\"" + data.email + "\" class=\"btn btn-primary friendButtonClick\" data-toggle=\"modal\" data-target=\"#friendClickOptions\">" +
                        data.first_name + " " + data.last_name + "<br><p>" + data.email + "</p>" +
                        "</button>" +
                        "</li>";

                listOfFriends.innerHTML = listOfFriends.innerHTML + newFriend;

            },
            error: function(data){
                console.log("Unable to retrieve friends details");
            }
        });
    }
}

/**
 * Summary: Similar to populateFriendsList function, this view is shown when a user
 *          is inviting a friend to an event.
 */
function populateInviteFriendsList()
{
    console.log("Populating invite friends list");

    var userLoginData = JSON.parse(localStorage.getItem('user'));
    var friendsList = JSON.parse(localStorage.getItem('friendsList'));

    var listOfFriends = document.getElementById('listOfFriends');

    for (i = 0; i < friendsList.length; i++)
    {
        $.ajax({type: "GET",
            dataType: "json",
            headers: { 'Authorization': 'Token ' + userLoginData.auth_token},
            contentType: "application/json",
            url: production + "rendezvous/users/" + friendsList[i] + "/",
            success: function(data){
                console.log(data);
                var newFriend = "<li data-icon=\"true\">" +
                        "<button id=\"" + data.email + "\" class=\"btn btn-primary friendButtonClick\" data-toggle=\"modal\" data-target=\"#friendInviteOptions\">" +
                        data.first_name + " " + data.last_name + "<br><p>" + data.email + "</p>" +
                        "</button>" +
                        "</li>";

                listOfInviteFriends.innerHTML = listOfInviteFriends.innerHTML + newFriend;
            },
            error: function(data){
                console.log("Unable to retrieve friends details");
            }
        });
    }
}

/**
 * Summary: Takes all users in the trackersList that was populated at login and send individual GET requests
 *          to retrive the trackers information. This information is then used to populate the trackers list
 */
function populateTrackersList()
{
    console.log("Populating trackers list");

    var userLoginData = JSON.parse(localStorage.getItem('user'));
    var trackersList = JSON.parse(localStorage.getItem('trackersList'));
    var listOfTrackers = document.getElementById('listOfTrackers');
    listOfTrackers.innerHTML = "";

    if(trackersList != null) {
        for (i = 0; i < trackersList.length; i++) {
            $.ajax({
                type: "GET",
                dataType: "json",
                headers: {'Authorization': 'Token ' + userLoginData.auth_token},
                contentType: "application/json",
                url: production + "rendezvous/users/" + trackersList[i] + "/",
                success: function (data) {
                    console.log(data);

                    var newTracker = "<li style=\"padding: 10px;\" data-icon=\"true\">" +
                        "<strong>Tracker: </strong>" + data.first_name + " " + data.last_name + "<br>" +
                        "<strong>Email:   </strong>" + data.email + "<br><br>" +
                        "<button name=\"stopAllowingTracking\" class=\"btn\" id=\"temp_tracker_id\" data-id=\"to_friend_email\" onClick=\"stopAllowingTracking(this.id, this.dataset.id)\">Stop Tracking</button><br>" +
                        "</li><hr>";

                    listOfTrackers.innerHTML = listOfTrackers.innerHTML + newTracker;

                    stop_btn = document.getElementById("temp_tracker_id");
                    stop_btn.setAttribute("id", data.email + "" + userLoginData.email);
                    stop_btn.setAttribute("data-id", data.email);
                },
                error: function (data) {
                    console.log("Unable to retrieve trackers details");
                }
            });
        }
    }
}

/**
 * Summary: Send a Patch request to the API that stops a friend from tracking the current user.
 */
function stopAllowingTracking(endpoint, id)
{
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log("\"stopAllowingTracking\" function called.");
    var parameters = {  "tracking_enabled" : "false" };

    //Update tracking_enabled field
    $.ajax({
        type: "PATCH",
        data: JSON.stringify(parameters),
        headers: {'Authorization': 'token ' + currentUser.auth_token},
        dataType: "json",
        contentType: "application/json",
        url: production + "rendezvous/updateFriendTracking/" + endpoint + "/",
        success: function (data) {
            console.log(data);

            //send a notification to friend to let him know user has stopped allowing to track location
            var name = currentUser.firstName + " " + currentUser.lastName;
            var msg = name + " has stopped allowing you to track him/her.";
            var t = "response";
            var parameters = {
                accepted:true,
                type:t,
                from_friend_email: currentUser.email,
                to_friend_email: id,
                from_friend_name: name,
                message: msg,
                from_friend: currentUser.email,
                to_friend: id
            };
            console.log(parameters);

            $.ajax({
                type: "POST",
                dataType: "json",
                data: JSON.stringify(parameters),
                headers: {'Authorization': 'Token ' + currentUser.auth_token},
                contentType: "application/json",
                url: production + "/rendezvous/notifications/",
                success: function(data){
                    console.log("Successfully sent push message notification");
                    console.log(data);
                    var trackersList = JSON.parse(localStorage.getItem('trackersList'));

                    //Remove the friend from the trackers list and update it
                    var index = trackersList.indexOf(id);
                    if (index > -1)
                    {
                        trackersList.splice(index, 1);
                    }

                    localStorage.setItem('trackersList', JSON.stringify(trackersList));
                    populateTrackersList();
                },
                error: function(data){
                    console.log("Failed sending push message notification.");
                    console.log(data);
                }
            });
        },
        error: function (data) {
            console.log(data);
        }
    });
}
