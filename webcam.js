var video = document.getElementById("videoElement");
var outPut = document.getElementById("outPut0");

var cvLoaded = false;
var camResCalibrated = false;
var fgbg = null;
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
            try {
              processFrame(canvas);
            } catch {
              console.log("An error occurred!");
              location.reload();
            }
        }, 100);
      }
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
}

function onOpenCvReady() {
  cv['onRuntimeInitialized'] = () => {
    document.body.classList.remove("loading");
    cvLoaded = true;
    fgbg = new cv.BackgroundSubtractorMOG2(500, 16, true);
    console.log("loaded. \'for real\'")
  }
}

function processFrame(frame) {
    if (cvLoaded) {
        frame = cv.imread(frame);

        var gausFrame = frame.clone();
        var bgSubFrame = frame.clone();
        //var inRangeFrame = frame.clone();

        // Resizing does nothing as far as I can tell - very confusing
        //cv.resize(frame, dest, dest.size(), 0, 0, cv.INTER_LINEAR);

        canny(frame);
        cv.imshow("outPut0", frame);

        adptGaus(gausFrame);
        cv.imshow("outPut1", gausFrame);

        bgSubFrame = bgSub(bgSubFrame);
        cv.imshow("outPut2", bgSubFrame);

        // This makes the program fail after a little while of use
        // memory leak?
        //redTrack(inRangeFrame);
        //cv.imshow("outPut3", inRangeFrame);
    }
}

function canny(frame) {
    cv.cvtColor(frame, frame, cv.COLOR_RGB2GRAY, 0);
    cv.Canny(frame, frame, 50, 100, 3, false);
}

function adptGaus(frame) {
  cv.cvtColor(frame, frame, cv.COLOR_RGB2GRAY, 0);
  cv.adaptiveThreshold(frame, frame, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 3, 2);
}

function bgSub(frame) {
  let fgmask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  fgbg.apply(frame, fgmask);
  return fgmask;
}

function redTrack(frame) {
  let lowerColor = [100, 100, 20, 0];
  let upperColor = [200, 200, 255, 255];
  let lowerMat = new cv.Mat(frame.rows, frame.cols, frame.type(), lowerColor);
  let upperMat = new cv.Mat(frame.rows, frame.cols, frame.type(), upperColor);
  cv.inRange(frame, lowerMat, upperMat, frame);
}

function calibrateCamRes(videoTrack) {
    var capSettings = videoTrack.getSettings();
    width = capSettings.width;
    height = capSettings.height;
    camResCalibrated = true;
}