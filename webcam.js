var video = document.querySelector("#videoElement");
var outPut = document.querySelector("#outPut");

var cvLoaded = false;
var camResCalibrated = false;
var width = 340;
var height = 240;

document.body.classList.add("loading");


if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;

      // Take individual frames and process them
      videoTrack = stream.getVideoTracks()[0];
      var capDevice = new ImageCapture(videoTrack);
      var frame;
      if (capDevice) {
        frame = setInterval(() => {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            if (!camResCalibrated) {
                calibrateCamRes(videoTrack);
            }
            canvas.getContext('2d').drawImage(video, 0, 0, width, height);
            processFrame(canvas);
        }, 100);
      }
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
}

function onOpenCvReady() {
    document.body.classList.remove("loading");
    cvLoaded = true;
    console.log("loaded.")
}

function processFrame(frame) {
    if (cvLoaded) {
        frame = cv.imread(frame);

        canny(frame);

        // Resizing does nothing as far as I can tell - very confusing
        //cv.resize(frame, dest, dest.size(), 0, 0, cv.INTER_LINEAR);

        cv.imshow("outPut", frame);
    }
}

function canny(frame) {
    cv.cvtColor(frame, frame, cv.COLOR_RGB2GRAY, 0);
    cv.Canny(frame, frame, 50, 100, 3, false);
}

function calibrateCamRes(videoTrack) {
    var capSettings = videoTrack.getSettings();
    width = capSettings.width;
    height = capSettings.height;
}