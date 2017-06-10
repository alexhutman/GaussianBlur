var cnv;
var srcImg;
var tempImg;
var defaultImg = "papi.jpg";
var imgWidth;
var imgHeight;
var lastindex;
var button;
var sigmaSlider;
var welcome;
var sigmaText;
var kernelText;
var equation;
var explanation;


var kernelsize = 1; 
var kernelwidth = Math.floor(kernelsize/2);
var sigma = 1;
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
  welcome.position(5, -13);
  explanation.position(welcome.x, welcome.y+windowHeight/20);
  equation.position(welcome.x, welcome.y+windowHeight/5);
  button.position(welcome.x+30, 9*windowHeight/20);
  sigmaSlider.position(20+button.x, button.y+windowHeight/20);
  sigmaText.position(sigmaSlider.x + 50, sigmaSlider.y+windowHeight/40);
  kernelSlider.position(sigmaSlider.x, sigmaSlider.y+windowHeight/10);
  kernelText.position(kernelSlider.x+29, kernelSlider.y+windowHeight/40);
  console.log(welcome.width);
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
  for (var x = 0; x < imgHeight; x++) {
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
          var offscreenXneg = curX < 0;
          var offscreenXpos = curX > trueWidth;
          var offscreenYneg = curY <0;
          var offscreenYpos = curY > trueHeight;
          var matrixVal = weightmatrix[i][j];
          var curColor;
          if (offscreenXneg || offscreenXpos || offscreenYneg || offscreenYpos) {
            if (offscreenXneg) {
              curX = 0;
            } 
            if (offscreenXpos) {
              curX = trueWidth;
            }
            if (offscreenYneg) {
              curY = 0;
            }
            if (offscreenYpos) {
              curY = trueHeight;
            }
          }
          curColor = 4 * (imgWidth*(curY) + curX);
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
  sigmaText.html("σ = " + sigma);
  createWM();
  performBlur();
  console.log("sigma: " + sigma);
}

function kernelSliderHandler() {
  kernelsize = kernelSlider.value();
  kernelText.html("Radius = " + kernelsize);
  kernelwidth = Math.floor(kernelsize/2);
  createWM();
  performBlur();
  console.log("kernel: " + kernelsize);
}

//---------------------------------------------------------------------------------------//

function preload() {
  srcImg = loadImage(defaultImg);
  tempImg = srcImg;
  equation = createImg("equation.png");
}

function setup () {
  welcome = createP("Gaussian Blur Tool by Alex Hutman");
  explanation = createP("How does this work?");
  cnv = createCanvas(srcImg.width, srcImg.height);
  button = createFileInput(gotFile);
  sigmaSlider = createSlider(1, 15, 1, 0.5);
  sigmaText = createP("σ = " + sigmaSlider.value());
  kernelSlider = createSlider(1, 51, 1, 2);
  kernelText = createP("Radius = " + kernelSlider.value());
  welcome.style("padding", "10px");
  explanation.style("padding", "10px");
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
}

function windowResized() {
  centerCanvas();
}
