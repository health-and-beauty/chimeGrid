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