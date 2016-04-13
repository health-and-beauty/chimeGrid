(function(){ 'use strict';


// Utils
var remapRange = function (val, origRange, newRange) {
	return ((newRange[1]-newRange[0]) * (val - origRange[0])) / (origRange[1] - origRange[0]);
};

// Audio
window.AudioContext = (function(){
  return  window.AudioContext ||
          window.webkitAudioContext;
})();

var actx = new AudioContext();
var freqs = [110, 220, 440, 880, 1760];
var notes = [];
for (var i = 0; i < freqs.length; i++) {
	notes.push(new Oscillator(actx, freqs[i], 'sine'));
}


// Video
var elem = {
	canvas : document.getElementById('mainCanvas'),
	media : document.getElementById('mainVideo')
};
var vctx = elem.canvas.getContext('2d');

var getCoordBrightness = function (context, x, y) {
	var imgData = context.getImageData(x, y ,1, 1);
	return (imgData.data[0] + imgData.data[1] + imgData.data[2]) / 3;
};

var getNoteFromBrightness = function (brightness) {
	var rangeColor = [0, 255];
	var rangeNotes = [0, (freqs.length - 1)];
	var note = Math.round(remapRange(brightness, rangeColor, rangeNotes));
	return note;
};

// var renderPulse = function (note) {
// 	if (typeof(note) === 'number' && note >= 0) {
// 		var xoffset = note * 100;
// 		vctx.save();
// 		vctx.rect(xoffset, 20, 50, 50);
// 		vctx.fill();
// 		vctx.restore();
// 	}
// };

var square = function (w, h) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = w;
	canvas.height = h;
	ctx.rect(0, 0, w, h);
	ctx.fill();
	return canvas;
};

var renderPulse = function (note) {
	if (typeof(note) === 'number' && note >= 0) {
		var xoffset = note * 100;
		vctx.drawImage(square(50,50), xoffset, 20);
	}
};


var sampleGrid = function (x, y) {
	var brightness = getCoordBrightness(vctx, x, y);
	var note = getNoteFromBrightness(brightness);
	var o = new Oscillator(actx, freqs[note], 'triangle');
	o.pulse(0, 500);
	//notes[note].pulse(0, 10);
	renderPulse(note);
};

var mediaCanPlay = function () {
	if (!elem.media.paused) {
		return;
	}
	elem.canvas.width = elem.media.videoWidth;
	elem.canvas.height = elem.media.videoHeight;
	elem.media.play();
};


var drawVideo = function () {
	vctx.save();
	vctx.translate(elem.canvas.width, 0);
	vctx.scale(-1, 1);
	vctx.drawImage(elem.media, 0, 0);
	vctx.restore();
};


var update = function () {
	if (elem.media.paused) {
		return;
	}
	vctx.clearRect(0, 0, elem.canvas.width, elem.canvas.height);
	drawVideo();
	sampleGrid(20, 220);
	sampleGrid(220, 220);
	sampleGrid(420, 220);
	sampleGrid(620, 220);
};

elem.media.oncanplay = mediaCanPlay;
var refresher = new Refresher(update, 1000);
refresher.start();







// Webcam
navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

var hdConstraints = {
  video: {
    mandatory: {
      minWidth: 1280,
      minHeight: 720
    }
  },
  audio: false
};

var vgaConstraints = {
  video: {
    mandatory: {
      maxWidth: 640,
      maxHeight: 360
    }
  },
  audio : false
};

var errorCallback = function () {alert('sorry bub');};

if (navigator.getUserMedia) {
  navigator.getUserMedia(vgaConstraints, function(stream) {
    elem.media.src = window.URL.createObjectURL(stream);
  }, errorCallback);
} else {
  elem.media.src = 'somevideo.webm'; // fallback.
}



})();