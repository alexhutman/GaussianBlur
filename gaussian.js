var cnv;
var srcImg;
var blurredImg;
var defaultImg = "assets/papi.jpg";

var explanation;
var explImg;
var nextButton;
var uploadButton;
var sigmaSlider;
var sigmaText;
var kernelSlider;
var kernelText;

var curSlide = 0;

var kernelsize;
var kernelwidth;
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

function gotFile(file) {
  if (file.type === 'image') {
    srcImg = loadImage(file.data);
    blurredImg = srcImg;
    setTimeout( function () {
      if (1 == 1) {
        var imgWidth = srcImg.width;
        var imgHeight = srcImg.height;
        resizeCanvas(imgWidth, imgHeight);
        cnv.style("margin", "auto auto");
        clear();
        image(blurredImg, 0, 0);
        gaussianBlur();
      }
    }
    ,
      100);
  } else {
    createP("Please enter a valid image!");
  }
}

function gaussianBlur() {
  var imgWidth = srcImg.width;
  var imgHeight = srcImg.height;
  loadPixels();

  var trueWidth = imgWidth - 1;
  var trueHeight = imgHeight - 1;
  for (var x = 0; x < imgWidth; x++) {
    for (var y = 0; y < imgHeight; y++) {
      var loc = 4 * (y * imgWidth + x);
      var sumR = 0;
      var sumG = 0;
      var sumB = 0;
      //var sumA = 0;

      for (var i = 0; i < kernelsize; i++) {
        for (var j = 0; j < kernelsize; j++) {
          var curX = x-kernelwidth+j;
          var curY = y-kernelwidth+i;
          var offscreenXneg = curX < 0;
          var offscreenXpos = curX > trueWidth;
          var offscreenYneg = curY < 0;
          var offscreenYpos = curY > trueHeight;
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
          var matrixVal = weightmatrix[i][j];
          var curColor = 4 * (imgWidth*(curY) + curX);
          sumR += matrixVal*pixels[curColor];
          sumG += matrixVal*pixels[curColor+1];
          sumB += matrixVal*pixels[curColor+2];
          //sumA += matrixVal*pixels[curColor+3];
        }
      }
      pixels[loc] = sumR;
      pixels[loc+1] = sumG;
      pixels[loc+2] = sumB;
      //pixels[loc+3] = sumA;
    }
  }
  updatePixels();
}

function sigmaSliderHandler() {
  sigma = sigmaSlider.value();
  sigmaText.html("σ = " + sigma);
  createWM();
  clear();
  blurredImg = srcImg;
  image(blurredImg, 0, 0);
  gaussianBlur();
}

function kernelSliderHandler() {
  kernelsize = kernelSlider.value();
  kernelText.html("Radius = " + kernelsize);
  kernelwidth = Math.floor(kernelsize/2);
  createWM();
  clear();
  blurredImg = srcImg;
  image(blurredImg, 0, 0);
  gaussianBlur();
}

