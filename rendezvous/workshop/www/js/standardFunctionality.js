/**
 * This javascript file handles any standard app functionality.
 *  - Logging out.
 *  - Setting up the friends list.
 *  - Handling click events from friends list.
 */

var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";

$(document).ready(function() {

    //Logout function
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

    $("#createFriendHandler").click(function(event){
        console.log("Creating Friendship");
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        var friend = $("#friendEmailCreationField").val();
        friend = friend.toLowerCase();
        var parameters = {from_friend: currentUser.email, from_friend_email: currentUser.email, to_friend: friend, to_friend_email: friend};

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

