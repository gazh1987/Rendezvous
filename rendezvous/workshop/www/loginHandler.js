var localHost = "http://localhost:8000/";
var production = "http://rendezvous-704e3pxx.cloudapp.net/";

$(document).ready(function() {

    //Login handler
    $("#login").submit(function(event){
        event.preventDefault();
        var email = $("#email").val().toLowerCase();
        var password = $("#password").val();
        var parameters = {email : email, password : password};
        console.log(production);

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
        var isOffline = 'onLine' in navigator && !navigator.onLine;

        //Check if device is online
        if ( isOffline )
        {
            alert("Can not register if your device is offline. Please connect to the internet and try again.");
        }
        else
        {
            event.preventDefault();
            var firstName = $("#firstName").val();
            var lastName = $("#lastName").val();
            var email = $("#regEmail").val().toLowerCase();
            var phoneNum = $("#regPhoneNumber").val();
            var password = $("#regPassword").val();
            var passwordCheck = $("#passwordCheck").val();

            var vCheck = validityCheck(firstName, lastName, email, phoneNum, password, passwordCheck);
            var pCheck = phoneNumberCheck(phoneNum);

            if (vCheck != "PASSED" || pCheck == "200") {
                alert("Can not register these details. Please try again.");
                return false;
            }

            var parameters = {email: email, password: password, first_name: firstName, last_name: lastName};
            var phoneNumberParameters = {phone_number: phoneNum, email: email};

            //Post details to phone numbers table, do this synchronously so we can stop the registration process
            //should the POST fail
            var client = new XMLHttpRequest();
            client.open("POST", production + "rendezvous/phoneNumbers/", false);
            client.setRequestHeader("Content-Type", "application/json");
            client.send(JSON.stringify(phoneNumberParameters));

            if (client.status != "201")
            {
                alert("Registration Failed. Please try again.");
                return false;
            }

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
        }
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
            getFriends(token, data.email);
        },
        error: function(data){
            console.log(data);
            alert("Unable to login with details provided. Please try again.");
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

            //When using production change length to count
            for (i = 0; i < data.count; i ++)
            {
                //When using localHost server change "data.results[i].to_friend" to data[i].to_friend
                friendsList.push(data.results[i].to_friend_email);
            }

            localStorage.setItem('friendsList', JSON.stringify(friendsList));
            window.location.assign("main.html");
        },
        error: function(data){
            console.log(data);
        }
    })
}

function phoneNumberCheck(num)
{
    //Synchronous call to check if found number exists and return the request status to check if
    //the status code is 200. If the code is 200, the number exists and the registration will fail.
    var request = new XMLHttpRequest();
    request.open('GET', production + 'rendezvous/phoneNumbers/' + num + '/', false);
    request.send(null);

    return request.status;
}


function validityCheck(firstName, lastName, email, phoneNum, password, passwordCheck)
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
    if (phoneNum == "" || phoneNum == null)
    {
        return "You did not enter a phone number. Please try again";
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
