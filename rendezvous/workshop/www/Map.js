var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";

var Map = function()
{
    //Create a new User from login details
    var userLoginData = JSON.parse(localStorage.getItem('user'));
    var currentUser = new User(userLoginData.firstName,  userLoginData.lastName, userLoginData.email, userLoginData.auth_token);
    var friendsListLoginData = JSON.parse(localStorage.getItem('friendsList'));

    //Store currentUser so it can be accessed from anywhere in the app
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    var postGateOpen = true;
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
        console.log("Token: " + currentUser.auth_token);

        if (postGateOpen == true) {
            postGateOpen = false;
            openPostGate();

            var radius = e.accuracy / 2;

            if (!uMkr) {
                //Login details for debugging purposes
                console.log("Logged in as User: " + currentUser.email + ".");
                console.log("Friends List: " + friendsListLoginData + ".");

                uMkr = L.marker(e.latlng, {icon: userMarker}).bindPopup("<b>You</b><br><p>" + currentUser.email + "</p>").addTo(map);
                uCir = L.circle(e.latlng, radius).addTo(map);
            }

            uMkr.setLatLng(e.latlng).update();
            uCir.setLatLng(e.latlng);

            currentUser.latlng = e.latlng;
            currentUser.PostLastKnownPosition(currentUser);
        }
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
        $("#untrackFriend").click(function(event){
            console.log("Un-tracking Friends")
            clearInterval(trackFriendsId);

            for (i = 0; i < fMkr.length; i++)
            {
                map.removeLayer(fMkr[i].value);
            }

            fMkr = [];
            mkrDetails = [];
        });

        /***
         * These methods handle events triggered from the friends list menu
         * */

        //This function sets global variable friendEmailId when friend is
        //clicked on th list view
        var friendEmailId = "";
        $(".friendButtonClick").click(function (event){

            console.log("Setting global friendEmailId variable.");
            var thisId = trimAllWhiteSpace(this.id);
            friendEmailId = thisId;
        });

        //This button handles the modal button click to confirm
        //you would like to track the friend
        $("#friendClickHandler").click(function (event){
            console.log(friendEmailId);

            //Clears Interval if one already exists.
            //We do this so as to not have more than one interval running at
            //once. This would be wasteful as the track friends function
            //which is attatched to this interval tracks every user in the
            //fMkr array anyway.
            if (trackFriendsId) {
                clearInterval(trackFriendsId);
            }

            setupFriendMarker(friendEmailId);
            trackFriendsId = setInterval(trackFriends, 5000);
            friendEmailId = "";
            $.mobile.changePage("#main");
        });

        function trimAllWhiteSpace(id)
        {
            var thisId = id;
            thisId = thisId.replace(/ /g,'');
            return thisId;
        }
    });

    var fMkr = [];
    var tmpMkr;
    function setupFriendMarker(fid)
    {
        console.log("setupFriendsMarker Function");

        $.ajax({type: "GET",
            dataType: "json",
            headers: { 'Authorization': 'Token ' + currentUser.auth_token},
            contentType: "application/json",
            url: localHost + "rendezvous/users/" + fid + "/",
            success: function(data){
                console.log("Setting up Marker for user :" + fid);
                var parsedCoords = parseCoordinates(data.last_known_position);

                //Place marker on map
                tempMkr = L.marker([parsedCoords.longitude, parsedCoords.latitude], {icon: friendMarker}).bindPopup("<b>" + data.first_name + " "
                    + data.last_name + "</b><br><p>" + data.email + "</p>").addTo(map);

                //save marker in array
                fMkr.push({
                    key: data.email,
                    value: tempMkr
                });
            },
            error: function(data){
                console.log("unable to retrieve friends location");
            }
        });
    }

    var mkrDetails = [];
    function trackFriends()
    {
        console.log("trackFriends function");

        for (i = 0; i < fMkr.length; i++)
        {
            //Map i to the user in the fMkr array. We do this
            //so when the AJAX call return we can update the
            //correct marker for that user
            mkrDetails.push({
                key: fMkr[i].key,
                value: i
            });

            console.log("Attempting to GET data for user: " + fMkr[i].key);

            $.ajax({type: "GET",
                dataType: "json",
                headers: { 'Authorization': 'Token ' + currentUser.auth_token},
                contentType: "application/json",
                url: localHost + "rendezvous/users/" + fMkr[i].key + "/",
                success: function(data){

                    console.log("Recieved data for user: " + data.email);

                    //Loop through mkrDetails to get index of marker
                    // in fMkr array for this user
                    for (i = 0; i < mkrDetails.length; i++)
                    {
                        if (mkrDetails[i].key == data.email)
                        {
                            console.log("Updating Marker for user: " + mkrDetails[i].key);
                            var index = mkrDetails[i].value;
                        }
                    }

                    var parsedCoords = parseCoordinates(data.last_known_position);
                    fMkr[index].value.setLatLng([parsedCoords.longitude, parsedCoords.latitude]).update();
                },
                error: function(data){
                    console.log("Unable to retrieve friends location");
                }
            });
        }
    }


    function openPostGate()
    {
        console.log("Post gate closed. Location updating to the API disabled for 10 seconds.");

        setTimeout(function(){
            console.log("Post gate re-opened. Location updating to the API enabled.");
            postGateOpen = true;
        }, 10000);
    }


    map.locate({setView: true, zoom: 14, timeout:600000, enableHighAccuracy: true, watch: true});
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.on('click', onMapClick);

}
