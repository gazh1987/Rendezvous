// Global variable
var target;
var compassInUse = false;
var img = null, ctx = null;

function clearCanvas() {
	ctx.clearRect(0, 0, 200, 200);
}

function initCompass()
{
    // Grab the compass element
    var canvas = document.getElementById('compass');

    // Make sure canvas is supported
    if(canvas.getContext('2d'))
    {
        ctx = canvas.getContext('2d');

        // Load the arrow image
        arrow = new Image();
        arrow.src = 'images/arrow.png';
    }
    else
    {
        alert("Compass is not supported on this device.");
    }
}

function draw(heading, currentPos)
{
    clearCanvas();
    ctx.save();
    ctx.translate(25, 25);

    //If target is null, point arrow north
    if(target != null)
    {
        //If heading is null, do nothing
        if (heading != null)
        {
            var brng = bearing(currentPos.lat, currentPos.lng, target.lat, target.lng);
            var directionToTravel = brng - heading;
            if (directionToTravel < 0) {
                directionToTravel = directionToTravel += 360;
            }
            ctx.rotate(directionToTravel * (Math.PI / 180));
        }
    }
    else
    {
        ctx.rotate(0 * (Math.PI / 180));
    }

    ctx.drawImage(arrow, -20, -20, 40, 40);
    ctx.restore();
}

function bearing(lat1,lng1,lat2,lng2)
{
    var dLon = (lng2-lng1);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    var brng = this._toDeg(Math.atan2(y, x));
    return 360 - ((brng + 360) % 360);
}

function _toRad(deg)
{
    return deg * Math.PI / 180;
}

function _toDeg(rad)
{
        return rad * 180 / Math.PI;
}

function resetCompass()
{
    compassInUse = false;
    target = null;
    draw();
}