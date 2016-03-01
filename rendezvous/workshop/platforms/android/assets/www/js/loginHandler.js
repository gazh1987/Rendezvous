var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";

$(document).ready(function() {

    //Login handler
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

    //registrationHandler
    $("#register").submit(function(event){
        event.preventDefault();
        var firstName = $("#firstName").val();
        var lastName = $("#lastName").val();
        var email = $("#regEmail").val().toLowerCase();
        var password = $("#regPassword").val();
        var passwordCheck = $("#passwordCheck").val();

        var vCheck = validityCheck(firstName, lastName, email, password, passwordCheck);

        if (vCheck != "PASSED") {
            alert("Can not register these details. Please try again.");
            return false;
        }

        var parameters = {email: email, password: password, first_name: firstName, last_name: lastName};

        //Post details to rendezvous users table
        $.ajax({
            type: "POST",
            data: JSON.stringify(parameters),
            dataType: "json",
            contentType: "application/json",
            url: production + "signup/",
            success: function (data) {
                //registerPass
                alert("You have succesfully registered your details. Please go to you email and click the link" +
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
            getFriends(token, data.email);
        },
        error: function(data){
            console.log(data);
            alert("Unable to login with details provided. Please try again.");
        }
    });
}

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

function getFriends(token, email)
{
    $.ajax({
        type:"GET",
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
            window.location.assign("main.html");
        },
        error: function(data){
            console.log(data);
        }
    })
}

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
