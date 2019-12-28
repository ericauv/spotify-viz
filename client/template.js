import Visualizer from './classes/visualizer'
import {interpolateNumber} from 'd3-interpolate'
import repeatTextVertically from './visualizations/repeatTextVertically'
import repeatText from './visualizations/repeatText'
import images from './images'
export default class Template extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 60})
    this.state={
      sync:{
        segment:{
          random:[],
          value:0,
          max:16
        },
        tatum:{
          random:[],
          value:0,
          max:8
        },
        beat:{
          random:[],
          value:0,
          max:4
        },
        bar:{
          random:[],
          value:0,
          max:4
        },
        section:{
          random:[],
          value:0,
          max:4
        }
      },
      timbreRectangles:{
        draw:true,
        number:3,
        depth:30,
        spacing:40
      },
      randomSetsOfFour:[[0,0,0,0]],
      image:0,
      backgroundImage: new Image(),
      grow:false,
      volume: 0,
      attackAverage:0,
      attackSum:0,
      pointsAveraged:0,
      attackCurrent:0,
      colours:['rgba(0,0,0,0)','rgba(0,0,0,0)']

    }
  }
  hooks () {
    this.sync.on('tatum', tatum => {
      this.handleStateUpdateForSync('tatum');
      this.state.grow = this.state.attackCurrent > 0.97*this.state.attackAverage;
    })

    this.sync.on('segment', segment => {
      this.handleStateUpdateForSync('segment');
      this.state.pointsAveraged++;
      this.state.attackCurrent = this.sync.segment.timbre[3];
      // only include positive values into average
      if(this.state.attackCurrent>=0){

        this.state.attackAverage = (this.state.attackSum + this.state.attackCurrent)/this.state.pointsAveraged;

        //  set background image
        if(this.state.image === images.length-1){
            this.state.image=0;
          }else{
              this.state.image+=1;
      }
      this.state.backgroundImage.src = images[this.state.image];

    }
  })


  this.sync.on('beat', beat => {

    this.handleStateUpdateForSync('beat');

    // store volume to state
    this.state.volume = this.sync.volume;
    // this.state.grow = !this.state.grow;

    // set colours randomly
    this.state.colours[0] = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},1)`;
    this.state.colours[1] = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},1)`;
  })

  this.sync.on('bar', bar => {
    this.generateRandomSetsOfFour();

      this.handleStateUpdateForSync('bar');

    })

    this.sync.on('section', section => {

      this.handleStateUpdateForSync('section');
      this.state.attackAverage = 0;
      this.state.attackSum = 0
      this.state.pointsAveraged = 0;


    })
  }

  generateRandomSetsOfFour = () => {
     // create random Sets of 4 numbers
     for(let counter=0;counter<=200;counter++){
      this.state.randomSetsOfFour[counter]=[];
      for(let index=0;index<4;index++){
        this.state.randomSetsOfFour[counter][index] = Math.random();
      }
    }
  }
  incrementSync = (syncIntervalName = 'segment') => {
    // increments the value of the passed syncIntervalName in this.state.sync[syncIntervalName]
    if(this.state.sync[syncIntervalName]){
      let {value,max} = this.state.sync[syncIntervalName];
      value+=1;
      if(value>max){
        value = 1;
      }
      this.state.sync[syncIntervalName].value = value;
    }
  }


  handleStateUpdateForSync = (syncIntervalName='segment') => {
    this.incrementSync(syncIntervalName);
    this.generateRandomNumberForSync(syncIntervalName);
  }

  generateRandomNumberForSync = (syncIntervalName='segment') => {
    this.state.sync[syncIntervalName].random[0] = Math.random();
    this.state.sync[syncIntervalName].random[1] = Math.random();
    this.state.sync[syncIntervalName].random[2] = Math.random();
    this.state.sync[syncIntervalName].random[3] = Math.random();
  }



  paint ({ ctx, height, width, now }) {


    // clear canvas from previous paint
    ctx.clearRect(0, 0, width, height);

    // Background
    const gradient = ctx.createLinearGradient(0,0,width+width/4,height+height/4);
    gradient.addColorStop(0,this.state.colours[0]);
    // add intermediate color stop
    gradient.addColorStop(Math.min(1,(1/this.state.sync.bar.max)*this.sync.bar.progress+ 1/this.state.sync.bar.max*(this.state.sync.bar.value-1)),'red');
    gradient.addColorStop(1,this.state.colours[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);


    // photo background
    // ctx.drawImage(this.state.backgroundImage, width/27 * this.state.image, height/27*this.state.image, 300,300);
    // ctx.drawImage(this.state.backgroundImage, width-width/27 * this.state.image, height-height/27*this.state.image, 300,300);
    // drawRandomImages(ctx,this.state.randomSetsOfFour,0,width,height,2,images);

    // random rectangles
    drawRandomRectangles(ctx,this.state.randomSetsOfFour,0,width,height,2,9);

    // set range for fontSize
    const textSizeByVolume = interpolateNumber(44,100) ;
    ctx.font=`${textSizeByVolume((this.state.grow ? 1.2 : 0.8)*this.sync.volume )}px Arial`;
    ctx.font = '900 Arial'
    ctx.lineWidth= 2.2;
    ctx.textAlign ='center';

    ctx.fillStyle= 'white';

    // timbre rectangles
    if(this.state.timbreRectangles.draw){
      for(let i = 0; i<=Math.min(11,this.state.timbreRectangles.number-1);i++){
        drawCenterEdgeRectangles(ctx, this.sync.segment.timbre[i]/95*(this.state.grow ? 1.1 : 0.6) * this.sync.volume, false, 'red', width/2, height/2, this.state.timbreRectangles.depth, width,height, i*(this.state.timbreRectangles.depth +this.state.timbreRectangles.spacing));
      }
    }

    // repeated Text
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.font = '92px Arial';

    // Song Name
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    repeatTextVertically(ctx,this.sync.state.currentlyPlaying.name, 'fill', Math.round(this.state.randomSetsOfFour[0][1]*9)*width/9, height/2,50,false,this.state.sync.beat.value,2*width/3);

    // Artist Name
    ctx.textAlign = 'left'
    repeatTextVertically(ctx,this.sync.state.currentlyPlaying.artists[0].name, 'fill', Math.round(this.state.randomSetsOfFour[0][0]*9)*width/9, height/9,50,false,3,2*width/3);

    // repeated ninths
    // ctx.textAlign = 'right'
    // for(let ninthCount=8;ninthCount>=1;ninthCount--){
    //   repeatedSyncTextAtNinthsOfWidth(ctx,width,height,'//','stroke',1);

    // }
    ctx.restore();
  }
}

