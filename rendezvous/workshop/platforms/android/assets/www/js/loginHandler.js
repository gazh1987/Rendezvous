var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";

$(document).ready(function() {

    /**
     * Summary: Login event handler. POSTS users email and password
     *          to API and return an token if the credentials are
     *          accepted. The token gives the user permission to
     *          access data on the server.
     */
    $("#login").submit(function(event){
        event.preventDefault();
        var email = $("#email").val().toLowerCase();
        var password = $("#password").val();
        var parameters = {email : email, password : password};

        $.ajax({
            type: "POST",
            data: JSON.stringify(parameters),
            dataType: "json",
            contentType: "application/json",
            url: production + "login/",
            success: function(data){
                console.log(data.token);
                setCurrentUserAndRedirect(data.token);
            },
            error: function(data){
                console.log(data);
                alert("Unable to login with details provided. Please try again.")
            }
        });
    });

    /**
    * Summary:  Send a HTTP POST request to the API and registers the users
     *          details. An validation email is sent to the users provided email address.
     *          Then redirects to the login page.
    */
    $("#register").submit(function(event)
    {
        event.preventDefault();
        var firstName = $("#firstName").val();
        var lastName = $("#lastName").val();
        var email = $("#regEmail").val().toLowerCase();
        var password = $("#regPassword").val();
        var passwordCheck = $("#passwordCheck").val();
        var vCheck = validityCheck(firstName, lastName, email, password, passwordCheck);
        if (vCheck != "PASSED")
        {
            alert("Can not register these details. Please try again.");
            return false;
        }
        var parameters = {email: email, password: password, first_name: firstName, last_name: lastName};

        $.ajax({
            type: "POST",
            data: JSON.stringify(parameters),
            dataType: "json",
            contentType: "application/json",
            url: production + "signup/",
            success: function (data) {
                //TODO: put verification URL here
                alert("You have succesfully registered your details. Please go to your email and click the link" +
                    " to complete your registration. Then, enter your login details here to use the app. Thank you for registering.");
                window.location.assign("#login");
            },
            error: function (data) {
                console.log(data);
                alert("Registration Failed. Please try again.");
            }
        });
    });
});

/**
 * Summary:     GETS the users details from the API and creates a User object.
 * Parameters
 *      token:  The API access token for the user logging in.
 */
function setCurrentUserAndRedirect(token)
{
    $.ajax({
        type: "GET",
        dataType: "json",
        headers: {'Authorization': 'Token ' + token},
        contentType: "application/json",
        url: production + "users/me/",
        success: function(data){
            console.log("Creating User");
            var user = new User(data.first_name, data.last_name, data.email, token);
            localStorage.setItem('user', JSON.stringify(user));
            console.log(user);
            savePushMessagingRegistrationId(token);
            getTrackers(token, data.email);
            getEvents(token, data.email);
            getInvitedEvents(token, data.email);
            getFriends(token, data.email);
        },
        error: function(data){
            console.log(data);
            alert("Unable to login with details provided. Please try again.");
        }
    });
}

/**
 * Summary: Saves the Google Cloud Messaging device id in the database with a
 *          relationship with the current User logging in.
 */
function savePushMessagingRegistrationId(token)
{
    console.log("Token = " + token);
    var reg_id = JSON.parse(localStorage.getItem('registration_id'));
    var parameters = {registration_id:reg_id};
    console.log(reg_id);

    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify(parameters),
        headers: {'Authorization': 'Token ' + token},
        contentType: "application/json",
        url: production + "rendezvous/device/GCM/",
        success: function(data){
            console.log("Successfully saved device details");
            console.log(data);
        },
        error: function(data){
            console.log("Saving device details failed");
            console.log(data);
        }
    });
}

/**
 * Summary: Sends a HTTP GET request to the API and retrieves all
 *          users that the user is friends with.
 *          This list of friends is then stored in localStorage so
 *          it can be accessed throughout the application.
 */
function getFriends(token, email)
{
    $.ajax({
        type:"GET",
        async: false,
        dataType: "json",
        headers: { 'Authorization': 'Token '+ token },
        contentType: "application/json",
        url: production + "rendezvous/friends/" + email + "/",
        success: function(data) {
            console.log("Creating friends list");
            var friendsList = [];
            for (i = 0; i < data.length; i ++)
            {
                friendsList.push(data[i].to_friend_email);
            }
            localStorage.setItem('friendsList', JSON.stringify(friendsList));
            console.log("Friends received");
            window.location.assign("main.html");
        },
        error: function(data){
            console.log(data);
        }
    })
}

