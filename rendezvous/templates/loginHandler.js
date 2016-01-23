$(document).ready(function() {

    //Login handler
    $("#login").submit(function(event){
        event.preventDefault();
        var email = $("#email").val();
        var password = $("#password").val();
        var parameters = {email : email, password : password};

        $.ajax({
            type: "POST",
            data: JSON.stringify(parameters),
            dataType: "json",
            contentType: "application/json",
            url: "http://localhost:8000/login/",
            success: function(data){
                setCurrentUserAndRedirect(data.token);
            },
            error: function(data){
                $("#loginFail").text("Unable to login with details provided. Please try again.");
            }
        });
    });

    //registrationHandler
    $("#register").submit(function(event){
        event.preventDefault();
        var firstName = $("#firstName").val();
        var lastName = $("#lastName").val();
        var email = $("#regEmail").val();
        var password = $("#regPassword").val();
        var passwordCheck = $("#passwordCheck").val();

        var vCheck = validityCheck(firstName, lastName, email, password, passwordCheck);
        if (vCheck != "PASSED")
        {
            $("#registerFail").text(vCheck);
            return false;
        }

        var parameters = {email : email, password : password, first_name : firstName, last_name : lastName};

        $.ajax({
            type: "POST",
            data: JSON.stringify(parameters),
            dataType: "json",
            contentType: "application/json",
            url: "http://localhost:8000/signup/",
            success: function(data){
                //registerPass
                $("#registerPass").text("You have succesfully registered your details. Please go to you email and click the link" +
                    " to complete your registration. Then, enter your login details here to use the app. Thank you for registering.");
                window.location.assign("#login");
            },
            error: function(data){
                console.log(data.responseText);
                $("#registerFail").text(data);
            }
        });
    });
});

function setCurrentUserAndRedirect(token)
{
    $.ajax({
        type: "GET",
        dataType: "json",
        headers: {'Authorization': 'token ' + token},
        contentType: "application/json",
        url: "http://localhost:8000/users/me/",
        success: function(data){
            //TODO: trying to pass user object to main.html using locationStorage.
            var user = new User(data.first_name, data.last_name, data.email, token);
            localStorage.setItem('user', JSON.stringify(user));

            window.location.assign("main.html");
        },
        error: function(data){
            $("#loginFail").text("Unable to login with details provided. Please try again.");
        }
    });
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
