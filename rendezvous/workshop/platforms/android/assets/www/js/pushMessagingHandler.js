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
        var new_notification = true;
        localStorage.setItem('new_notification', JSON.stringify(new_notification));

        var elements = document.getElementsByName("alert_not");
        var length = elements.length;

        for (var i = 0; i < length; i++)
        {
            elements[i].style.color='limegreen';
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
        console.log("resetting notification button");

        var elements = document.getElementsByName("alert_not");
        var length = elements.length;

        for (var i = 0; i < length; i++) {
            elements[i].style.color = '#333333';
        }

        var new_notification = false;
        localStorage.setItem('new_notification', JSON.stringify(new_notification));

    });
});