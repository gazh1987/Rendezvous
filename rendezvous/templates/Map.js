var Map = function()
{
    var map = L.map('map', { zoomControl:false });

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(map);

    function onLocationFound(e)
    {
        var radius = e.accuracy / 2;
        L.marker(e.latlng).addTo(map);
        L.circle(e.latlng, radius).addTo(map);
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
        console.log(document.cookie);
    }

    function onDeviceReady()
    {
        var myOptions = { enableHighAccuracy: true };
        navigator.geolocation.getCurrentPosition(onSuccess, onError, myOptions);
    }

    map.locate({setView: true, maxZoom: 16, timeout:600000,enableHighAccuracy: true});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.on('click', onMapClick);
}

