var cnv;
var srcImg;
var tempImg;
var defaultImg = "papi.jpg";
var imgWidth;
var imgHeight;
var lastindex;
var button;
var sigmaSlider;


var kernelsize = 1; 
var kernelwidth = Math.floor(kernelsize/2);
var sigma = 20;
var weightmatrix = [];

//-------------------------------------------------------------------//

function blur(x_, y_) {
  var twoSigma_ = 2*sigma*sigma;
  if (x_ === 0 && y_ === 0) {
    return 1/(PI*twoSigma_);
  } else {
    var sum = x_*x_ + y_*y_;
    return (1/(PI*twoSigma_))*Math.exp(-sum/(twoSigma_));
  }
}

function createWM() {
  var sum = 0;
  for (var i = 0; i < kernelsize; i++) {
    weightmatrix[i] = [];
    for (var j = 0; j <= i; j++) {
      var val = blur(j - kernelwidth, kernelwidth - i);
      if (i !== j) {
        weightmatrix[i][j] = val;
        weightmatrix[j][i] = val;
        sum += 2*val;
      } else {
        weightmatrix[i][j] = val;
        sum += val;
      }
    }
  }
  for (var i = 0; i < kernelsize; i++) {
    for (var j = 0; j < kernelsize; j++) {
      weightmatrix[i][j] /= sum;
    }
  }
}

function centerCanvas() {
  var cenX = (windowWidth - cnv.width) / 2;
  var cenY = (windowHeight - cnv.height) / 2 ;
  cnv.position(cenX, cenY);
  button.position(cnv.x + srcImg.width + windowWidth/20, cnv.y + srcImg.height/2);
}

function gotFile(file) {
  if (file.type === 'image') {
    srcImg = loadImage(file.data);
    setTimeout( function () {
      if (1 == 1) {
        tempImg = srcImg;
        imgWidth = srcImg.width;
        imgHeight = srcImg.height;
        lastindex = (imgWidth-1) + (imgHeight-1)*imgWidth;
        resizeCanvas(srcImg.width, srcImg.height);
        centerCanvas();
        performBlur();
        //save(srcImg, file.name.split(".")[0] + " blurred.jpg");
      }
    }
    , 
      55);
  } else {
    createP("Please enter a valid image!");
  }
}

function gaussianBlur() {
  var trueWidth = imgWidth - 1;
  var trueHeight = imgHeight - 1;
  for (var x = 0; x < imgWidth; x++) {
    for (var y = 0; y < imgHeight; y++) {
      var loc = 4 * (y * imgWidth + x);
      var sumR = 0;
      var sumG = 0;
      var sumB = 0;
      var sumA = 0;

      for (var i = 0; i < kernelsize; i++) {
        for (var j = 0; j < kernelsize; j++) {
          var curX = x-kernelwidth+j;
          var curY = y-kernelwidth+i;
          var pixelOffscreen = curX < 0 || curY <0 || curX > trueWidth || curY > trueHeight;
          var matrixVal = weightmatrix[i][j];
          var curColor;
          if (pixelOffscreen) {
            curColor = loc;
          } else {
            curColor = loc - 4 * (imgWidth*(kernelwidth-i) + kernelwidth - j);
          }
          sumR += matrixVal*pixels[curColor];
          sumG += matrixVal*pixels[curColor+1];
          sumB += matrixVal*pixels[curColor+2];
          sumA += matrixVal*pixels[curColor+3];
        }
      }
      pixels[loc] = sumR;
      pixels[loc+1] = sumG;
      pixels[loc+2] = sumB;
      pixels[loc+3] = sumA;
    }
  }
}

function performBlur() {
  clear();
  image(tempImg, 0, 0);
  loadPixels();
  gaussianBlur();
  updatePixels();
}

function sigmaSliderHandler() {
  sigma = sigmaSlider.value();
  createWM();
  performBlur();
  console.log("sigma: " + sigma);
}

function kernelSliderHandler() {
  kernelsize = kernelSlider.value();
  var kernelwidth = Math.floor(kernelsize/2);
  createWM();
  performBlur();
  console.log("kernel: " + kernelsize);
}

//---------------------------------------------------------------------------------------//

function preload() {
  srcImg = loadImage(defaultImg);
  tempImg = srcImg;
}

function setup () {
  cnv = createCanvas(srcImg.width, srcImg.height);
  button = createFileInput(gotFile);
  sigmaSlider = createSlider(1, 15, 1, 0.5);
  kernelSlider = createSlider(1, 21, 1, 2);
  sigmaSlider.changed(sigmaSliderHandler);
  kernelSlider.changed(kernelSliderHandler);
  centerCanvas();

  pixelDensity(1);
  imgWidth = srcImg.width;
  imgHeight = srcImg.height;
  lastindex = (imgWidth-1) + (imgHeight-1)*imgWidth;
  createWM();
  noLoop();

  performBlur();
}

function draw() {
  //image(tempImg, 0, 0);
  //loadPixels();
  //gaussianBlur();
  //updatePixels();
}

function windowResized() {
  centerCanvas();
}
