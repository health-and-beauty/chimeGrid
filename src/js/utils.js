(function(){

var generateCircleCoords = function (radius, cx, cy, points) {
    var r = radius || 100;
    var pts = points || 8;
    var i = 0;
    var x;
    var y;
    var xoffset = cx || 0;
    var yoffset = cy || 0;
    coords = [];
    for (i=0; i<pts; i++) {
        var a = 2 * Math.PI * i/pts;
        var x = r * Math.cos(a);
        var y = r * Math.sin(a);
        coords.push([x + xoffset, y + yoffset]);
    }
    return coords;
};

window.generateCircleCoords = generateCircleCoords;

})();