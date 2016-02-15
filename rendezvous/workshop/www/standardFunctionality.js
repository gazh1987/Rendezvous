/**
 * This javascript file handles any standard app functionality.
 *  - Logging out.
 *  - Setting up the friends list.
 *  - Handling click events from friends list.
 */

var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";

$(document).ready(function() {

    var currentUser = JSON.parse(localStorage.getItem('currentUser'));

    //Logout function
    $("#logout").click(function (event) {

        console.log("Loggin out user: " + currentUser.email);

        $.ajax({
            type: "GET",
            dataType: "json",
            headers: {'Authorization': 'Token ' + currentUser.auth_token},
            contentType: "application/json",
            url: localHost + "logout/",
            success: function (data) {
                console.log("Logout Successful");
                localStorage.clear();
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

        var friend = $("#friendEmailCreationField").val();
        var parameters = {from_friend: currentUser.email, from_friend_email: currentUser.email, to_friend: friend, to_friend_email: friend};

        $.ajax({
            type: "POST",
            data: JSON.stringify(parameters),
            dataType: "json",
            contentType: "application/json",
            url: localHost + "rendezvous/friends/",
            success: function (data) {
                //registerPass
                console.log("Friendship created.");
                //Add a toast here with details of successful friendship
                //Add toasts all over where messages where previously. EG: Login and registration
                //Add some code to update the friends list. Maybe do another Get request and repopulate the friends array

            },
            error: function (data) {
                console.log(data);
                console.log("Friendship creation failed");
            }
        });
    });
});

function populateFriendsList()
{
    console.log("Populating friends list");

    var friendsList = JSON.parse(localStorage.getItem('friendsList'));
    for (i = 0; i < friendsList.length; i++)
    {
        document.write("<li data-icon=\"false\">");
        document.write("<button id = \" " + friendsList[i] + "\" class=\"friendButtonClick\" class=\"btn btn-primary\" data-toggle=\"modal\" data-target=\"#friendClickOptions\">");
        document.write(friendsList[i]);
        document.write("</button>");
        document.write("</li>")
    }
}
