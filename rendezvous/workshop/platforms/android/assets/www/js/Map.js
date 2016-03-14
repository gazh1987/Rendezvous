var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";
var map = null;

var Map = function()
{
    //Create a new User from login details
    var userLoginData = JSON.parse(localStorage.getItem('user'));
    var currentUser = new User(userLoginData.firstName,  userLoginData.lastName, userLoginData.email, userLoginData.auth_token);
    var friendsListLoginData = JSON.parse(localStorage.getItem('friendsList'));
    localStorage.setItem('currentUser', JSON.stringify(currentUser)); //Store currentUser so it can be accessed from anywhere in the app
    var postGateOpen = true;
    var trackFriendsId;
    var userEventsInitialised = false;
    var reInitialisedFriends = false;
    map = L.map('map', { zoomControl:false, attributionControl:false });

    var userMarker = L.icon({
        iconUrl: 'images/userMarker.png',

        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [-1, -1]
    });

    var friendMarker = L.icon({
        iconUrl: 'images/friendMarker.png',

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
        if (postGateOpen == true)
        {
            postGateOpen = false;
            openPostGate();
            var radius = e.accuracy / 2;

            if (!uMkr)
            {
                //Login details for debugging purposes
                console.log("Logged in as User: " + currentUser.email + ".");
                console.log("Friends List: " + friendsListLoginData + ".");
                uMkr = L.marker(e.latlng).bindPopup("<b>You</b><br><p>" + currentUser.email + "</p>").addTo(map);
                uCir = L.circle(e.latlng, radius).addTo(map);
            }

            uMkr.setLatLng(e.latlng).update();
            uCir.setLatLng(e.latlng);
            currentUser.latlng = e.latlng;
            currentUser.PostLastKnownPosition(currentUser);
        }

        //Code to be ran once after login.
        //Places event and friend markers on the map
        if (userEventsInitialised == false)
        {
            userEventsInitialised = true;
            var userEvents = JSON.parse(localStorage.getItem('userEvents'));

            if (userEvents != null) {
                var events = userEvents[0];

                for (var i = 0; i < events.length; i++) {
                    var coords = parseCoordinates(events[i].coordinates);
                    var geojsonFeature = {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Point",
                            "coordinates": [coords.latitude, coords.longitude]
                        }
                    }

                    var marker;
                    L.geoJson(geojsonFeature, {
                        pointToLayer: function (feature, latlng) {
                            marker = L.marker(latlng, {
                                icon: friendMarker,
                                riseOnHover: true,
                                draggable: true,
                            }).bindPopup("<a href='#inviteFriendsList' class='marker-invite-button btn btn-primary btn-xs' style='color: white;'>Invite Friends</a><br><br>" +
                                "<input type='button' value='Delete this marker' class='marker-delete-button btn-danger'/><br>");

                            marker.on("popupopen", onEventPopupOpen);
                            return marker;
                        }
                    }).addTo(map);
                }
            }
        }

        if (reInitialisedFriends == false)
        {
            reInitialisedFriends = true;
            var friendsToTrack = JSON.parse(localStorage.getItem('userTrackersList'));
            console.log("Friends to track length=" + friendsToTrack.length);
            for (var i = 0; i < friendsToTrack.length; i++)
            {
                setupFriendMarker(friendsToTrack[i]);
                trackFriendsId = setInterval(trackFriends, 2000);
            }
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
        //TODO: change the name of friendMarker to something more appropriate, eg: eventMarker
        var geojsonFeature = {
        "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [e.latlng.lat, e.latlng.lng]
            }
        }

        var marker;
        L.geoJson(geojsonFeature, {
            pointToLayer: function(feature, latlng){
                marker = L.marker(e.latlng, {
                    icon: friendMarker,
                    riseOnHover: true,
                    draggable: true,
                }).bindPopup("<a href='#inviteFriendsList' class='marker-invite-button btn btn-primary btn-xs' style='color: white;'>Invite Friends</a><br><br>" +
                             "<input type='button' value='Delete this marker' class='marker-delete-button btn-danger'/><br>");

                marker.on("popupopen", onEventPopupOpen);
                return marker;
            }
        }).addTo(map);
        saveEvent(e.latlng);
    }

    function onEventPopupOpen()
    {
        var marker = this;
        $(".marker-invite-button:visible").click(function () {
            var event_lookup_field = currentUser.email + marker._latlng;
             localStorage.setItem('event_lookup_field', JSON.stringify(event_lookup_field));
        });

        $(".marker-delete-button:visible").click(function () {
            map.removeLayer(marker);
            deleteEvent(marker);
        });
    }

    function saveEvent(latlng)
    {
        var pointVariableLatLng = "POINT(" + latlng.lng + " " + latlng.lat + ")";
        var lookup = currentUser.email + latlng;
        var parameters = {event_creator:currentUser.email, event_creator_email:currentUser.email, coordinates:pointVariableLatLng, lookup_field:lookup};

        $.ajax({
            type: "POST",
            dataType: "json",
            data: JSON.stringify(parameters),
            headers: {'Authorization': 'Token ' + currentUser.auth_token},
            contentType: "application/json",
            url: production + "rendezvous/add_event/",
            success: function(data){
                console.log("Successfully added event");
                console.log(data);
            },
            error: function(data){
                console.log("Failed to add event.");
                console.log(data);
            }
        });
    }

    function deleteEvent(marker)
    {
        var lookup = currentUser.email + marker._latlng;

        $.ajax({
            type: "DELETE",
            headers: {'Authorization': 'token ' + currentUser.auth_token},
            dataType: "json",
            contentType: "application/json",
            url: production + "rendezvous/delete_event/" + lookup + "/",
            success: function (data) {
                console.log("Event Deleted");
            },
            error: function (data) {
                console.log("Deleting Event Failed");
                console.log(data);
            }
        });
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

    //This function sets global variable friendEmailId when friend is
    //clicked on th list view
    var friendEmailId = "";
    $(document).on('click', '.friendButtonClick', function(){
        console.log("Setting global friendEmailId variable.");
        var thisId = trimAllWhiteSpace(this.id);
        friendEmailId = thisId;
        console.log(friendEmailId);
    });

    //JQuery functions
    $(document).ready(function() {
        //Refactor this function to delete individual friends from the map
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
        //This button handles the modal button click to confirm
        //you would like to track the friend
        $("#friendClickHandler").click(function (event){
            console.log("Email=" + friendEmailId);
            sendPushMessage(currentUser, friendEmailId);

            //Clears Interval if one already exists.
            //We do this so as to not have more than one interval running at
            //once. This would be wasteful as the track friends function
            //which is attatched to this interval tracks every user in the
            //fMkr array anyway.
            if (trackFriendsId)
            {
                clearInterval(trackFriendsId);
            }

            setupFriendMarker(friendEmailId);
            trackFriendsId = setInterval(trackFriends, 10000);
            friendEmailId = "";
            $.mobile.changePage("#main");
        });

         $("#inviteClickHandler").click(function (event){
             var event_lookup_field = JSON.parse(localStorage.getItem('event_lookup_field'));
             console.log("elf"+event_lookup_field);
             console.log("Email=" + friendEmailId);

             var name = currentUser.firstName + " " + currentUser.lastName;
             var msg = name + " has sent you an Event Invitation!";
             var t = "invite";
             var elf = event_lookup_field;
             var parameters = {event_lookup_field:elf, type:t, from_friend_email: currentUser.email, to_friend_email: friendEmailId, from_friend_name: name, message: msg, from_friend: currentUser.email, to_friend: friendEmailId};
             console.log(parameters);

             $.ajax({
                type: "POST",
                dataType: "json",
                data: JSON.stringify(parameters),
                headers: {'Authorization': 'Token ' + currentUser.auth_token},
                contentType: "application/json",
                url: production + "/rendezvous/notifications/",
                success: function(data){
                    console.log("Successfully sent push message notification");
                    console.log(data);
                },
                error: function(data){
                    console.log("Failed sending push message notification.");
                    console.log(data);
                }
             });
             $.mobile.changePage("#main");
        });
    });

    function sendPushMessage(currentUser, friendEmail)
    {
        var name = currentUser.firstName + " " + currentUser.lastName;
        var msg = name + " has sent you a rendezvous request!";
        var t = "request";
        var parameters = {type:t, from_friend_email: currentUser.email, to_friend_email: friendEmail, from_friend_name: name, message: msg, from_friend: currentUser.email, to_friend: friendEmailId};
        console.log(parameters);

        $.ajax({
            type: "POST",
            dataType: "json",
            data: JSON.stringify(parameters),
            headers: {'Authorization': 'Token ' + currentUser.auth_token},
            contentType: "application/json",
            url: production + "/rendezvous/notifications/",
            success: function(data){
                console.log("Successfully sent push message notification");
                console.log(data);
            },
            error: function(data){
                console.log("Failed sending push message notification.");
                console.log(data);
            }
        });
    }

    function trimAllWhiteSpace(id)
    {
        var thisId = id;
        thisId = thisId.replace(/ /g,'');
        return thisId;
    }

    var fMkr = [];
    var tracking_enabled = [];
    var tmpMkr;
    function setupFriendMarker(fid)
    {
        console.log("setupFriendsMarker Function");

        $.ajax({type: "GET",
            dataType: "json",
            headers: { 'Authorization': 'Token ' + currentUser.auth_token},
            contentType: "application/json",
            url: production + "rendezvous/users/" + fid + "/",
            success: function(data){
                console.log("Setting up Marker for user :" + fid);
                var parsedCoords = parseCoordinates(data.last_known_position);

                //Setup marker and store in a dictionary
                tempMkr = L.marker([parsedCoords.longitude, parsedCoords.latitude], {icon: userMarker}).bindPopup("<b>" + data.first_name + " "
                    + data.last_name + "</b><br><p>" + data.email + "</p>" +
                    "<input type='button' id='" + data.email + "'value='Stop tracking' class='friend-delete-button btn-danger'/>");
                //" + data.email +  "\

                tempMkr.on("popupopen", onFriendPopupOpen);
                /***
                 *  fMkr data structure
                 *  key:   email of the friend to be tracked
                 *  value: the marker of the friend
                 *  onMap: tells the program if the marker has been applied
                 */
                fMkr.push({
                    key: data.email,
                    value: tempMkr,
                    onMap: false
                });

                /***
                 *  tracking_enabled data structure
                 *  key                 email of the friend being tracked
                 *  tracking_enabled    boolean flag to
                 */
                tracking_enabled.push({
                    key: data.email,
                    tracking_enabled: false
                });
            },
            error: function(data){
                console.log("unable to retrieve friends location");
            }
        });
    }

    function onFriendPopupOpen()
    {
        var marker = this;

        $(".friend-delete-button:visible").click(function () {
            var endpoint = currentUser.email + this.id;
            var to_friend_email = this.id;

            var parameters = {  "tracking_enabled" : "false" };

            //Update tracking_enabled field
            $.ajax({
                type: "PATCH",
                data: JSON.stringify(parameters),
                headers: {'Authorization': 'token ' + currentUser.auth_token},
                dataType: "json",
                contentType: "application/json",
                url: production + "rendezvous/updateFriendTracking/" + endpoint + "/",
                success: function (data) {
                    console.log("Successfully updated tracking enabled field");
                    map.removeLayer(marker);

                    //Send a push message to notify friend user has stopped tracking them
                    var name = currentUser.firstName + " " + currentUser.lastName;
                    var msg = name + " has stopped tracking your location";
                    var t = "response";
                    var parameters = {
                        accepted:true,
                        type:t,
                        from_friend_email: currentUser.email,
                        to_friend_email: to_friend_email,
                        from_friend_name: name,
                        message: msg,
                        from_friend: currentUser.email,
                        to_friend: to_friend_email
                    };
                    console.log(parameters);

                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        data: JSON.stringify(parameters),
                        headers: {'Authorization': 'Token ' + currentUser.auth_token},
                        contentType: "application/json",
                        url: production + "/rendezvous/notifications/",
                        success: function(data){
                            console.log("Successfully sent push message notification");
                            console.log(data);
                        },
                        error: function(data){
                            console.log("Failed sending push message notification.");
                            console.log(data);
                        }
                    });
                },
                error: function(data){
                    console.log("Unable to update tracking enabled field");
                }
            });
        })
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

            // First the program checks if the friend we wish to track
            // has allowed us to track their location by checking the
            // tracking_enabled variable attatched to the friendship on
            // the API.
            // If the tracking_enabled field is true, the tracking_enabled
            // variable is set to true and the program can now place and update
            // the friends marker on the map
            console.log("Attempting to GET data for user: " + fMkr[i].key);
            checkIfTrackingEnabled(fMkr[i].key);

            for(var j = 0; j < tracking_enabled.length; j++)
            {
                if (tracking_enabled[j].key == fMkr[i].key)
                {
                    if(tracking_enabled[j].tracking_enabled == true)
                    {
                        console.log("Getting Data for user: " + fMkr[i].key);

                        $.ajax({type: "GET",
                            dataType: "json",
                            headers: { 'Authorization': 'Token ' + currentUser.auth_token},
                            contentType: "application/json",
                            url: production + "rendezvous/users/" + fMkr[i].key + "/",
                            success: function(data){
                                //Loop through mkrDetails to get index of marker
                                // in fMkr array for this user
                                console.log("Recieved data for user: " + data.email);
                                for (i = 0; i < mkrDetails.length; i++)
                                {
                                    if (mkrDetails[i].key == data.email)
                                    {
                                        console.log("Updating Marker for user: " + mkrDetails[i].key);
                                        var index = mkrDetails[i].value;
                                    }
                                }

                                //add marker to the map if it doesnt already exist on the map
                                if (fMkr[index].onMap == false)
                                {
                                    fMkr[index].onMap = true;
                                    fMkr[index].value.addTo(map);
                                }

                                //update the marker
                                var parsedCoords = parseCoordinates(data.last_known_position);
                                fMkr[index].value.setLatLng([parsedCoords.longitude, parsedCoords.latitude]).update();
                            },
                            error: function(data){
                                console.log("Unable to retrieve friends location");
                                alert("Unable to retrieve friends. Check your internet connection.");
                            }
                        });
                    }
                    else
                    {
                        map.removeLayer(fMkr[i].value);
                    }
                }
            }
        }
    }


    function checkIfTrackingEnabled(friend)
    {
        console.log("Checking if tracking is enabled for friend: " + friend);

        $.ajax({type: "GET",
            dataType: "json",
            headers: { 'Authorization': 'Token ' + currentUser.auth_token},
            contentType: "application/json",
            url: production + "rendezvous/friendTracking/" + currentUser.email + "/" + friend + "/",
            success: function(data){
                console.log("Recieved friend tracking data for user " + data[0].to_friend_email);
                for (i = 0; i < tracking_enabled.length; i++)
                {
                    if (tracking_enabled[i].key == data[0].to_friend_email)
                    {
                        //Update tracking enabled field in dictionary
                        tracking_enabled[i].tracking_enabled = data[0].tracking_enabled;
                    }
                }
            },
            error: function(data){
                console.log(data);
                console.log("Friend Tracking Data not recieved");
            }
        });
    }


    function openPostGate()
    {
        console.log("Post gate closed. Location updating to the API disabled for 10 seconds.");
        setTimeout(function(){
            console.log("Post gate re-opened. Location updating to the API enabled.");
            postGateOpen = true;
        }, 10000);
    }

    var locateGate = true;
    $("#toggleLocate").click(function(event){
        if(locateGate)
        {
            locateGate = false;
            console.log("Disabling Location");
            location.stopLocate();
            document.getElementById("toggleLocate").src = "images/locate-off.png";
        }
        else
        {
            console.log("Enabling Location");
            locateGate = true;
            map.locate({setView: true, maxZoom: 16, timeout:600000, enableHighAccuracy: true, watch: true});
            document.getElementById("toggleLocate").src = "images/locate-on.png";
        }
    });

    map.locate({setView: true, maxZoom: 16, timeout:600000, enableHighAccuracy: true, watch: true});
    var location = map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.on('click', onMapClick);
}
