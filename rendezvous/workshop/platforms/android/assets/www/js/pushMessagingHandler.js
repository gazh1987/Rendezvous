function onDeviceReady()
{
    //Tracks the endpoints that need to be disabled when user logs out
    var friendsTrackingUser = [];
    localStorage.setItem('friendsTrackingUser', JSON.stringify(friendsTrackingUser));

    var push = PushNotification.init({
        android: {
            senderID: "428341243093"
        },
        windows: {}
    });

    push.on('registration', function(data) {
        console.log(data.registrationId);
        localStorage.setItem('registration_id', JSON.stringify(data.registrationId));
    });

    push.on('error', function(e) {
         console.log(e);
    });

    push.on('notification', function(data) {
        //Set new notification variable
        var new_notification = true;
        localStorage.setItem('new_notification', JSON.stringify(new_notification));

        //This code changes the colour of the notifications button when
        //user is in the app
        var elements = document.getElementsByName("alert_not");
        var length = elements.length;
        for (var i = 0; i < length; i++)
        {
            elements[i].style.color='red';
        }

        console.log(data.message);
        console.log(data.title);
        console.log(data.count);
        console.log(data.sound);
        console.log(data.image);
        console.log(data.additionalData);
    });
}

$(document).ready(function(){
    $(".notification_btn").click(function() {
        var elements = document.getElementsByName("alert_not");
        var length = elements.length;

        //Get new notifications if they exist
        if (elements[0].style.color == "red")
        {
            getNewNotifications();
        }

        console.log("resetting notification button");
        for (var i = 0; i < length; i++) {
            elements[i].style.color = '#333333';
        }

        var new_notification = false;
        localStorage.setItem('new_notification', JSON.stringify(new_notification));

    });

    function getNewNotifications()
    {
        console.log("Getting new notifications from the API.")
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));

        $.ajax({
            type: "GET",
            dataType: "json",
            headers: {'Authorization': 'Token ' + currentUser.auth_token},
            contentType: "application/json",
            url: production + "rendezvous/notifications/" + currentUser.email + "/",
            success: function (data) {
                populateNotificationsList();
            },
            error: function (data) {
                console.log(data);
            }
        });
    }
});


