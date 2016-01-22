var User = function(firstName, lastName, email, token)
{
    RendezvousUsers.call(this, firstName, lastName, email);
    this.auth_token = token;
}

User.prototype.PostLastKnownPosition = function(s)
{
    var email = s.email;
    var token = s.auth_token;
    var latlng = s.latlng;

    var pointVariableLatLng = "POINT(" + latlng.lng + " " + latlng.lat + ")";
    var parameters = {last_known_position : pointVariableLatLng};
    var url = "http://localhost:8000/rendezvous/users/" + email + "/"; //TODO: Change localhost for production

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