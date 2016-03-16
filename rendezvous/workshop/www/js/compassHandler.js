// Global variable
var img = null,
	ctx = null,
	degrees = 0;

function clearCanvas() {
	ctx.clearRect(0, 0, 200, 200);
}

function initCompass()
{
    // Grab the compass element
    var canvas = document.getElementById('compass');

    // Canvas supported?
    if(canvas.getContext('2d'))
    {
        ctx = canvas.getContext('2d');

        // Load the arrow image
        arrow = new Image();
        arrow.src = 'images/arrow.png';
        arrow.onload = imgLoaded;
    }
    else
    {
        alert("Canvas not supported!");
    }
}

function imgLoaded()
{
    // Image loaded event complete.  Start the timer
    setInterval(draw, 100);
}

function draw()
{
    clearCanvas();
    ctx.save();
    ctx.translate(25, 25);
    ctx.rotate(degrees * (Math.PI / 180));
    ctx.drawImage(arrow, -20, -20, 40, 40);
    ctx.restore();
    degrees += 5;
}