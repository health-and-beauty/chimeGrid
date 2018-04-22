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
// MIDI
///////////////////////////////////////////////////////////////////////////////
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
var refreshTriggers = function (trigger) {
    var tx = trigger.point[0];
    var ty = trigger.point[1];
    var tb = trigger.brightness;
    var tc = trigger.channel || "all";
    var tnote = trigger.note;
	var b = getCoordBrightness(vctx, tx, ty);
    var threshhold = THRESHHOLD;
    var bdiff = Math.abs(tb - b);
    var max_velocity = 0.9;

    if (tb !== undefined && bdiff > threshhold && midi_output) {
        trigger.active++;
        midi_output.playNote(tnote, tc, {duration: PULSELENGTH, velocity: max_velocity/trigger.active});
        
        setTimeout(
            (function (trigger) {
                return function () { 
                    trigger.active--;
                };
            })(trigger),
            PULSELENGTH
        );
    }
    trigger.brightness = b;
    if (DISPLAY_TRIGGERS) {
        var size = 10 * (trigger.active + 1);
        // var thickness = 430 / (trigger.active + 1) || 1;
        var thickness = 10;
        var opacity = 1/trigger.active;
        var color = (trigger.active) ? 'rgba(255,255,255,'+opacity+')' : 'rgba(255, 255, 255, 0.2)';
        vctx.drawImage(crosshair(size, size, color, thickness), tx-(size/2), ty-(size/2));
    }
};

var update_toggle_buttons = function () {
    if (IS_PLAYING) {
        elems.playBtnSmall.classList.add('fa-pause');
        elems.playBtnSmall.classList.remove('fa-play');
    } else {
        elems.playBtnSmall.classList.remove('fa-pause');
        elems.playBtnSmall.classList.add('fa-play');
    }

    if (IS_MUTED) {
        elems.muteBtnSmall.classList.add('fa-volume-off');
        elems.muteBtnSmall.classList.remove('fa-volume-up');
    } else {
        elems.muteBtnSmall.classList.remove('fa-volume-off');
        elems.muteBtnSmall.classList.add('fa-volume-up');
    }
    
};


var togglePlayback = function () {
	if (!elems.media.paused) {
		elems.media.pause();
        IS_PLAYING = false;
	} else {
		elems.media.play();
        IS_PLAYING = true;
	}
    update_toggle_buttons();
};

var toggleMute = function () {
    if (!elems.media.muted) {
        elems.media.muted = true;
        IS_MUTED = true;
    } else {
        elems.media.muted = false;
        IS_MUTED = false;
    }
    update_toggle_buttons();
};

var toggleSettings = function () {
    if (!elems.settingsPanel.classList.contains('collapsed')) {
        elems.settingsPanel.classList.add('collapsed');
    } else {
        elems.settingsPanel.classList.remove('collapsed');
    }
};

