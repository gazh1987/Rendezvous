var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";

var User = function(firstName, lastName, email, token)
{
    RendezvousUsers.call(this, firstName, lastName, email);
    this.auth_token = token;
}

User.prototype.PostLastKnownPosition = function(user)
{
    var email = user.email;
    var token = user.auth_token;
    var latlng = user.latlng;

    var pointVariableLatLng = "POINT(" + latlng.lng + " " + latlng.lat + ")";
    var parameters = {last_known_position : pointVariableLatLng};
    var url = production + "rendezvous/users/" + email + "/";

    $.ajax({
        type: "PATCH",
        data: JSON.stringify(parameters),
        headers: {'Authorization': 'token ' + token},
        dataType: "json",
        contentType: "application/json",
        url: url,
        success: function (data) {
            console.log(data);
        },
        error: function (data) {
            console.log(data);
        }
    });
}