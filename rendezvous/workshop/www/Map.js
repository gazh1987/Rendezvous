var Map = function()
{
    //Create a new User from login details
    var loginData = JSON.parse(localStorage.getItem('user'));
    var currentUser = new User(loginData.firstName,  loginData.lastName, loginData.email, loginData.auth_token);
    var firstLocationFound = true;
    var trackFriendsId;

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

    var uMkr;
    var uCir;
    function onLocationFound(e)
    {
        var radius = e.accuracy / 2;

        if (!uMkr)
        {
            console.log("firstLocationFound");
            uMkr = L.marker(e.latlng, {icon: userMarker}).bindPopup("<b>You</b><br><p>"+ currentUser.email + "</p>").addTo(map);
            uCir = L.circle(e.latlng, radius).addTo(map);
        }

        uMkr.setLatLng(e.latlng).update();
        uCir.setLatLng(e.latlng);
        /*L.marker(e.latlng, {icon: userMarker}).bindPopup("<b>You</b><br><p>"+ currentUser.email + "</p>").update();
        L.circle(e.latlng, radius).addTo(map);*/

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
    };

    //JQuery functions
    $(document).ready(function() {

        //GetLatKnownLocation Function
        $("#getFriend").click(function(event) {
            console.log("Preparing to track friends. Wait 10 seconds.")
            trackFriendsId = setInterval(trackFriends, 10000);
        });

        $("#untrackFriend").click(function(event){
            console.log("unTrackFriends")
            clearInterval(trackFriendsId);
        });

    });

    function trackFriends()
    {
        console.log("trackFriends Function");

        $.ajax({type: "GET",
                dataType: "json",
                headers: { 'Authorization': 'Token ' + currentUser.auth_token},
                contentType: "application/json",
                url: "http://rendezvous-704e3pxx.cloudapp.net/rendezvous/users/",
                success: function(data){

                    for (i = 0; i < data.count; i ++)
                    {
                        if(data.results[i].email != currentUser.email) {
                            var parsedCoords = parseCoordinates(data.results[i].last_known_position);

                            L.marker([parsedCoords.longitude, parsedCoords.latitude], {icon: friendMarker}).bindPopup("<b>" + data.results[i].first_name + " "
                                + data.results[i].last_name + "</b><br><p>"+ data.results[i].email + "</p>").addTo(map);

                            console.log(data.results[i]);
                        }
                    }
                },
                error: function(data){
                    console.log("unable to retrieve friends location");
                }
             });
    }

    map.locate({setView: true, zoom: 14, timeout:600000, enableHighAccuracy: true, watch: true});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.on('click', onMapClick);

}
