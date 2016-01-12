var User = function(firstName, lastName, email, token)
{
    RendezvousUsers.call(this, firstName, lastName, email);
    this.auth_token = token;
}

User.prototype.PostLastKnownPosition = function()
{
    console.log("postLatKnownPosition");
}