/**
 * Summary: Send a HTTP GET request to the API and retrieves all
 *          friends that are currently tracking the user logging in.
 *          This list of friends is then stored in localStorage so
 *          it can be accessed throughout the application.
 */
function getTrackers(token, email)
{
    //Get friends tracking user
    $.ajax({
        type:"GET",
        async: false,
        dataType: "json",
        headers: { 'Authorization': 'Token '+ token },
        contentType: "application/json",
        url: production + "rendezvous/friendTrackingList/" + email + "/",
        success: function(data) {
            console.log("Creating tracking list");
            console.log(data);
            var trackersList = [];
            for (i = 0; i < data.length; i ++)
            {
                trackersList.push(data[i].from_friend_email);
            }
            localStorage.setItem('trackersList', JSON.stringify(trackersList));
            console.log("Trackers recieved");
        },
        error: function(data){
            console.log(data);
        }
    })

    /**
     * Summary: Send a HTTP GET request to the API and retrieves all
     *          friends that the user is currently tracking.
     *          This list of friends is then stored in localStorage so
     *          it can be accessed throughout the application.
     */
    $.ajax({
        type:"GET",
        dataType: "json",
        headers: { 'Authorization': 'Token '+ token },
        contentType: "application/json",
        url: production + "rendezvous/userTrackingList/" + email + "/",
        success: function(data) {
            console.log("Creating userTrackingList");
            console.log(data);
            var userTrackersList = [];
            for (var i = 0; i < data.length; i ++)
            {
                userTrackersList.push(data[i].to_friend_email);
            }
            localStorage.setItem('userTrackersList', JSON.stringify(userTrackersList));
        },
        error: function(data){
            console.log(data);
        }
    })
}

/**
 * Summary: Send a HTTP GET request to the API and retrieves all
 *          Events that the user created.
 *          This list of events is then stored in localStorage so
 *          it can be accessed throughout the application.
 */
function getEvents(token, email)
{
    $.ajax({
        type:"GET",
        async: false,
        dataType: "json",
        headers: { 'Authorization': 'Token '+ token },
        contentType: "application/json",
        url: production + "rendezvous/get_user_events/" + email + "/",
        success: function(data) {
            console.log("Creating events list");
            console.log(data);
            var userEvents = [];
            userEvents.push(data);
            localStorage.setItem('userEvents', JSON.stringify(userEvents));
            console.log("Events recieved");
        },
        error: function(data){
            console.log(data);
        }
    })
}

/**
 * Summary: Send a HTTP GET request to the API and retrieves all
 *          Events that the User is invited to.
 *          This list of events is then stored in localStorage so
 *          it can be accessed throughout the application.
 */
function getInvitedEvents(token, email)
{
    $.ajax({
        type:"GET",
        async: false,
        dataType: "json",
        headers: { 'Authorization': 'Token '+ token },
        contentType: "application/json",
        url: production + "rendezvous/get_attending_events/" + email + "/",
        success: function(data) {
            console.log("Creating invited events list");
            console.log(data);
            var invitedEvents = [];
            invitedEvents.push(data);
            localStorage.setItem('invitedEvents', JSON.stringify(invitedEvents));
            console.log("Invited events received");
        },
        error: function(data){
            console.log(data);
        }
    })
}

/**
 * Summary: Checks that the details entered in the registration screen are valid.
 */
function validityCheck(firstName, lastName, email, password, passwordCheck)
{
    if (firstName == "" || firstName == null)
    {
        return "You did not enter your first name. Please try again";
    }
    if (lastName == "" || lastName == null)
    {
        return "You did not enter your last name. Please try again";
    }
    if (email == "" || email == null)
    {
        return "You did not enter an email address. Please try again";
    }
    if (password == "" || password == null)
    {
        return "You did not enter a password. Please try again";
    }
    if (passwordCheck == "" || passwordCheck == null)
    {
        return "You did not enter the password check field. Please try again";
    }
    if (password != passwordCheck)
    {
        return "Your password and password check does not match. Please try again";
    }
    return "PASSED";
}
