// @ https://gist.github.com/stuartmemo/3766449
var getFrequency = function (note) {
    var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
        octave,
        keyNumber;

    if (note.length === 3) {
        octave = note.charAt(2);
    } else {
        octave = note.charAt(1);
    }

    keyNumber = notes.indexOf(note.slice(0, -1));

    if (keyNumber < 3) {
        keyNumber = keyNumber + 12 + ((octave - 1) * 12) + 1;
    } else {
        keyNumber = keyNumber + ((octave - 1) * 12) + 1;
    }

    // Return frequency of note
    return 440 * Math.pow(2, (keyNumber - 49) / 12);
};


// Produces an HTML5 Oscillator for a given AudioContext obj
var Oscillator = function (ctx, freq, type) {
    this.ctx = ctx;
    this.osc = this.ctx.createOscillator();
    this.osc.type = type || 'sine';
    this.osc.frequency.value = freq || 440;
    this.osc.start(0);
    this.volume = this.ctx.createGain();
    this.volume.gain.value = 0;
    this.osc.connect(this.volume);
    this.volume.connect(this.ctx.destination);
};

Oscillator.prototype.setFreq = function (freq) {
    this.osc.frequency.value = freq || 440;
};

Oscillator.prototype.setType = function (type) {
    this.osc.type = type || 'sine';
};

Oscillator.prototype.play = function () {
    this.volume.gain.value = 1;
};

Oscillator.prototype.stop = function () {
    this.volume.gain.value = 0;
};

Oscillator.prototype.pulse = function(start, length, startCallback, endCallback) {
    var self = this;
    setTimeout(function(){
        if (typeof startCallback === 'function') startCallback();
        self.play();
        setTimeout(function(){if (typeof endCallback === 'function') endCallback();
;self.stop();self.volume.disconnect();self.osc=undefined;}, length || 100);
    }, start || 0);
};



// Requires "Oscillator" class
// Note: "spacer" required between notes to avoid collisions when playing same
//       note repeatedly
var Sequencer = function (ctx) {
    this.ctx = ctx;
    this.scale = [];
};

Sequencer.prototype.addOscillator = function (freq, type) {
    this.scale.push(new Oscillator(this.ctx, freq || 440, type || 'sine'));
};

Sequencer.prototype.play = function (sequence) {
    var timePassed = 0,
        spacer = 20,
        i,
        ii,
        note,
        delay;
    for (i = 0; i < sequence.length; i++) {
        note = sequence[i][0];
        delay = sequence[i][1];

        // Chord
        if (Array.isArray(note)) {
            for (ii = 0; ii < note.length; ii++) {
                if (this.scale[note[ii]] !== undefined) {
                    this.scale[note[ii]].pulse(timePassed, delay-spacer);
                }
            }
        }
        else
        // Single Note
        if (this.scale[note] !== undefined) {
            this.scale[note].pulse(timePassed, delay-spacer);
        }
        timePassed = timePassed + delay;
    }
};