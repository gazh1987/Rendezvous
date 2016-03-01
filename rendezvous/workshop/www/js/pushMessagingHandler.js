function onDeviceReady()
{
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
            elements[i].style.color='green';
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
        if (elements[0].style.color == "green")
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

            console.log("not array" + notificationsArray[0]);
            for(var i = notificationsArray.length - 1; i >= 0; i--)
            {
                var tStamp = parseTimestamp(notificationsArray[i].timestamp);
                console.log(notificationsArray[i]);

                var newNotification = "<li style=\"padding: 10px; background-color:" + background + "\"\" data-icon=\"true\">" +
                    tStamp + "<br>" +
                    "<strong>Sender: </strong>" + notificationsArray[i].from_friend_name + "<br>" +
                    "<strong>Message: </strong>" + notificationsArray[i].message + "<br><br>" +
                    "<button name=\"acceptRendezvouRequest\" class=\"btn\" id=\"temp_id\" onClick=\"acceptRendezvousRequest(this.id)\">Accept Rendezvous Request</button>" +
                    "</li>";

                not_list.innerHTML = not_list.innerHTML + newNotification;

                //Dynamically set id of the button
                btn = document.getElementById("temp_id");
                btn.setAttribute("id", notificationsArray[i].from_friend_email);

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

function acceptRendezvousRequest(id)
{
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log("Accepting Rendezvous request. Enabling tracking for friend " + id);

    var endPoint = id + "" + currentUser.email;
    var parameters = { "tracking_enabled": "true" };

    $.ajax({
        type: "PATCH",
        data: JSON.stringify(parameters),
        headers: {'Authorization': 'token ' + currentUser.auth_token},
        dataType: "json",
        contentType: "application/json",
        url: production + "rendezvous/updateFriendTracking/" + endPoint + "/",
        success: function (data) {
            console.log("Successfully updated enabled tracking field");
            console.log(id + "is now tracking your location");
            console.log(data);
        },
        error: function (data) {
            console.log("Updating field failed");
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

