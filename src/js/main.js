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

navigator.getUserMedia = (function(){
  return  navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;
})();


///////////////////////////////////////////////////////////////////////////////
// Audio
///////////////////////////////////////////////////////////////////////////////
var actx = new AudioContext();
var freqs = [220, 440, 880, 1760]; //[177, 179, 188, 190]  [301, 308, 327, 580]
var pulses = [];
var pulseLength = 1000;
var sampleCoords = [
	[220, 100],
	[220, 300],
	[420, 300],
	[420, 100]
];


///////////////////////////////////////////////////////////////////////////////
// Video
///////////////////////////////////////////////////////////////////////////////
var elem = {
	canvas : document.getElementById('mainCanvas'),
	media : document.createElement('video'),
	playBtn : document.getElementById('playToggle'),
	inputChimeA : document.getElementById('inputChimeA'),
	inputChimeB : document.getElementById('inputChimeB'),
	inputChimeC : document.getElementById('inputChimeC'),
	inputChimeD : document.getElementById('inputChimeD'),
	inputPulseLength : document.getElementById('inputPulseLength')
};
var vctx = elem.canvas.getContext('2d');


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
        o.pulse(0, pulseLength);
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
    clear(vctx);
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



var updateChime = function (pos, value) {
	if (pos < 0 || pos >= freqs.length) return;
	freqs[pos] = value;
};
var updatePulseLength = function (value) {
	pulseLength = value;
};


var updateChimeAListener = function (e) {
	updateChime(0, this.value);
};
var updateChimeBListener = function (e) {
	updateChime(1, this.value);
};
var updateChimeCListener = function (e) {
	updateChime(2, this.value);
};
var updateChimeDListener = function (e) {
	updateChime(3, this.value);
};
var updatePulseLengthListener = function (e) {
	updatePulseLength(this.value);
};

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

// elem.media.src = 'images/SampleVideo_1280x720_10mb.mp4';

elem.playBtn.addEventListener('click', togglePlayback);
elem.inputChimeA.addEventListener('change', updateChimeAListener);
elem.inputChimeB.addEventListener('change', updateChimeBListener);
elem.inputChimeC.addEventListener('change', updateChimeCListener);
elem.inputChimeD.addEventListener('change', updateChimeDListener);
elem.inputPulseLength.addEventListener('change', updatePulseLengthListener);
window.elem = elem;

})();