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

Oscillator.prototype.pulse = function(start, length) {
    var self = this;
    setTimeout(function(){
        self.play();
        setTimeout(function(){self.stop();self.volume.disconnect();self.osc=undefined;}, length || 100);
    }, start || 0);
};