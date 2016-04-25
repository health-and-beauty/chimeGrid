// Requires Sequencer, Oscillator & getFrequency

// AudioContext Shim
window.AudioContext = (function(){
  return  window.AudioContext ||
          window.webkitAudioContext;
})();

var ctx = new AudioContext();
var sq = new Sequencer(ctx);

// Create scale of octaves
sq.addOscillator(55, 'sine');
sq.addOscillator(110, 'sine');
sq.addOscillator(220, 'sine');
sq.addOscillator(440, 'sine');
sq.addOscillator(880, 'sine');
sq.addOscillator(1760, 'sine');

var sequenceA = [
    [2, 1000]
];
var sequenceB = [
    [0, 80],
    [1, 80],
    [2, 80],
    [3, 80],
    [4, 80],
    [3, 80],
    [2, 80],
    [1, 80],
    [0, 80]
];


var sq2 = new Sequencer(ctx);
// Create C major scale
sq2.addOscillator(getFrequency("C4"), 'triangle');
sq2.addOscillator(getFrequency("D4"), 'triangle');
sq2.addOscillator(getFrequency("E4"), 'triangle');
sq2.addOscillator(getFrequency("F4"), 'triangle');
sq2.addOscillator(getFrequency("G4"), 'triangle');
sq2.addOscillator(getFrequency("A4"), 'triangle');
sq2.addOscillator(getFrequency("B4"), 'triangle');
sq2.addOscillator(getFrequency("C5"), 'triangle');

// Fun "retro" sound
var sequenceC = [
    [[0, 2, 4], 100],
    [[0, 2, 4], 100],
    [[0, 2, 4], 100],
    [[1, 3, 6], 100],
    [[1, 3, 6], 100],
    [[1, 3, 6], 100],
    [[2, 4, 7], 100],
    [[2, 4, 7], 100],
    [[2, 4, 7], 500]
];

// "Mary Had a Little Lamb" (with grand finale)
var sequenceD = [
    [2, 300],
    [1, 300],
    [0, 300],
    [1, 300],
    [2, 300],
    [2, 300],
    [2, 450],
    [1, 300],
    [1, 300],
    [1, 450],
    [2, 300],
    [4, 300],
    [4, 450],
    [2, 300],
    [1, 300],
    [0, 300],
    [1, 300],
    [2, 300],
    [2, 300],
    [2, 300],
    [2, 300],
    [1, 300],
    [1, 300],
    [2, 300],
    [1, 300],
    [[0], 30],
    [[0, 2], 30],
    [[0, 2, 4], 30],
    [[0, 2, 4, 7], 1000]
];


// Gather Elements
var elem = {
    btn1 : document.getElementById('btn1'),
    btn2 : document.getElementById('btn2'),
    btn3 : document.getElementById('btn3'),
    btn4 : document.getElementById('btn4'),
    txt1 : document.getElementById('txt1')
};

// Bind Elements
elem.btn1.addEventListener('click', function(){
    sq.play(sequenceA);
});
elem.btn2.addEventListener('click', function(){
    sq.play(sequenceB);
});
elem.btn3.addEventListener('click', function(){
    sq2.play(sequenceC);
});
elem.btn4.addEventListener('click', function(){
    var customSequence = JSON.parse(elem.txt1.value);
    sq2.play(customSequence);
});

// Add Default Sequence to textarea
elem.txt1.value = JSON.stringify(sequenceD, null, 2);
