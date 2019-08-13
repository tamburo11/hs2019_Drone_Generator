// GLOBAL VARIABLES
var questionmark = false;
var arrayOfDots=[];
var firstDotIndex=-1;
var secondDotIndex=-1;

// SHOW INFO FUNCTION
function showInfo(){
    if(questionmark==false){
        document.getElementById("infoText").innerHTML = 
        "Dual Modulation Drone Generator is a polifonic drone generator which allows you to create synthetic textures directly on your browser. "
        +"<br><br>It exploits both an AM (Amplitude Modulation) of sinusoidal waves by means of random triangular LFOs (Low Frequency Oscillators), and a double and reciprocal FM (Frequency Modulation) between pairs of oscillators. "
        +"<br><br>Click on the window to create a sinusoidal wave (symbolized by a circle). The y-axis represents the maximum amplitude reached by the LFO. Each sinusoid is amplitude modulated by a random triangular LFO, with a frequency from a minimum of 0.001Hz to a maximum of 0.2Hz. The x-axis represents the frequencies, from 5Hz to 2000Hz. "
        +"<br><br>Press 'L' and then Click+Drag from an existing circle to an other one, to link two sinusoids and create a mutual double frequency modulation (symbolized by a line), where each sinusoid is treated as a carrier frequency modulated by a modulation Pulse (with random Pulse Width) at the same frequency of the other sinusoid of the pair. "
        +"<br><br>Click on an existing circle to delete it or to delete the modulation pair of which it is part. And Enjoy."  ;      
        questionmark=true;
    } else {
        document.getElementById("infoText").innerHTML = "";
        questionmark=false;
    }  
}

// function that inizitile the index for the dragging mode
function initializeIndex(){
    firstDotIndex=-1;
    secondDotIndex=-1;
}

// CLASS DOT
function Dot(x,y){

    // position of the Dot, they define also the frequency in Hz and the amplitude
    this.x=x;
    this.y=y;

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

    // LFO Pulse for FM Modulation
    this.freqModulator = new p5.Pulse();
    this.freqModulator.disconnect(); // disconnect the ampModulator from master output
    this.freqModulator.freq(this.freq); // /(random(8)+1)
    this.freqModulator.amp(1);
    this.freqModulator.width(random(1));
    this.freqModulator.start();

    // apply Amplitude Modulation
    this.osc.amp(this.ampModulator.scale(-1,1,0.0,this.amp));

    // create Amplitude Objects
    this.currentAmp = new p5.Amplitude();
    this.currentAmp.setInput(this.osc);
    this.modAmp = new p5.Amplitude();
    this.modAmp.setInput(this.ampModulator);

    // index of the connected Dots (To and From)
    this.indexDotTo=-1;
    this.indexDotFrom=-1;

    // flag: is or not connected
    this.isConnected=false;

}

function setup() {
    createCanvas(windowWidth, windowHeight-97);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight-97);
}

// DRAW FUNCTION
function draw(){
    clear();
    // background(240,240,240);
    
    for(var i=0; i<arrayOfDots.length; i++){
        if(arrayOfDots[i]){
            var currentDot1=arrayOfDots[i];
            var alpha;
            if(currentDot1.indexDotFrom!=-1){ // if the Dot is an FM ampModulator
                alpha=map(currentDot1.modAmp.getLevel()*10,0,currentDot1.amp, 0,map(currentDot1.amp,0,0.3,0,1)) ;
                fill('rgba(0,0,0,' + alpha +')');
            } else {
                alpha=map(currentDot1.currentAmp.getLevel()*10,0,currentDot1.amp, 0,map(currentDot1.amp,0,0.3,0,1)) ;
                fill('rgba(0,0,255,' + alpha +')');
            }

            strokeWeight(0.1);
            ellipse(currentDot1.x, currentDot1.y, currentDot1.dimension, currentDot1.dimension);
            
            if(currentDot1.indexDotTo!=-1){ // if the Dot is an FM carrier
                if(arrayOfDots[currentDot1.indexDotTo]){
                    strokeWeight(0.2);
                    // draw the line
                    line(currentDot1.x,currentDot1.y,arrayOfDots[currentDot1.indexDotTo].x,arrayOfDots[currentDot1.indexDotTo].y);
                }  
            }
        } 
    }   
}

