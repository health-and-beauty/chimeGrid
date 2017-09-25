
// Render
var clear = function (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

var square = function (w, h, brightness) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = 'rgb('+brightness+','+brightness+','+brightness+')';
    ctx.rect(0, 0, w, h);
    ctx.fill();
    return canvas;
};

var crosshair = function (w, h, color) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = w;
    canvas.height = h;
    color = color || 'red';

    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(canvas.width/2, 0);
    ctx.rect(0, 0, 1, w);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(0, canvas.height/2);
    ctx.rect(0, 0, h, 1);
    ctx.fill();
    ctx.restore();
    return canvas;
};


// Data
var getCoordBrightness = function (context, x, y) {
    var imgData = context.getImageData(x, y ,1, 1);
    return (imgData.data[0] + imgData.data[1] + imgData.data[2]) / 3;
};
