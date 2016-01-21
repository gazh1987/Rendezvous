var User = function(firstName, lastName, email, token)
{
    RendezvousUsers.call(this, firstName, lastName, email);
    this.auth_token = token;
}

//Set latlng function
User.prototype.SetLatLng = function()
{
    console.log("hello");
}


User.prototype.PostLastKnownPosition = function()
{
    console.log(this);
}