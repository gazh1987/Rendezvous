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
                /*console.log(data);
                var notificationsArray = data;
                var not_list = document.getElementById('notificationsList');

                for(var i = notificationsArray.results.length - 1; i >= 0; i--)
                {
                    var newNotification = "<li data-icon=\"true\">" +
                        notificationsArray.results[i] +
                        "</li>";

                    not_list.innerHTML = not_list.innerHTML + newNotification;
                }*/
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

            for(var i = notificationsArray.length - 1; i >= 0; i--)
            {
                var newNotification = "<li style=\"background-color:" + background + "\"\" data-icon=\"true\">" +
                    notificationsArray[i].timestamp +
                    "</li>";

                not_list.innerHTML = not_list.innerHTML + newNotification;

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
