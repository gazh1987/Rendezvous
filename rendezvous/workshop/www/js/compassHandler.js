/**
 * Name:    compassHandler.js
 * Summary: code for handling all compass functionality
 */

var img = null, ctx = null;
var target;
var targetId;
var compassInUse = false;

/**
 * Summary:     Sets up the global variables needed to operate the compass.
 * Variables
 *      target:         The target coordinates of where the compass should point
 *      targetId:       The email address of the user being tracked by the compass.
 *                      Will be set to "Event" if the compass is pointing to an event.
 *      compassInUse:   Boolean flag that stores whether or not the comass in in use.
 */
function CreateTarget(t, tId)
{
    target = t;
    targetId = tId;
    compassInUse = true;
}

/**
 * Summary: Resets the global variables needed to operate the compass when the compass
 *          is reset.
 */
function RemoveTarget()
{
    target = null;
    targetId = null;
    compassInUse = false;
}

/**
 * Summary:     Update the target coordinate when a friends location change.
 * Parameters
 *      t: Object containing latitude and longitude coordinates of friend being tracked.
 */
function UpdateTarget(t)
{
    target = t;
}

function clearCanvas() {
	ctx.clearRect(0, 0, 200, 200);
}

function initCompass()
{
    var canvas = document.getElementById('compass');
    if(canvas.getContext('2d'))
    {
        ctx = canvas.getContext('2d');
        arrow = new Image();
        arrow.src = 'images/arrow.png';
    }
    else
    {
        alert("Compass is not supported on this device.");
    }
}

/**
 * Summary:     Given the Target location and the users current location and heading,
 *              this function calculates the direction which the compass should face
 *              and then draws the compass onto the canvas.
 * Parameters
 *      heading:    The current direction that the user is moving, in degrees.
 *      currentPos: The current latitude and longitude positions of the user
 * */
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

/**
 * Summary:     Giving two locations, calculates the bearing between the two point.
 * Parameters
 *      lat1:   The users current latitude position
 *      lng1:   The users current longitude position
 *      lat2:   The target destination latitude position
 *      lng2:   The target destination longitude position
 * Returns:     The bearing between the two points
 */
function bearing(lat1,lng1,lat2,lng2)
{
    var dLon = (lng2-lng1);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    var brng = this._toDeg(Math.atan2(y, x));
    return 360 - ((brng + 360) % 360);
}

/**
 * Summary: Degrees to Radians function
 */
function _toRad(deg)
{
    return deg * Math.PI / 180;
}

/**
 * Summary: Radians to Degrees function
 */
function _toDeg(rad)
{
        return rad * 180 / Math.PI;
}

/**
 * Summary: Resets all compass global variables and draws the compass.
 *          The compass points north when variables are not set.
 */
function resetCompass()
{
    RemoveTarget();
    draw();
}