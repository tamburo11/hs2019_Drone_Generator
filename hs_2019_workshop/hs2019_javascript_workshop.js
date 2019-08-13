// GLOBAL VARIABLES
var questionmark = false;
var arrayOfDots=[];

// SHOW INFO FUNCTION
function showInfo(){
    if(questionmark==false){ // we use a flag to check if the text is already visible or not
        document.getElementById("infoText").innerHTML = // we fill the div with this text
        "Dual Modulation Drone Generator is a polifonic drone generator which allows you to create synthetic textures directly on your browser. "
        +"It exploits both an AM (amplitude modulation) of sinusoidal waves by means of random triangular LFOs, and a double and reciprocal FM (frequency modulation) between pairs of oscillators. "
        +"Click on the window to create a sinusoidal wave (symbolized by a circle). The x-axis represents the frequencies, from 5Hz to 2000Hz. The y-axis represents the maximum amplitude reached by the LFO. Each sinusoid is amplitude modulated by a random triangular LFO, with a frequency from a minimum of 0.001Hz to a maximum of 0.2Hz. "
        +"Press 'L' and then Click+Drag from an existing circle to an other one, to link two sinusoids and create a mutual double frequency modulation (symbolized by a line), where each sinusoid is treated as a carrier frequency modulated by a modulation Pulse (with random Pulse Width) at the same frequency of the other sinusoid of the pair. "
        +"Click on an existing circle to delete it or to delete the modulation pair of which it is part. And Enjoy."
        questionmark=true;
    } else {
        document.getElementById("infoText").innerHTML = ""; // we clear the div
        questionmark=false;
    }  
}

// CLASS DOT
function Dot(x_axis,y_axis){

    // position of the Dot, they define also the frequency in Hz and the amplitude
    this.x=x_axis; // the X axis is the frequency value 
    this.y=y_axis; // the Y axis is the amplitude value

    // define amplitude and frequency of the associated sinusoid
    this.freq=map(this.x,0,windowWidth,5,2000);
    this.amp=map(this.y,windowHeight-97,0,0.0001,0.1);
    
    // set the dimension of the ellipse
    this.dimension=map(this.freq,2000,5,3,100);

    // oscillator associated to Dot
    this.osc = new p5.Oscillator();
    this.osc.setType('sine');
    this.osc.freq(this.freq);
    this.osc.amp(0);
    this.osc.start();

    // LFO triangle for Amplitude Modulation 
    this.ampModulator = new p5.Oscillator('triangle');
    this.ampModulator.disconnect(); // disconnect the ampModulator from master output
    this.ampModulator.freq(random(0.2)+0.001);
    this.ampModulator.amp(1);
    this.ampModulator.start();

    // apply Amplitude Modulation
    this.osc.amp(this.ampModulator.scale(-1,1,0.0,this.amp));

}

function setup() { // create a canvas when the sketch is loaded
    createCanvas(windowWidth, windowHeight-97);
}

function windowResized() { // resize the canvas each time the window is resized 
    resizeCanvas(windowWidth, windowHeight-97);
}

// DRAW FUNCTION
function draw(){
    clear(); // clear the canvas
    
    for(var i=0; i<arrayOfDots.length; i++){
        if(arrayOfDots[i]){
            var alpha=0.2;
            fill('rgba(0,0,255,' + alpha +')');
            strokeWeight(0.1);
            ellipse(arrayOfDots[i].x, arrayOfDots[i].y, arrayOfDots[i].dimension, arrayOfDots[i].dimension);
        } 
    }   
}

// MOUSE PRESSED FUNCTION -> ADD A DOT OR DELETE A DOT
function mousePressed() {
    
    var exist=false; // we use this variable as a flag (exist or not a dot in that position)

    for(var i=0; i<arrayOfDots.length; i++){

        if(arrayOfDots[i]){ // if the element is not null

            var d = dist(arrayOfDots[i].x,arrayOfDots[i].y,mouseX,mouseY); // i calculate the distance 

            if(d<arrayOfDots[i].dimension/2){ // if pressing on an existing dot
                exist=true;
                if(mouseY>0){ // if we are clicking on the canvas and not outside
                    arrayOfDots[i].ampModulator.amp(0,0.2);
                    arrayOfDots[i]=null; // delete the object from the array
                } 
            }
        }  
    }
    if(!exist&&mouseY>0){ // if the element does not exist we create it
        var newDot = new Dot(mouseX,mouseY);
        arrayOfDots.push(newDot); // we insert it in the array

        
    } 
}