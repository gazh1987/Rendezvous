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

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(map);

    function onLocationFound(e)
    {
        var radius = e.accuracy / 2;
        L.marker(e.latlng, {icon: userMarker}).addTo(map);
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

    map.locate({setView: true, maxZoom: 24, timeout:600000, enableHighAccuracy: true, watch: true});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.on('click', onMapClick);
}
