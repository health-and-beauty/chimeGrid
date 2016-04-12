// Utils
//        (b-a)(x - min)
// f(x) = --------------  + a
//           max - min

var remapRange = function (val, oMin, oMax, nMin, nMax) {
	return ((nMax-nMin) * (val - oMin)) / (oMax - oMin);
};

// Audio
window.AudioContext = (function(){
  return  window.AudioContext ||
          window.webkitAudioContext;
})();

var actx = new AudioContext();
var notes = [];
notes.push(new Oscillator(actx, 55, 'sine'));
notes.push(new Oscillator(actx, 110, 'sine'));
notes.push(new Oscillator(actx, 220, 'sine'));
notes.push(new Oscillator(actx, 440, 'sine'));
notes.push(new Oscillator(actx, 880, 'sine'));
notes.push(new Oscillator(actx, 1760, 'sine'));


// Video
var dom = {
	canvas : document.getElementById('mainCanvas'),
	media : document.getElementById('mainVideo')
};
var vctx = dom.canvas.getContext('2d');

var getGridColor = function (context, x, y) {
	var imgData = context.getImageData(x, y ,1, 1);
	//console.log(imgData.data);
	var val = (imgData.data[0] + imgData.data[1] + imgData.data[2]) / 3;
	var note = Math.round(remapRange(val, 0, 255, 0, (notes.length - 1)));

	notes[note].pulse(0, 10);

	if (note === 0) {
		vctx.rect(20,20,50,50);
		vctx.fill();
	}
	if (note === 1) {
		vctx.rect(120,20,50,50);
		vctx.fill();
	}
	if (note === 2) {
		vctx.rect(220,20,50,50);
		vctx.fill();
	}
	if (note === 3) {
		vctx.rect(320,20,50,50);
		vctx.fill();
	}
	if (note === 4) {
		vctx.rect(420,20,50,50);
		vctx.fill();
	}
	if (note === 5) {
		vctx.rect(520,20,50,50);
		vctx.fill();
	}
};

var mediaCanPlay = function () {
	dom.canvas.width = dom.media.videoWidth;
	dom.canvas.height = dom.media.videoHeight;
	vctx.translate(dom.canvas.width, 0);
	vctx.scale(-1, 1);
	vctx.drawImage(dom.media, 0, 0);
};

var mediaTimeupdate = function () {
	if (dom.media.paused) {
		return;
	}
	vctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
	vctx.drawImage(dom.media, 0, 0);
	getGridColor(vctx, 20, 20);
	getGridColor(vctx, 220, 220);
	getGridColor(vctx, 420, 420);
	getGridColor(vctx, 620, 620);
};

dom.media.oncanplay = mediaCanPlay;

var refreshA = new Refresher(mediaTimeupdate, 100);
refreshA.start();








var errorCallback = function () {alert('sorry bub');};

navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

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

if (navigator.getUserMedia) {
  navigator.getUserMedia(vgaConstraints, function(stream) {
    dom.media.src = window.URL.createObjectURL(stream);
  }, errorCallback);
} else {
  dom.media.src = 'somevideo.webm'; // fallback.
}