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
navigator.getUserMedia = (function(){
  return  navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;
})();


///////////////////////////////////////////////////////////////////////////////
// Audio
///////////////////////////////////////////////////////////////////////////////
var pulseLength = 100;
var refreshRate = 100;
var THRESHHOLD = 20;

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
// var triggers = [
//     {point: [100, 100], freq: getFrequency('A3'), brightness: undefined, active: 0},
//     {point: [150, 100], freq: getFrequency('C4'), brightness: undefined, active: 0},
//     {point: [200, 100], freq: getFrequency('E4'), brightness: undefined, active: 0},
//     {point: [250, 100], freq: getFrequency('A4'), brightness: undefined, active: 0},
//     {point: [300, 100], freq: getFrequency('C5'), brightness: undefined, active: 0},
//     {point: [350, 100], freq: getFrequency('E5'), brightness: undefined, active: 0},
// ];

var points = generateCircleCoords(200, 300, 300, 12);
var points2 = generateCircleCoords(100, 300, 300, 12);
var triggers = [
    {point: points[0], note: 'E1', brightness: undefined, active: 0},
    {point: points[1], note: 'A2', brightness: undefined, active: 0},
    {point: points[2], note: 'C2', brightness: undefined, active: 0},
    {point: points[3], note: 'E2', brightness: undefined, active: 0},
    {point: points[4], note: 'A2', brightness: undefined, active: 0},
    {point: points[5], note: 'C3', brightness: undefined, active: 0},
    {point: points[6], note: 'E3', brightness: undefined, active: 0},
    {point: points[7], note: 'A3', brightness: undefined, active: 0},
    {point: points[8], note: 'C4', brightness: undefined, active: 0},
    {point: points[9], note: 'E4', brightness: undefined, active: 0},
    {point: points[10], note: 'A4', brightness: undefined, active: 0},
    {point: points[11], note: 'C5', brightness: undefined, active: 0},
];

var elems = {
	canvas : document.getElementById('mainCanvas'),
	media : document.createElement('video'),
	playBtn : document.getElementById('playToggle'),
    inputSelectMidiOutputs : document.getElementById("inputSelectMidiOutputs"),
	inputPulseLength : document.getElementById('inputPulseLength'),
  inputRefreshRate : document.getElementById('inputRefreshRate'),
  inputThreshhold : document.getElementById('inputThreshhold'),
  inputs: []
};
var vctx = elems.canvas.getContext('2d');


var midi_devices_available = [];
var midi_device_name;
var midi_output;

// MIDI Init
WebMidi.enable(function (err) {
    if (err) {
        console.error("WebMIDI failed to load.");
        return;
    }
    webmidi_init();
});

var webmidi_init = function () {
    WebMidi.outputs.forEach(function(output){
        midi_devices_available.push(output.name);
    });
    update_midi_select(midi_devices_available);
};

var webmidi_update_output = function (midi_device_name) {
    // midi_device_name = "IAC Driver Bus 1";
    console.log("Setting MIDI output to " + "\""+midi_device_name+"\"");
    midi_output = WebMidi.getOutputByName(midi_device_name);
};

///////////////////////////////////////////////////////////////////////////////
// Video
///////////////////////////////////////////////////////////////////////////////
var sampleCoord = function (trigger) {
    var tx = trigger.point[0];
    var ty = trigger.point[1];
    var tb = trigger.brightness;
    var tnote = trigger.note;
	var b = getCoordBrightness(vctx, tx, ty);
    var threshhold = THRESHHOLD;
    var bdiff = Math.abs(tb - b);

    if (tb !== undefined && bdiff > threshhold && midi_output) {
        trigger.active++;
        midi_output.playNote(tnote, "all", {duration: pulseLength, velocity: 1/trigger.active});
        setTimeout(
            (function (trigger) {
                return function () {
                    trigger.active--;
                };
            })(trigger),
            pulseLength
        );
    }
    trigger.brightness = b;
    var size = 30 * (trigger.active + 1);
    var thickness = 430 / (trigger.active + 1) || 1;
    var opacity = 1/trigger.active;
    var color = (trigger.active) ? 'rgba(255,255,255,'+opacity+')' : 'rgba(255, 255, 255, 0.2)';
    vctx.drawImage(crosshair(size, size, color, thickness), tx-(size/2), ty-(size/2));
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
  elems.media.src = 'somevideo.webm'; // video fallback.
}


var createInputElem = function (value, min, max, step) {
    var elem = document.createElement('input');
    elem.type = 'number';
    elem.value = value || 50;
    elem.min = min || 50;
    elem.max = max || 1000;
    elem.step = step || 1;
    return elem;
};





/**
 * Updates select UI for choosing MIDI output device
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
var update_midi_select = function (options) {
    var option_elem = document.createElement("option");
    option_elem.text = 'None';
    option_elem.selected = true;
    elems.inputSelectMidiOutputs.add(option_elem);

    options.forEach(function(option){
        var option_elem = document.createElement("option");
        option_elem.text = option;
        option_elem.value = option;
        elems.inputSelectMidiOutputs.add(option_elem);
    });
};





// Generate Inputs for each note
var inputsContainer = document.getElementById('chimeInputs');
triggers.forEach(function(trigger){
    var note = trigger.note;
    var elem = createInputElem(note);
    inputsContainer.appendChild(elem);
    // elem.addEventListener('change', function(){
    //     trigger.note = this.value;
    // });
    elems.inputs.push(elem);
});

elems.media.oncanplay = init;
var refresher = new Refresher(update, refreshRate);
refresher.start();


elems.inputSelectMidiOutputs.addEventListener('change', function (e) {
    webmidi_update_output(event.target.value);
});
elems.playBtn.addEventListener('click', togglePlayback);
elems.inputPulseLength.addEventListener('change', function (e) {
    pulseLength = this.value;
});
elems.inputRefreshRate.addEventListener('change', function (e) {
    refreshRate = this.value;
    refresher.setFreq(refreshRate);
});
elems.inputThreshhold.addEventListener('change', function (e) {
    THRESHHOLD = this.value;
});

})();