function nextHandler() {
  if (curSlide == 0) {
    explImg.elt.src = "assets/matrix.png";
    explanation.html("First we start with a RADIUSxRADIUS matrix. For example, the above is a matrix where the radius is equal to 3. The middle entry is the current pixel that we're looking at. We then plug each of these (x,y) values into the following equation to get a weighted matrix:")
    nextButton.html("Next ->");
    nextButton.style('margin', '5px 33%');
    sigmaSlider.value(1);
    kernelSlider.value(1);
    sigma = 1;
    sigmaText.html("σ = " + sigma);
    kernelSliderHandler();
    curSlide = 1;
  } else if (curSlide == 1) {
    explImg.elt.src = "assets/equation.png";
    explImg.style("height", "64px");
    explanation.html("This is the 3D version of a normalized <q>bell curve</q> that has a standard deviation of σ. First, picture a 2D bell curve. If we make it have a large standard deviation, it will become shorter but wider. The same applies for the 3D version -- the larger we make σ, the more the pixels around the center one will be weighted, giving a blurrier image. We will apply this function to the (x,y) coordinate of each entry in the matrix to get a new weighted matrix. If we pick σ = 1.5 we get the following...");
    curSlide = 2;
  } else if (curSlide == 2) {
    explImg.elt.src = "assets/matrix2.png";
    explImg.style("height", "250px");
    explanation.html("We are almost done! We must now normalize the matrix by calculating the sum of every value and then divide each entry by this sum. If we did not do this, we would get a darker image if the sum was less than 1 and a brighter image if the sum was greater than 1.");
    curSlide = 3;
  } else if (curSlide == 3) {
    explImg.elt.src = "assets/matrix3.png";
    explanation.html("Now we must weigh each pixel according to this matrix. This means the center pixel's new R value is (top-left pixel's R value)*(0.0947416) + (top-center pixel's R value)*(0.118318) + ... We do this for the G,B, and A values of each pixel as well.");
    curSlide = 4;
  } else if (curSlide == 4) {
    explanation.html("We're done! Each pixel is averaged according to the pixels around it, producing a Gaussian blur. As you can see, σ = 1.5 and a radius size of 3 does not produce a very intense blur. Try changing the σ and Radius values to get a blurrier image! <font color=red>Radius values over ~31 (~2/3 of the slider) will take a little while!</font> You can also upload your own picture and blur it by hitting the <q>Choose File</q> button!");
    nextButton.html("Beginning ->");
    nextButton.style('margin', '5px 30%');
    sigmaSlider.value(1.5);
    kernelSlider.value(3);
    sigma = 1.5;
    sigmaText.html("σ = " + sigma);
    kernelSliderHandler();
    curSlide = 0;
  }
}

//---------------------------------------------------------------------------------------//

function turnRed() {
  this.class("sliderClicked");
}

function turnBlack() {
  this.class("slider");
}

function preload() {
  srcImg = loadImage(defaultImg);
}

function setup () {
  explanation = select('#tutPar');
  explImg = select('#tutImg');
  nextButton = select('#next');
  uploadButton = createFileInput(gotFile);
  sigmaText = createP("σ = 1");
  sigmaSlider = createSlider(1, 15, 1, 0.5);
  kernelText = createP("Radius = 1");
  kernelSlider = createSlider(1, 51, 1, 2);


  nextButton.style('margin', '5px 33%');
  nextButton.style('padding', '10px 15px');
  nextButton.style('white-space', 'nowrap');
  nextButton.style('text align', 'center');
  nextButton.class('button');

  nextButton.mouseClicked(nextHandler);
  sigmaSlider.mousePressed(turnRed);
  sigmaSlider.mouseReleased(turnBlack);
  kernelSlider.mousePressed(turnRed);
  kernelSlider.mouseReleased(turnBlack);

  uploadButton.style('margin-left', '15%');
  uploadButton.style('margin-right', '15%');
  uploadButton.style('border', '3px #615f5e dotted');
  uploadButton.class('button');
  uploadButton.parent('#upload');


  sigmaText.parent('#sigma');
  sigmaSlider.parent('#sigma');
  sigmaText.style("text-align", "center");
  sigmaText.style("width", "100%");
  sigmaSlider.class('slider');

  kernelText.parent('#kernel');
  kernelSlider.parent('#kernel');
  kernelText.style("text-align", "center");
  kernelSlider.class('slider');

  cnv = createCanvas(srcImg.width, srcImg.height);
  cnv.parent('#canvasCol');
  cnv.style("margin", "auto auto");
  cnv.style("display", "block");

  sigmaSlider.changed(sigmaSliderHandler);
  kernelSlider.changed(kernelSliderHandler);

  nextHandler();

  pixelDensity(1);

  noLoop();
}

function draw() {
  image(srcImg, 0, 0);
}