function populateNotificationsList()
{
    console.log("Clicked_not");
    var userLoginData = JSON.parse(localStorage.getItem('user'));

    $.ajax({
        type: "GET",
        dataType: "json",
        headers: {'Authorization': 'Token ' + userLoginData.auth_token},
        contentType: "application/json",
        url: production + "rendezvous/notifications/" + userLoginData.email + "/",
        success: function (data) {
            console.log(data);
            var notificationsArray = data;
            var not_list= document.getElementById('notificationsList');
            not_list.innerHTML = "";

            var background = "white";
            var btn;
            var del_btn;

            for(var i = notificationsArray.length - 1; i >= 0; i--)
            {
                var tStamp = parseTimestamp(notificationsArray[i].timestamp);

                console.log(notificationsArray[i].type);
                var deleteButton = "<li style=\"padding: 10px; background-color:" + background + "\"\" data-icon=\"true\">" +
                        tStamp + "<br>" +
                        "<strong>Sender: </strong>" + notificationsArray[i].from_friend_name + "<br>" +
                        "<strong>Message: </strong>" + notificationsArray[i].message + "<br><br>" +
                        "<button name=\"deleteRendezvouRequest\" class=\"btn btn-danger\" id=\"del_id\" onClick=\"deleteRendezvousRequest(this.id)\">Delete Rendezvous Request</button>" +
                        "</li>";

                //If request accepted, dont show the accept rendezvous request button
                if (notificationsArray[i].accepted == false)
                {
                    if(notificationsArray[i].type == "response")
                    {
                        var newNotification = deleteButton;
                    }
                    else
                    {
                        var newNotification = "<li style=\"padding: 10px; background-color:" + background + "\"\" data-icon=\"true\">" +
                        tStamp + "<br>" +
                        "<strong>Sender: </strong>" + notificationsArray[i].from_friend_name + "<br>" +
                        "<strong>Message: </strong>" + notificationsArray[i].message + "<br><br>" +
                        "<button name=\"acceptRendezvouRequest\" class=\"btn btn-primary\" id=\"temp_id\" data-id=\"timestamp_id\" onClick=\"acceptRendezvousRequest(this.id, this.dataset.id)\">Accept Rendezvous Request</button><br>" +
                        "<button name=\"deleteRendezvouRequest\" class=\"btn btn-danger\" id=\"del_id\" onClick=\"deleteRendezvousRequest(this.id)\">Delete Rendezvous Request</button>" +
                        "</li>";
                    }

                }
                else
                {
                    var newNotification = deleteButton;
                }

                not_list.innerHTML = not_list.innerHTML + newNotification;

                if (notificationsArray[i].accepted == false)
                {
                    //Dynamically set id of the button
                    btn = document.getElementById("temp_id");
                    btn.setAttribute("id", notificationsArray[i].from_friend_email);
                    btn.setAttribute("data-id", notificationsArray[i].timestamp);
                }

                del_btn = document.getElementById("del_id");
                del_btn.setAttribute("id", notificationsArray[i].timestamp);

                //Alternate background color
                if (background == "white")
                {
                    background = "#eeeeee";
                }
                else
                {
                    background = "white";
                }
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

function acceptRendezvousRequest(id, timestamp)
{
    btn = document.getElementById("temp_id");
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log("Accepting Rendezvous request. Enabling tracking for friend " + id);

    var endPoint = id + "" + currentUser.email;
    var parameters = { "tracking_enabled": "true" };

    //First update the tracking_enabled
    $.ajax({
        type: "PATCH",
        data: JSON.stringify(parameters),
        headers: {'Authorization': 'token ' + currentUser.auth_token},
        dataType: "json",
        contentType: "application/json",
        url: production + "rendezvous/updateFriendTracking/" + endPoint + "/",
        success: function (data) {
            alert("User " +  id + " is now tracking your location");
            console.log(id + "is now tracking your location");
            var parameters2 = { "accepted": "true" };

            var friendsTrackingUser = JSON.parse(localStorage.getItem('friendsTrackingUser'));
            friendsTrackingUser.push(endPoint);
            console.log("FriendsTrackingUser = " + friendsTrackingUser);
            localStorage.setItem('friendsTrackingUser', JSON.stringify(friendsTrackingUser));

            //Then update the accepted notification field so the accept button will not show on the
            //senders app anymore
            $.ajax({
                type: "PATCH",
                data: JSON.stringify(parameters2),
                headers: {'Authorization': 'token ' + currentUser.auth_token},
                dataType: "json",
                contentType: "application/json",
                url: production + "rendezvous/notifications_update_delete/" + timestamp + "/",
                success: function (data) {
                    console.log("Update notification accepted field");

                    //Update the notifications list
                    populateNotificationsList();

                    //Then send a new push message to the sender telling them X is now tracking
                    //their location
                    var name = currentUser.firstName + " " + currentUser.lastName;
                    var msg = name + " is now tracking your location!";
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
                        },
                        error: function(data){
                            console.log("Failed sending push message notification.");
                            console.log(data);
                        }
                    });
                },
                error: function (data) {
                    alert("This notification is not valid anymore.");
                    console.log("Updating field failed");
                    console.log(data);
                }
            });
        },
        error: function (data) {
            console.log("Updating field failed");
            alert("This notification is not valid anymore.")
            console.log(data);
        }
    });
}

function deleteRendezvousRequest(id)
{
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));

    $.ajax({
        type: "DELETE",
        headers: {'Authorization': 'token ' + currentUser.auth_token},
        dataType: "json",
        contentType: "application/json",
        url: production + "rendezvous/notifications_update_delete/" + id + "/",
        success: function (data) {
            console.log("Notification Deleted");

            //Update the notifications list
            populateNotificationsList()
        },
        error: function (data) {
            console.log("Deleting Notification Failed");
            console.log(data);
        }
    });
}

function parseTimestamp(t)
{
    var date = t.substring(0, t.indexOf("T"));
    var time = t.substring(t.indexOf("T") + 1, t.indexOf(":", t.indexOf(":") + 1));
    var datetime = "<strong>Time recieved: </strong>" + time + "<br><strong>Date Received: </strong>" + date;
    return datetime;
}

