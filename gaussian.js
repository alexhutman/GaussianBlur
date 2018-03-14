var cnv;
var srcImg;
var defaultImg = "assets/papi.jpg";
var imgWidth;
var imgHeight;
var lastindex;
var uploadButton;
var sigmaSlider;
var welcome;
var sigmaText;
var kernelText;
var equation;
var how;
var explanation1;
var matrix;
var nextButton;
var curSlide = 0;


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
  var cenX = 155+ (windowWidth - cnv.width) / 2;
  var cenY = (windowHeight - cnv.height) / 2 ;
  cnv.position(cenX, cenY);
}

function gotFile(file) {
  if (file.type === 'image') {
    srcImg = loadImage(file.data);
    setTimeout( function () {
      if (1 == 1) {
        imgWidth = srcImg.width;
        imgHeight = srcImg.height;
        lastindex = (imgWidth-1) + (imgHeight-1)*imgWidth;
        resizeCanvas(imgWidth, imgHeight);
        centerCanvas();
        clear();
        image(srcImg, 0, 0);
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
  //sigmaText.position(
  createWM();
  clear();
  image(srcImg, 0, 0);
  gaussianBlur();
}

function kernelSliderHandler() {
  kernelsize = kernelSlider.value();
  kernelText.html("Radius = " + kernelsize);
  kernelwidth = Math.floor(kernelsize/2);
  createWM();
  clear();
  image(srcImg, 0, 0);
  gaussianBlur();
}

function nextHandler() {
  if (curSlide == 0) {
    matrix = createImg("assets/matrix.png");
    matrix.style("width", "250px");
    matrix.style("height", "250px");
    matrix.position(welcome.x+matrix.width/6, welcome.y+158.3);
    explanation1.html("First we start with a RADIUSxRADIUS matrix. For example, the above is a matrix where the radius is equal to 3. The middle entry is the current pixel that we're looking at. We then plug each of these (x,y) values into the following equation to get a weighted matrix:");
    explanation1.style("width", "260px");
    explanation1.position(42.66666666, 405.3);
    explanation1.style("text-align", "center");
    nextButton.position(explanation1.x+(explanation1.width-nextButton.width)/2, 565);
    nextButton.html("Next ->");
    sigmaSlider.value(1);
    kernelSlider.value(1);
    sigma = sigmaSlider.value();
    sigmaText.html("σ = " + sigma);
    kernelSliderHandler();
    curSlide = 1;
  } else if (curSlide == 1) {
    matrix.remove();
    equation = createImg("assets/equation.png");
    equation.position(welcome.x, 125);
    explanation1.html("This is the 3D version of a normalized <q>bell curve</q> that has a standard deviation of σ. First, picture a 2D bell curve. If we make it have a large standard deviation, it will become shorter but wider. The same applies for the 3D version -- the larger we make σ, the more the pixels around the center one will be weighted, giving a blurrier image. We will apply this function to the (x,y) coordinate of each entry in the matrix to get a new weighted matrix. If we pick σ = 1.5 we get the following...");
    explanation1.position(explanation1.x, 240);
    nextButton.position(nextButton.x, 511);
    curSlide = 2;
  } else if (curSlide == 2) {
    equation.remove();
    matrix = createImg("assets/matrix2.png");
    matrix.style("width", "250px");
    matrix.style("height", "250px");
    matrix.position(welcome.x+matrix.width/6, welcome.y+158.3);
    explanation1.html("We are almost done! We must now normalize the matrix by calculating the sum of every value and then divide each entry by this sum. If we did not do this, we would get a darker image if the sum was less than 1 and a brighter image if the sum was greater than 1.");
    explanation1.position(matrix.x-4, matrix.y + matrix.height + 10);
    nextButton.position(nextButton.x, nextButton.y+55);
    curSlide = 3;
  } else if (curSlide == 3) {
    matrix.remove();
    matrix = createImg("assets/matrix3.png");
    matrix.style("width", "250px");
    matrix.style("height", "250px");
    matrix.position(welcome.x+matrix.width/6, welcome.y+158.3);
    explanation1.html("Now we must weigh each pixel according to this matrix. This means the center pixel's new R value is (top-left pixel's R value)*(0.0947416) + (top-center pixel's R value)*(0.118318) + ... We do this for the G,B, and A values of each pixel as well.");
    explanation1.position(matrix.x-4, matrix.y + matrix.height + 10);
    curSlide = 4;
  } else if (curSlide == 4) {
    matrix.remove();
    explanation1.html("We're done! Each pixel is averaged according to the pixels around it, producing a Gaussian blur. As you can see, σ = 1.5 and a radius size of 3 does not produce a very intense blur. Try changing the σ and Radius values to get a blurrier image! <font color=red>Radius values over ~31 (~2/3 of the slider) will take a little while!</font> You can also upload your own picture and blur it by hitting the <q>Choose File</q> button!");
    explanation1.position(explanation1.x, how.y+how.height+40);
    nextButton.html("Beginning ->");
    nextButton.position(nextButton.x-10, explanation1.y+explanation1.height+218);
    sigmaSlider.value(1.5);
    kernelSlider.value(3);
    sigma = sigmaSlider.value();
    sigmaText.html("σ = " + sigma);
    kernelSliderHandler();
    curSlide = 0;
  }
}

//---------------------------------------------------------------------------------------//

function preload() {
  srcImg = loadImage(defaultImg);
}

function setup () {
  welcome = createP("Gaussian Blur Tool by Alex Hutman");
  explanation1 = createP();
  how = createElement("h1", "How does this work?");
  uploadButton = createFileInput(gotFile);
  nextButton = createButton("Next ->");
  nextButton.mouseClicked(nextHandler);
  sigmaSlider = createSlider(1, 15, 1, 0.5);
  sigmaText = createP("σ = " + sigmaSlider.value());
  kernelSlider = createSlider(1, 51, 1, 2);
  kernelText = createP("Radius = " + kernelSlider.value());
  welcome.style("padding", "10px");
  how.style("padding", "10px");
  sigmaText.style("width", "75px");
  kernelText.style("width", "80px");
  sigmaText.style("height", "10px");
  kernelText.style("height", "10px");
  sigmaSlider.changed(sigmaSliderHandler);
  kernelSlider.changed(kernelSliderHandler);

  welcome.position(5, -13);
  how.position(welcome.x+18, welcome.y+47.5);
  nextHandler();
  sigmaText.style("text-align", "center");
  kernelText.style("text-align", "center");

  kernelText.position(137, 902.5);
  kernelSlider.position(kernelText.x-29, kernelText.y-27);
  sigmaText.position(kernelSlider.x+(kernelSlider.width-sigmaText.width)/2, kernelText.y-105.5);
  sigmaSlider.position(kernelSlider.x, kernelSlider.y-105.5);
  uploadButton.position(sigmaSlider.x-20, sigmaSlider.y-70);

  cnv = createCanvas(srcImg.width, srcImg.height);
  centerCanvas();

  pixelDensity(1);
  imgWidth = srcImg.width;
  imgHeight = srcImg.height;
  lastindex = (imgWidth-1) + (imgHeight-1)*imgWidth;
  createWM();
  noLoop();

  clear();
  image(srcImg, 0, 0);
  gaussianBlur();
}

function draw() {
}

function windowResized() {
  centerCanvas();
}