const repeatedSyncTextAtNinthsOfWidth = (ctx, width=1000, height=1000, textContent='', fillOrStroke='fill', syncValue=1) => {
  for(let ninthCount=8;ninthCount>=1;ninthCount--){
    repeatTextVertically(ctx,textContent, fillOrStroke, width/9*ninthCount, height,50,true,syncValue,300);

  }
}

const drawMultipleCenterEdgeRectangles = (numberOfRectangles) => {
  for(let i = 0; i<=5;i++){
    drawCenterEdgeRectangles(ctx, this.sync.volume, false, 'red', width/2, height/2, 30, width,height, i*40 );

  }

}

const drawRandomImages = (ctx, randomSetsOfFour=[[]],randomSeedAddition, width=1000,height=1000, numberOfImages=1, images=[]) => {
  const image = new Image();
  const imageInstanceLimit = Math.min(numberOfImages, randomSetsOfFour.length)
  for(let imageInstance = 0; imageInstance<imageInstanceLimit;imageInstance++){
    // pick a random image from images to draw
    image.src = images[Math.min(images.length-1,Math.round(randomSetsOfFour[imageInstance][0]*(images.length-1)))];

    const randomX = Math.round(Math.round(randomSetsOfFour[imageInstance+randomSeedAddition][0]*9)  * width/9);
    const randomY = Math.round(Math.round(randomSetsOfFour[imageInstance+randomSeedAddition][1]*9)  * height/9);
    const randomWidth = Math.round(Math.round(randomSetsOfFour[imageInstance+randomSeedAddition][2]*9+1)  * width/9);
    const randomHeight = Math.round(Math.round(randomSetsOfFour[imageInstance+randomSeedAddition][3]*9+1)  * height/9);
    // draw the image in a random position and size
    ctx.drawImage(image,randomX,randomY,randomWidth,randomHeight);
  }
}
const drawRandomRectangles = (ctx, randomSetsOfFour=[[]],randomSeedAddition, width=1000,height=1000, numberOfRectangles=1, gridDivision=9) => {
  for(let rectangleCount = 0; rectangleCount<numberOfRectangles;rectangleCount++){
    const randomX = Math.round(Math.round(randomSetsOfFour[rectangleCount+randomSeedAddition][0]*gridDivision)  * width/gridDivision);
    const randomY = Math.round(Math.round(randomSetsOfFour[rectangleCount+randomSeedAddition][1]*gridDivision)  * height/gridDivision);
    const randomWidth = Math.round(Math.round(randomSetsOfFour[rectangleCount+randomSeedAddition][2]*gridDivision+1)  * width/gridDivision);
    const randomHeight = Math.round(Math.round(randomSetsOfFour[rectangleCount+randomSeedAddition][3]*gridDivision+1)  * height/gridDivision);
    ctx.save();
    ctx.fillStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},${Math.random()})`;
    ctx.fillRect(randomX,randomY,randomWidth,randomHeight);
    ctx.strokeRect(randomX,randomY,randomWidth,randomHeight);
    ctx.restore();
  }
}

const textAtCenteredThirds = (ctx,textContent='',fillOrStroke='fill',width=1000,height=1000) =>{
  ctx.save();
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.strokeText(textContent, width/3,height/3);
  ctx.textAlign='left';
  ctx.textBaseline='top';
  ctx.strokeText(textContent, 2*width/3,2*height/3);
  ctx.restore();
}

const drawCenterEdgeRectangles = (ctx, normalizedInput, fill=false, fillColour='white', maxWidth, maxHeight, otherRectangleDimension=30, canvasWidth, canvasHeight, offsetTowardsCenter=0) => {
  const rectHeight = interpolateNumber(0,maxHeight-otherRectangleDimension)(normalizedInput);
  const rectWidth = interpolateNumber(0,maxWidth-otherRectangleDimension)(normalizedInput);
  const rectangleInputs = [[offsetTowardsCenter,canvasHeight/2,otherRectangleDimension,-rectHeight],[canvasWidth-offsetTowardsCenter,canvasHeight/2,-otherRectangleDimension,rectHeight],
[canvasWidth/2,offsetTowardsCenter,rectWidth,otherRectangleDimension],[canvasWidth/2,canvasHeight-offsetTowardsCenter,-rectWidth,-otherRectangleDimension]];

for(let i = 0;i<=3;i++){
    if(fill){
      ctx.fillStyle=fillColour;
      ctx.fillRect(...rectangleInputs[i]);
    }else{
      ctx.strokeRect(...rectangleInputs[i]);
      ctx.fillStyle=fillColour;
    }
  }
}
// const drawCenterEdgeRectanglesWithTimbres = (ctx, normalizedInput, fill=false, fillColour='white', maxWidth, maxHeight, otherRectangleDimension=30, canvasWidth, canvasHeight, offsetTowardsCenter=0) => {
//   const rectHeight = ;
//   const rectWidth = interpolateNumber(0,maxWidth-otherRectangleDimension)(normalizedInput);
//   const rectangleInputs = [[offsetTowardsCenter,canvasHeight/2,otherRectangleDimension,-rectHeight],[canvasWidth-offsetTowardsCenter,canvasHeight/2,-otherRectangleDimension,rectHeight],
// [canvasWidth/2,offsetTowardsCenter,rectWidth,otherRectangleDimension],[canvasWidth/2,canvasHeight-offsetTowardsCenter,-rectWidth,-otherRectangleDimension]];

// for(let i = 0;i<=3;i++){
//     if(fill){
//       ctx.fillStyle=fillColour;
//       ctx.fillRect(...rectangleInputs[i]);
//     }else{
//       ctx.strokeRect(...rectangleInputs[i]);
//     }
//   }
// }