var RendezvousUsers = function(firstName, lastName, email)
{
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.latlng = "";
}

var Friend = function(firstName, lastName, email, latlng)
{
    RendezvousUsers.call(firstName, lastName, email, latlng);
}