// MOUSE PRESSED FUNCTION -> ADD A DOT OR DELETE A DOT
function mousePressed() {
    
        var exist=false;

        for(var i=0; i<arrayOfDots.length; i++){
            if(arrayOfDots[i]){
                var currentDot2=arrayOfDots[i];
                var d = dist(currentDot2.x,currentDot2.y,mouseX,mouseY);
                if(d<currentDot2.dimension/2){ // if pressing on an existing dot
                    exist=true;
                    if(!keyIsDown(76)&&mouseY>0){
                        currentDot2.ampModulator.amp(0,0.2);
                        
                        // delete the possible connection of the deleted object and stop the FM 
                        for(var j=0; j<arrayOfDots.length; j++){
                            if(arrayOfDots[j]){
                                if(arrayOfDots[j].indexDotFrom==i||arrayOfDots[j].indexDotTo==i){
                                    
                                    arrayOfDots[j].ampModulator.amp(0,0.2);
                                    arrayOfDots[j]=null;
                                }
    
                            }
                        }
                        arrayOfDots[i]=null; // delete the object from the array
                    } 
                }
            }  
        }
    
        if(!exist&&!keyIsPressed&&mouseY>0){
            var newDot = new Dot(mouseX,mouseY);
            arrayOfDots.push(newDot);
        } 
    }

// MOUSE DRAGGED between two Dots with KEY "L" PRESSED
function mouseDragged() {
    if(keyIsDown(76)){
        for(var i=0; i<arrayOfDots.length; i++){
            if(arrayOfDots[i]){
                var currentDotDrag =arrayOfDots[i];
                var d = dist(currentDotDrag.x,currentDotDrag.y,mouseX,mouseY);
                    
                // if I enter and the dot is not already connected
                if(d<currentDotDrag.dimension/2&&currentDotDrag.isConnected==false){
                    if(firstDotIndex==-1&&secondDotIndex==-1){
                        firstDotIndex=i;
                    } 
                    if(secondDotIndex==-1&&firstDotIndex!=-1&&i!=firstDotIndex){
                        secondDotIndex=i;
    
                        if(arrayOfDots[firstDotIndex].isConnected==false&&arrayOfDots[secondDotIndex].isConnected==false){
                            arrayOfDots[firstDotIndex].indexDotTo=secondDotIndex;
                            arrayOfDots[firstDotIndex].isConnected=true;
                                
                            arrayOfDots[secondDotIndex].indexDotFrom=firstDotIndex;
                            arrayOfDots[secondDotIndex].isConnected=true;
                            frequencyModulation(arrayOfDots[firstDotIndex], arrayOfDots[secondDotIndex]);
                                
                        } else {
                            secondDotIndex=-1;
                        }
                    }
                }
            }
        }
    } 
}

function mouseRealeased() {
    initializeIndex();
}
function keyReleased(){
    initializeIndex();
}

function frequencyModulation(i,j){

    var scalar1=(random(300)+50)*random([-1,1]);
    i.osc.freq(j.freqModulator.mult(scalar1)); 

    var scalar2=(random(300)+50)*random([-1,1]);
    j.osc.freq(i.freqModulator.mult(scalar2));
}
  





























// define the envelope associated
    // this.env = new p5.Envelope();
    // this.env.setADSR(0.001, 5, 0.2, 1);
    // this.env.setRange(this.amp, 0);
    // define the oscillator

// arrayOfDots.splice(i, 1);

// function stopFrequencyModulation(m){
//     // m.ampModulator.setType("sine");
//     // m.ampModulator.freq(random(0.1)+0.001);
// }

                            // if(arrayOfDots[j].indexDotFrom==i){
                                //     stopFrequencyModulation(arrayOfDots[j],arrayOfDots[i]);
                                //     arrayOfDots[j].isConnected=false;
                                //     arrayOfDots[j].indexDotFrom=-1;
                                // } else if(arrayOfDots[j].indexDotTo==i){
                                //     stopFrequencyModulation(arrayOfDots[j],arrayOfDots[i]);
                                //     arrayOfDots[j].isConnected=false;
                                //     arrayOfDots[j].indexDotTo=-1;
                                // }

                                // function stopFrequencyModulation(c,m){
                                    //     c.freqModulator.amp(0);
                                    //     c.osc.freq(c.freq);
                                    //     m.freqModulator.amp(0);
                                    //     m.osc.freq(m.freq);
                                    // }
                                    
                    // changeFM(arrayOfDots[currentDot1.indexDotTo]); // call the function with the FM ampModulator as parameter
