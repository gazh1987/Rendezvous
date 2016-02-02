var Map = function()
{
    //Create a new User from login details
    var loginData = JSON.parse(localStorage.getItem('user'));
    var currentUser = new User(loginData.firstName,  loginData.lastName, loginData.email, loginData.auth_token);

    var map = L.map('map', { zoomControl:false });

    var userMarker = L.icon({
        iconUrl: 'userMarker.png',

        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-1, -1]
    });

    var friendMarker = L.icon({
        iconUrl: 'friendMarker.png',

        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-1, -1]
    });

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(map);

    function onLocationFound(e)
    {
        var radius = e.accuracy / 2;
        L.marker(e.latlng, {icon: userMarker}).bindPopup("<b>You</b><br><p>"+ currentUser.email + "</p>").addTo(map);
        L.circle(e.latlng, radius).addTo(map);

        currentUser.latlng = e.latlng;
        currentUser.PostLastKnownPosition(currentUser);
    }

    function onLocationError(e)
    {
        console.log(e);
        alert(e.message);
    }

    var popup = L.popup();
    function onMapClick(e)
    {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    }

    function onDeviceReady()
    {
        var myOptions = { enableHighAccuracy: true };
        navigator.geolocation.getCurrentPosition(onSuccess, onError, myOptions);
    }

    var parseCoordinates = function (c)
    {
        var point = c.toString();

        var latIndexStart = point.indexOf("(");
        var latIndexEnd = point.indexOf(" ", point.indexOf(" ") + 1); //Get the second occourence of " "
        var lat = point.substring(latIndexStart + 1, latIndexEnd);

        var lonIndexStart = point.indexOf(" ", point.indexOf(" ") + 1);
        var lonIndexEnd = point.indexOf(")"); //Get the second occourence of " "
        var lon = point.substring(lonIndexStart + 1, lonIndexEnd);

        var coords =  {
            latitude : lat,
            longitude : lon
        };
        return coords;
        //return latlng;
    };

    //JQuery functions
    $(document).ready(function() {

        //GetLatKnownLocation Function
        $("#getFriend").click(function(event) {

            var friendsEmail = "gary.healy2@student.dit.ie";

            $.ajax({type: "GET",
                dataType: "json",
                headers: { 'Authorization': 'token ' + currentUser.auth_token},
                contentType: "application/json",
                url: "http://localhost:8000/rendezvous/users/",
                success: function(data){

                    for (i = 0; i < data.length; i ++)
                    {
                        if(data[i].email != currentUser.email) {
                            var parsedCoords = parseCoordinates(data[i].last_known_position);

                            L.marker([parsedCoords.longitude, parsedCoords.latitude], {icon: friendMarker}).bindPopup("<b>" + data[i].first_name + " "
                                + data[i].last_name + "</b><br><p>"+ data[i].email + "</p>").addTo(map);

                            console.log(data[i]);
                        }
                    }
                },
                error: function(data){
                    console.log("unable to retrieve friends location");
                }
             });
        });
    });

    map.locate({setView: true, zoom: 14, timeout:600000, enableHighAccuracy: true, watch: true});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.on('click', onMapClick);

}
