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
var pulseLength = 100;

// [220, 440, 880, 1760]  [177, 179, 188, 190]  [301, 308, 327, 580]
// var triggers = [
//     {point: [220, 200], freq: 220, brightness: undefined, active: false},
//     {point: [220, 300], freq: 330, brightness: undefined, active: false},
//     {point: [220, 400], freq: 440, brightness: undefined, active: false},
//     {point: [420, 400], freq: 880, brightness: undefined, active: false},
//     {point: [420, 200], freq: 1760, brightness: undefined, active: false},
// ];

// var triggers = [
//     {point: [100, 100], freq: getFrequency('A3'), brightness: undefined, active: false},
//     {point: [150, 100], freq: getFrequency('B3'), brightness: undefined, active: false},
//     {point: [200, 100], freq: getFrequency('C4'), brightness: undefined, active: false},
//     {point: [250, 100], freq: getFrequency('D4'), brightness: undefined, active: false},
//     {point: [300, 100], freq: getFrequency('E4'), brightness: undefined, active: false},
//     {point: [350, 100], freq: getFrequency('F4'), brightness: undefined, active: false},
//     {point: [400, 100], freq: getFrequency('G4'), brightness: undefined, active: false},
// ];

// A minor scale
var triggers = [
    {point: [100, 100], freq: getFrequency('A3'), brightness: undefined, active: false},
    {point: [150, 100], freq: getFrequency('C4'), brightness: undefined, active: false},
    {point: [200, 100], freq: getFrequency('E4'), brightness: undefined, active: false},
    {point: [250, 100], freq: getFrequency('A4'), brightness: undefined, active: false},
    {point: [300, 100], freq: getFrequency('C5'), brightness: undefined, active: false},
    {point: [350, 100], freq: getFrequency('E5'), brightness: undefined, active: false},
];


///////////////////////////////////////////////////////////////////////////////
// Video
///////////////////////////////////////////////////////////////////////////////
var elems = {
	canvas : document.getElementById('mainCanvas'),
	media : document.createElement('video'),
	playBtn : document.getElementById('playToggle'),
	inputPulseLength : document.getElementById('inputPulseLength'),
    inputs: []
};
var vctx = elems.canvas.getContext('2d');



var sampleCoord = function (trigger) {
    var tx = trigger.point[0];
    var ty = trigger.point[1];
    var tb = trigger.brightness;
    var tfreq = trigger.freq;
	var b = getCoordBrightness(vctx, tx, ty);
    var threshhold = 20;
    var bdiff = Math.abs(tb - b);

    if (tb !== undefined && bdiff > threshhold && trigger.active === false) {
        var o = new Oscillator(actx, tfreq, 'sine');
        trigger.active = true;
        o.pulse(0, pulseLength, false, function(){trigger.active = false});
    }
    trigger.brightness = b;

    var color = (trigger.active) ? 'white' : 'red';
	vctx.drawImage(crosshair(40, 40, color), tx-20, ty-20);
};


var togglePlayback = function () {
	if (!elems.media.paused) {
		elems.media.pause()
	} else {
		elems.media.play();
	}
};


var drawVideo = function () {
	vctx.save();
	vctx.translate(elems.canvas.width, 0);
	vctx.scale(-1, 1);
	vctx.drawImage(elems.media, 0, 0);
	vctx.restore();
};


var update = function () {
	if (elems.media.paused) {
		return;
	}
    clear(vctx);
	drawVideo();
	triggers.forEach(function(trigger){sampleCoord(trigger);});
};


var init = function () {
	if (!elems.media.paused) {
		return;
	}
	elems.canvas.width = elems.media.videoWidth;
	elems.canvas.height = elems.media.videoHeight;
};


///////////////////////////////////////////////////////////////////////////////
// Webcam
///////////////////////////////////////////////////////////////////////////////
var webcamConstraints = {
  video: {
    width: 600,
    height: 600
  },
  audio : false
};


var errorCallback = function () {alert('sorry bub');};

if (navigator.getUserMedia) {
  navigator.getUserMedia(webcamConstraints, function(stream) {
    elems.media.src = window.URL.createObjectURL(stream);
  }, errorCallback);
} else {
  elems.media.src = 'somevideo.webm'; // fallback.
}

// elems.media.src = 'images/SampleVideo_1280x720_10mb.mp4';

var createInputElem = function (value, min, max, step) {
    var elem = document.createElement('input');
    elem.type = 'number';
    elem.value = value || 50;
    elem.min = min || 50;
    elem.max = max || 1000;
    elem.step = step || 1;
    return elem;
};












// Generate Inputs for each note
var inputsContainer = document.getElementById('chimeInputs');
triggers.forEach(function(trigger){
    var freq = trigger.freq;
    var elem = createInputElem(freq);
    inputsContainer.appendChild(elem);
    elem.addEventListener('change', function(){
        trigger.freq = this.value;
    });
    elems.inputs.push(elem);
});

elems.media.oncanplay = init;
var refresher = new Refresher(update, 0);
refresher.start();


elems.playBtn.addEventListener('click', togglePlayback);
elems.inputPulseLength.addEventListener('change', function (e) {
    pulseLength = this.value;
});
window.elems = elems;

})();