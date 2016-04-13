(function(){ 'use strict';

///////////////////////////////////////////////////////////////////////////////
// Utils
///////////////////////////////////////////////////////////////////////////////
var remapRange = function (val, origRange, newRange) {
	return ((newRange[1]-newRange[0]) * (val - origRange[0])) / (origRange[1] - origRange[0]);
};



///////////////////////////////////////////////////////////////////////////////
// Shims 
///////////////////////////////////////////////////////////////////////////////
window.AudioContext = (function(){
  return  window.AudioContext ||
          window.webkitAudioContext;
})();

navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;



///////////////////////////////////////////////////////////////////////////////
// Audio
///////////////////////////////////////////////////////////////////////////////
var actx = new AudioContext();
var freqs = [110, 220, 440, 880, 1760];
var pulses = [];

///////////////////////////////////////////////////////////////////////////////
// Video
///////////////////////////////////////////////////////////////////////////////
var elem = {
	canvas : document.getElementById('mainCanvas'),
	media : document.createElement('video'),
	playBtn : document.getElementById('playToggle')
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
var getBrightnessFromNote = function (note) {
	var rangeColor = [0, 255];
	var rangeNotes = [0, (freqs.length - 1)];
	var brightness = Math.round(remapRange(note, rangeNotes, rangeColor));
	return brightness;
};

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

var crosshair = function (w, h) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = w;
	canvas.height = h;

	ctx.save();
	ctx.fillStyle = 'red';
	ctx.translate(canvas.width/2, 0);
	ctx.rect(0, 0, 1, w);
	ctx.fill();
	ctx.restore();

	ctx.save();
	ctx.fillStyle = 'red';
	ctx.translate(0, canvas.height/2);
	ctx.rect(0, 0, h, 1);
	ctx.fill();
	ctx.restore();
	return canvas;
};


var renderPulse = function (note) {
	if (typeof(note) === 'number' && note >= 0) {
		var xoffset = note * 100;
		var brightness = getBrightnessFromNote(note);
		vctx.drawImage(square(50, 50, brightness), xoffset, 20);
	}
};


var sampleGrid = function (x, y) {
	var brightness = getCoordBrightness(vctx, x, y);
	var note = getNoteFromBrightness(brightness);
	var o = new Oscillator(actx, freqs[note], 'triangle');
	o.pulse(0, 100);
	renderPulse(note);
	vctx.drawImage(crosshair(50, 50), x-25, y-25);
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
var refresher = new Refresher(update, 10);
refresher.start();






///////////////////////////////////////////////////////////////////////////////
// Webcam
///////////////////////////////////////////////////////////////////////////////
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

elem.playBtn.addEventListener('click', function(){if (!elem.media.paused) {elem.media.pause()} else {elem.media.play();}});
window.elem = elem;
})();