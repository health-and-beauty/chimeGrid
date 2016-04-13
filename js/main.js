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
var freqs = [220, 440, 880, 1760];
var pulses = [];
var sampleCoords = [
	[20, 220],
	[220, 220],
	[420, 220],
	[620, 220]
];

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


var sampleCoord = function (i) {
    var x = sampleCoords[i][0];
    var y = sampleCoords[i][1];
	var brightness = getCoordBrightness(vctx, x, y);
	var note = getNoteFromBrightness(brightness);

    if (pulses[i] === undefined || pulses[i] !== note) {
        var o = new Oscillator(actx, freqs[note], 'sine');
        o.pulse(0, 100);
        pulses[i] = note;
    }
    renderPulse(note);
	vctx.drawImage(crosshair(50, 50), x-25, y-25);
};


var togglePlayback = function () {
	if (!elem.media.paused) {
		elem.media.pause()
	} else {
		elem.media.play();
	}
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
	sampleCoords.forEach(function(element, i){sampleCoord(i);});
};

var init = function () {
	if (!elem.media.paused) {
		return;
	}
	elem.canvas.width = elem.media.videoWidth;
	elem.canvas.height = elem.media.videoHeight;
};

elem.media.oncanplay = init;
var refresher = new Refresher(update, 0);
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

elem.playBtn.addEventListener('click', togglePlayback);
window.elem = elem;

})();