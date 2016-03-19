var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";
var map = null;

/**
 * Summary: Map class that handles all map related interactions and events.
 */
var Map = function()
{
    //Get the login details and create a new User
    var userLoginData = JSON.parse(localStorage.getItem('user'));
    var currentUser = new User(userLoginData.firstName,  userLoginData.lastName, userLoginData.email, userLoginData.auth_token);

    var friendsListLoginData = JSON.parse(localStorage.getItem('friendsList')); //Get the friends List
    localStorage.setItem('currentUser', JSON.stringify(currentUser)); //Store currentUser so it can be accessed from anywhere in the app
    var postGateOpen = true;
    var trackFriendsId;
    var userEventsInitialised = false;
    var reInitialisedFriends = false;
    var invitedEventsInitialised = false;
    map = L.map('map', { zoomControl:false, attributionControl:false }); //Create the map

    //Custom icons
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

    //Use an open street map map
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(map);

    /**
     * onLocationFound: Event fired when users location is found.
     */
    var uMkr;
    var uCir;
    function onLocationFound(e) {

        //Draw the compass
        draw(e.heading, e.latlng);
        console.log("Token: " + currentUser.auth_token);

        //If ten seconds have passed since the last time a location was posted to
        //the database, put the users new location on the map and post the coordinates to the
        //database.
        if (postGateOpen == true) {
            postGateOpen = false;
            openPostGate();
            var radius = e.accuracy / 2;

            //If there is no marker for the user already on the map, set one up
            if (!uMkr) {
                uMkr = L.marker(e.latlng).bindPopup("<b>You</b><br><p>" + currentUser.email + "</p>").addTo(map);
                uCir = L.circle(e.latlng, radius).addTo(map);
            }

            //Update the users location on the map and post the location to the database
            uMkr.setLatLng(e.latlng).update();
            uCir.setLatLng(e.latlng);
            currentUser.latlng = e.latlng;
            currentUser.PostLastKnownPosition(currentUser);
        }

        //Code to be ran once after login.
        //Reinitialises user created events on the map
        if (userEventsInitialised == false) {
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
                            }).bindPopup("<input type='button' value='Compass Directions' class='marker-compass-button btn-success'/><br><br>" +
                                         "<a href='#inviteFriendsList' class='marker-invite-button btn btn-primary btn-xs' style='color: white;'>Invite Friends</a><br><br>" +
                                         "<input type='button' value='Delete this marker' class='marker-delete-button btn-danger'/><br>");

                            marker.on("popupopen", onEventPopupOpen);
                            return marker;
                        }
                    }).addTo(map);
                }
            }
        }

        //Reinitialses friends being tracked on the map
        if (reInitialisedFriends == false) {
            reInitialisedFriends = true;
            var friendsToTrack = JSON.parse(localStorage.getItem('userTrackersList'));

            if (friendsToTrack != null)
            {
                console.log("Friends to track length=" + friendsToTrack.length);
                for (var i = 0; i < friendsToTrack.length; i++) {
                    setupFriendMarker(friendsToTrack[i]);
                    trackFriendsId = setInterval(trackFriends, 10000);
                }
            }
        }

        //Reinitialses events the user is invited to on the map
        if (invitedEventsInitialised == false) {
            invitedEventsInitialised = true;
            var tempInvitedEvents = JSON.parse(localStorage.getItem('invitedEvents'));

            if (tempInvitedEvents != null)
            {
                var invitedEvents = tempInvitedEvents[0];

                for (var i = 0; i < invitedEvents.length; i++) {
                    $.ajax({
                        type: "GET",
                        dataType: "json",
                        headers: {'Authorization': 'Token ' + currentUser.auth_token},
                        contentType: "application/json",
                        url: production + "/rendezvous/get_event_details_by_id/" + invitedEvents[i].event + "/",
                        success: function (data) {
                            //Add event to map
                            var coords = parseCoordinates(data.coordinates);
                            var lup = currentUser.email + data.lookup_field;

                            //Place marker on the map
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
                                    }).bindPopup("<input type='button' value='Compass Directions' class='marker-compass-button btn-success'/><br><br>" +
                                        "<input type='button' name='" + data.event_creator_email + "' id='" + lup + "' value='Leave this event' class='marker-leave-event-button btn-danger'/>");

                                    marker.on("popupopen", onEventPopupOpen);
                                    return marker;
                                }
                            }).addTo(map);
                        },
                        error: function (data) {
                            console.log("Failed to add event.");
                            console.log(data);
                        }
                    });
                }
            }
        }
    }

    /**
     * Summary: Fired when the user current location can not be found
     */
    function onLocationError(e)
    {
        console.log(e);
        alert(e.message);
    }

    /**
     *  Summary: Fired when the user clicks a location on the map. Adds a
     *           marker to that location and posts the marker, along with
     *           the user who plcaed the marker, to the Events table in the
     *           database.
     */
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
                }).bindPopup("<input type='button' value='Compass Directions' class='marker-compass-button btn-success'/><br><br>" +
                             "<a href='#inviteFriendsList' class='marker-invite-button btn btn-primary btn-xs' style='color: white;'>Invite Friends</a><br><br>" +
                             "<input type='button' value='Delete this marker' class='marker-delete-button btn-danger'/><br>");

                marker.on("popupopen", onEventPopupOpen);
                return marker;
            }
        }).addTo(map);
        saveEvent(e.latlng);
    }

    /**
     * Summary: Opens a popUp window with various options when the user clicks on a particular event.
     */
    function onEventPopupOpen()
    {
        var marker = this;

        //Points the compass at this marker
        $(".marker-compass-button:visible").click(function () {
            CreateTarget(marker._latlng, "Event");
        });

        //Saves the id of the event in localStorage so it can be accessed by the inviteClickHandler
        //jQuery click handler. See #inviteClickHandler
        $(".marker-invite-button:visible").click(function () {
            var event_lookup_field = currentUser.email + marker._latlng;
            localStorage.setItem('event_lookup_field', JSON.stringify(event_lookup_field));
        });

        //Removes the marker from the map and Deletes the event from the
        //database, only available if the user created the event
        $(".marker-delete-button:visible").click(function () {
            map.removeLayer(marker);
            deleteEvent(marker);
        });

        //Allows the user to delete the marker and Leave the event, only available
        //if the user was invited to the event
        $(".marker-leave-event-button:visible").click(function () {
            map.removeLayer(marker);
            var currentUser = JSON.parse(localStorage.getItem('currentUser'));
            var inviters_email = this.name;

            //Remove user from the event
            $.ajax({
                type: "DELETE",
                headers: {'Authorization': 'token ' + currentUser.auth_token},
                dataType: "json",
                contentType: "application/json",
                url: production + "rendezvous/delete_event_details/" + this.id + "/",
                success: function (data) {
                    var parameters = {"tracking_enabled": "false"};
                    var endpoint = inviters_email + currentUser.email;

                    //Update tracking_enabled field in relationship between users
                    $.ajax({
                        type: "PATCH",
                        data: JSON.stringify(parameters),
                        headers: {'Authorization': 'token ' + currentUser.auth_token},
                        dataType: "json",
                        contentType: "application/json",
                        url: production + "rendezvous/updateFriendTracking/" + endpoint + "/",
                        success: function (data) {

                            //Send push notification informing the event creator that the user has
                            //left the event
                            var name = currentUser.firstName + " " + currentUser.lastName;
                            var msg = name + " has left the Event!";
                            var t = "response";
                            var parameters = {
                                accepted:true,
                                type:t,
                                from_friend_email: currentUser.email,
                                to_friend_email: inviters_email,
                                from_friend_name: name,
                                message: msg,
                                from_friend: currentUser.email,
                                to_friend: inviters_email
                            };

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
                        error: function (data) {
                            console.log("Error updating tracking_enabled field");
                            console.log(data);
                        }
                    });
                },
                error: function (data) {
                    console.log("Error removing user from event");
                    console.log(data);
                }
            });
        });
    }

    /**
     * Summary: Posts newly created event details to the database
     */
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

    /**
     * Summary: Deletes an Event from the database
     * */
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

    /**
     * Summary:     Parses coordinates into an object containing latitude and longitude variables.
     * Parameters
     *      c: Coordinates to be parsed
     * Returns:     An object containing latitude and longitude coordinates
     */
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

    /**
     * Summary: Sets the global variable friendEmailId when friend is clicked on the friends list view
     *          This variable is used as part of the setupFriendMarker function. See setupFriendMarker.
     */
    var friendEmailId = "";
    $(document).on('click', '.friendButtonClick', function(){
        console.log("Setting global friendEmailId variable.");
        var thisId = trimAllWhiteSpace(this.id);
        friendEmailId = thisId;
        console.log(friendEmailId);
    });


    //JQuery functions
    $(document).ready(function() {
        /**
         * Summary: Untracks all friends that the user is currently tracking.
         *          This function is currently not in use but should be refactored and used at
         *          a later time to allow the user to remove all friends markers from the map and
         *          update the tracking_enabled database fields to false all at once.
         */
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

            //Initialise the marker
            setupFriendMarker(friendEmailId);

            //Create an interval that fires the trackFriends function every 10 seconds. See trackFriends.
            trackFriendsId = setInterval(trackFriends, 10000);
            friendEmailId = "";
            $.mobile.changePage("#main");
        });

        /**
         * Summary: Send an event invitation to a friend. Send the push message and sets up an interval that
         *          calls the trackFriend function every 10 seconds
         */
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
                    setupFriendMarker(friendEmailId);
                    trackFriendsId = setInterval(trackFriends, 10000);
                    friendEmailId = "";
                },
                error: function(data){
                    console.log("Failed sending push message notification.");
                    console.log(data);
                }
             });
             $.mobile.changePage("#main");
        });
    });

    /**
     * Summary:     Sends a rendezvous request from the user to a specific friend. Also
     *              saves the message in the notification table so the friend can access
     *              it.
     * Parameters
     *      currenTUser: The logged in user
     *      friendEmail: Email of the friend recieving the request
     * */
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

    /**
     * Summary: Trims all white space from a string
     */
    function trimAllWhiteSpace(id)
    {
        var thisId = id;
        thisId = thisId.replace(/ /g,'');
        return thisId;
    }

    /**
     * Summary: Sends a GET request to the API to get a friends details.
     *          It then sets up friends marker on the map and stores the details of the friend
     *          in a data structure that can be accessed again when the friends location needs
     *          to be updated. See fMkr data structure and the trackFriends Function
     */
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
                    "<input type='button' id='" + data.email + "'value='Compass Directions' class='marker-friend-compass-button btn-success'/><br><br>" +
                    "<input type='button' id='" + data.email + "'value='Stop tracking' class='friend-delete-button btn-danger'/>");

                tempMkr.on("popupopen", onFriendPopupOpen);
                /***
                 *  fMkr data structure. Used to keep track of the markers of friends the user is currently tracking.
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
                 *  tracking_enabled data structure. Used to check if the user has permission to track a friend
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

    /**
     * Summary: Opens a popUp window with various options when the user clicks on a particular friend.
     */
    function onFriendPopupOpen()
    {
        var marker = this;

        //Points the compass towards this friend
        $(".marker-friend-compass-button:visible").click(function () {
            CreateTarget(marker._latlng, this.id);
        });

        //Stops user tracking the friend
        $(".friend-delete-button:visible").click(function () {
            var endpoint = currentUser.email + this.id;
            var to_friend_email = this.id;

            var parameters = {  "tracking_enabled" : "false" };

            //Update tracking_enabled field to stop allowing the user to track the friends location
            $.ajax({
                type: "PATCH",
                data: JSON.stringify(parameters),
                headers: {'Authorization': 'token ' + currentUser.auth_token},
                dataType: "json",
                contentType: "application/json",
                url: production + "rendezvous/updateFriendTracking/" + endpoint + "/",
                success: function (data) {
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

    /**
     * Summary: Uses the fMkr data structure to update all locations of any friend the user is tracking.
     */
    var mkrDetails = [];
    function trackFriends()
    {
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
            checkIfTrackingEnabled(fMkr[i].key);

            for(var j = 0; j < tracking_enabled.length; j++)
            {
                if (tracking_enabled[j].key == fMkr[i].key)
                {
                    if(tracking_enabled[j].tracking_enabled == true)
                    {
                        //Gets the user details of the friend being tracked
                        $.ajax({type: "GET",
                            dataType: "json",
                            headers: { 'Authorization': 'Token ' + currentUser.auth_token},
                            contentType: "application/json",
                            url: production + "rendezvous/users/" + fMkr[i].key + "/",
                            success: function(data){
                                //Loop through mkrDetails to get index of marker
                                //in fMkr array for this user
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

                                //update the compass if it is in use
                                if (compassInUse == true) {
                                    if (data.email == targetId) {
                                        var t = {
                                            lng: parseFloat(parsedCoords.latitude),
                                            lat: parseFloat(parsedCoords.longitude)
                                        };
                                        UpdateTarget(t);
                                    }
                                }
                            },
                            error: function(data){
                                console.log("Unable to retrieve friends location");
                                alert("Unable to retrieve friends. Check your internet connection.");
                            }
                        });
                    }
                    else
                    {
                        //Remove the marker if tracking enabled is false
                        map.removeLayer(fMkr[i].value);
                    }
                }
            }
        }
    }

    /**
     * Summary: Send a Get request to the API which checks if tracking is enabled
     *          between the user and a friend
     */
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

    /**
     * Summary: Sets a 10 second timer that when finished sets the postGateOpen
     *          boolean flag to true. When this flag is true, new location coordinates
     *          can be posted to the database.
     */
    function openPostGate()
    {
        console.log("Post gate closed. Location updating to the API disabled for 10 seconds.");
        setTimeout(function(){
            console.log("Post gate re-opened. Location updating to the API enabled.");
            postGateOpen = true;
        }, 10000);
    }

    /**
     * Summary: Toggles if the app is allowed geolocate the user. This is useful for when the user
     *          wishes to explore the map without being interrupted
     */
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