var toggleFullscreen = function (element) {
    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

    if (requestMethod) { // Native full screen.
        requestMethod.call(element);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
};

var drawVideo = function () {
	vctx.save();
    if (FLIP_HORIZONTAL) {
        vctx.translate(elems.canvas.width, 0);
        vctx.scale(-1, 1);
    } else {
        vctx.translate(0, 0);
        vctx.scale(1, 1);
    }
	vctx.drawImage(elems.media, 0, 0);
	vctx.restore();
};


var update_canvas = function () {
	if (elems.media.paused) {
		return;
	}
    clear(vctx);
	drawVideo();
	triggers.forEach(function(trigger){refreshTriggers(trigger);});
};


var init_canvas = function () {
	if (!elems.media.paused) {
		return;
	}
	elems.canvas.width = elems.media.videoWidth;
	elems.canvas.height = elems.media.videoHeight;
};


///////////////////////////////////////////////////////////////////////////////
// Init Webcam
///////////////////////////////////////////////////////////////////////////////

var errorCallback = function () {
    alert('sorry bub');
};


var init_media_input =  function (video_url) {
    if (navigator.getUserMedia && !video_url) {
      navigator.getUserMedia(webcamConstraints, function(stream) {
        elems.media.src = window.URL.createObjectURL(stream);
      }, errorCallback);
    } else {
      elems.media.src = video_url;
      elems.media.muted = true;
    }
} 


var createInputNumberElem = function (value, min, max, step) {
    var elem = document.createElement('input');
    elem.type = 'number';
    elem.value = value || 50;
    elem.min = min || 50;
    elem.max = max || 1000;
    elem.step = step || 1;
    return elem;
};

var createInputTextElem = function (value) {
    var elem = document.createElement('input');
    elem.type = 'text';
    elem.value = value || '';
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




var IS_PLAYING = false;
var IS_MUTED = true;

var DISPLAY_TRIGGERS = true;
var PULSELENGTH = 100;
var REFRESHRATE = 100;
var THRESHHOLD = 20;
var FLIP_HORIZONTAL = false;

var points = generateCircleCoords(200, 300, 300, 12);
var points2 = generateCircleCoords(100, 300, 300, 12);
var triggers = [
    {point: points[0], note: 'E1', brightness: undefined, active: 0, channel: 1},
    {point: points[1], note: 'A2', brightness: undefined, active: 0, channel: 1},
    {point: points[2], note: 'C2', brightness: undefined, active: 0, channel: 1},
    {point: points[3], note: 'E2', brightness: undefined, active: 0, channel: 1},
    {point: points[4], note: 'A2', brightness: undefined, active: 0, channel: 1},
    {point: points[5], note: 'C3', brightness: undefined, active: 0, channel: 1},
    {point: points[6], note: 'E3', brightness: undefined, active: 0, channel: 1},
    {point: points[7], note: 'A3', brightness: undefined, active: 0, channel: 1},
    {point: points[8], note: 'C4', brightness: undefined, active: 0, channel: 1},
    {point: points[9], note: 'E4', brightness: undefined, active: 0, channel: 1},
    {point: points[10], note: 'A4', brightness: undefined, active: 0, channel: 1},
    {point: points[11], note: 'C5', brightness: undefined, active: 0, channel: 1},

    {point: points2[0], note: 'E1', brightness: undefined, active: 0, channel: 2},
    {point: points2[1], note: 'A2', brightness: undefined, active: 0, channel: 2},
    {point: points2[2], note: 'C2', brightness: undefined, active: 0, channel: 2},
    {point: points2[3], note: 'E2', brightness: undefined, active: 0, channel: 2},
    {point: points2[4], note: 'A2', brightness: undefined, active: 0, channel: 2},
    {point: points2[5], note: 'C3', brightness: undefined, active: 0, channel: 2},
    {point: points2[6], note: 'E3', brightness: undefined, active: 0, channel: 2},
    {point: points2[7], note: 'A3', brightness: undefined, active: 0, channel: 2},
    {point: points2[8], note: 'C4', brightness: undefined, active: 0, channel: 2},
    {point: points2[9], note: 'E4', brightness: undefined, active: 0, channel: 2},
    {point: points2[10], note: 'A4', brightness: undefined, active: 0, channel: 2},
    {point: points2[11], note: 'C5', brightness: undefined, active: 0, channel: 2},    
];

var elems = {
    canvas : document.getElementById('mainCanvas'),
    media : document.createElement('video'),
    playBtn : document.getElementById('playToggle'),
    muteBtn : document.getElementById('audioToggle'),
    playBtnSmall : document.querySelector('#playToggleSmall i'),
    muteBtnSmall : document.querySelector('#audioToggleSmall i'),
    settingsBtn : document.getElementById('settingsToggle'),
    fullscreenBtn : document.getElementById('fullscreenToggle'),
    settingsPanel : document.getElementById('settings'),
    inputSelectMediaInputs : document.getElementById("inputSelectMediaInputs"),
    inputSelectMidiOutputs : document.getElementById("inputSelectMidiOutputs"),
    inputPulseLength : document.getElementById('inputPulseLength'),
    inputRefreshRate : document.getElementById('inputRefreshRate'),
    inputThreshhold : document.getElementById('inputThreshhold'),
    inputs: []
};
var vctx = elems.canvas.getContext('2d');
var webcamConstraints = {
  video: {
    width: 600,
    height: 600
  },
  audio : false
};
var midi_devices_available = [];
var midi_device_name;
var midi_output;

// MIDI Init
WebMidi.enable(function (err) {
    if (err) {
        alert("WebMIDI failed to load. :(");
        console.error("WebMIDI failed to load.");
        return;
    }
    webmidi_init();
});


// Generate Inputs for each note
var inputsContainer = document.getElementById('chimeInputs');
triggers.forEach(function(trigger){
    var note = trigger.note;
    var elem = createInputTextElem(note);
    inputsContainer.appendChild(elem);
    elem.addEventListener('change', function(){
        trigger.note = this.value;
    });
    elems.inputs.push(elem);
});

elems.media.oncanplay = init_canvas;
var refresher = new Refresher(update_canvas, REFRESHRATE);
refresher.start();


elems.inputSelectMidiOutputs.addEventListener('change', function (e) {
    webmidi_update_output(event.target.value);
});

elems.inputSelectMediaInputs.addEventListener('change', function (e) {
    if (event.target.value == "webcam") {
        FLIP_HORIZONTAL = true;
        init_media_input();
    } else if (event.target.value == "videoA") {
        FLIP_HORIZONTAL = false;
        init_media_input('images/Insecure_Season_2_Official_Trailer__2017__HBO.mp4');
    }
});


// Event Listeners
// elems.playBtn.addEventListener('click', togglePlayback);
// elems.muteBtn.addEventListener('click', toggleMute);
elems.playBtnSmall.addEventListener('click', togglePlayback);
elems.muteBtnSmall.addEventListener('click', toggleMute);
elems.settingsBtn.addEventListener('click', toggleSettings);
elems.fullscreenBtn.addEventListener('click', function () { toggleFullscreen(document.body); } );

elems.inputPulseLength.addEventListener('change', function (e) {
    PULSELENGTH = this.value;
});
elems.inputRefreshRate.addEventListener('change', function (e) {
    REFRESHRATE = this.value;
    refresher.setFreq(REFRESHRATE);
});
elems.inputThreshhold.addEventListener('change', function (e) {
    THRESHHOLD = this.value;
});

})();