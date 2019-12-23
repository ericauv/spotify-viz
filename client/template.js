import Visualizer from './classes/visualizer'
import {interpolateNumber} from 'd3-interpolate'
import repeatTextVertically from './visualizations/repeatTextVertically'
import images from './images'
export default class Template extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 60})
    this.state={
      sync:{
        segment:{
          value:0,
          max:16
        },
        tatum:{
          value:0,
          max:8
        },
        beat:{
          value:0,
          max:4
        }
      },
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
      this.state.sync.tatum.value++;
      // reset sync.tatum at sync.tatumMax
      if(this.state.sync.tatum.value>this.state.sync.tatum.max){
        this.state.sync.tatum.value = 1;
      }
      this.state.grow = this.state.attackCurrent > 0.97*this.state.attackAverage;

    })

    this.sync.on('segment', segment => {
      this.state.sync.segment.value++;
      // reset sync.segment at sync.segmentMax
      if(this.state.sync.segment.value>this.state.sync.segment.max){
        this.state.sync.segment.value = 1;
      }
      this.state.pointsAveraged++;
      this.state.attackCurrent = this.sync.segment.timbre[3];
      // only include positive values into average
      if(this.state.attackCurrent>=0){

        this.state.attackAverage = (this.state.attackSum + this.state.attackCurrent)/this.state.pointsAveraged;

        //  set background image
        // if(this.state.image === images.length-1){

          //   this.state.image=0;
          // }else{
            //   this.state.image+=1;
      // }
      // this.state.backgroundImage.src = images[this.state.beatSyncmage]

    }
  })


    this.sync.on('beat', beat => {
      this.state.sync.beat.value+=1;

      // reset sync.beat.value at beatSyncMax
      if(this.state.sync.beat.value>this.state.sync.beat.max){
        this.state.sync.beat.value = 1;
      }

      // store volume to state
      this.state.volume = this.sync.volume;
      // this.state.grow = !this.state.grow;

      // set colours randomly
      this.state.colours[0] = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},1)`;
      this.state.colours[1] = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},1)`;
    })

    this.sync.on('bar', bar => {

    })

    this.sync.on('section', section => {
      this.state.attackAverage = 0;
      this.state.attackSum = 0
      this.state.pointsAveraged = 0;


    })
  }

  paint ({ ctx, height, width, now }) {

    ctx.clearRect(0, 0, width, height);

    // Background
    const gradient = ctx.createLinearGradient(0,0,width+width/4,height+height/4);
    gradient.addColorStop(0,this.state.colours[0]);
    gradient.addColorStop(1,this.state.colours[1]);
    ctx.fillStyle = gradient;

    // // photo background
    // const pattern = ctx.createPattern(this.state.backgroundImage, 'repeat');
    ctx.fillRect(0, 0, width, height);

    // set range for fontSize
    const textSizeByVolume = interpolateNumber(44,100) ;
    ctx.font=`${textSizeByVolume((this.state.grow ? 1.2 : 0.8)*this.sync.volume )}px Arial`;
    ctx.font = '900 Arial'
    ctx.lineWidth= 2.2;
    ctx.textAlign ='center';
    // ctx.strokeText(this.sync.state.currentlyPlaying.name, width/2,height/2);
    // ctx.strokeText('VISIONS // 2020', width/2,height/2);

    ctx.fillStyle= 'white';

    // ctx.strokeText(now,width/4,height/4);
    for(let i = 0; i<=5;i++){
      drawCenterEdgeRectangles(ctx, this.sync.segment.timbre[i]/95*(this.state.grow ? 1.1 : 0.6) * this.sync.volume, false, 'red', width/2, height/2, 30, width,height, i*40 );

    }
    // ctx.strokeRect(0,height/2,30,textSizeByVolume(this.sync.volume));
    // ctx.strokeRect(width,height/2,-30,-textSizeByVolume(this.sync.volume));
    // ctx.strokeText('hello', this.state.beatSync,this.state.beatSync);
    // ctx.strokeText(this.sync.state.currentlyPlaying.name, 0,this.state.beatSync);
    // ctx.strokeText(this.sync.state.currentlyPlaying.artists[0].name, width/2,this.state.beatSync);
    // ctx.strokeText(this.sync.state.currentlyPlaying.name, 3*width/4,this.state.beatSync);
    // ctx.strokeText(this.sync.state.currentlyPlaying.name, width,this.state.beatSync);

    // repeated Text
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center'
    repeatTextVertically(ctx,'visions', 'stroke', width/2, height/2,50,false,this.state.sync.beat.value,300);
    ctx.textAlign = 'left'
    repeatTextVertically(ctx,'2020', 'stroke', width/9, height/9,50,false,this.state.sync.tatum.value,300);
    ctx.textAlign = 'right'
    for(let ninthCount=8;ninthCount>=1;ninthCount--){
      repeatedSyncTextAtNinthsOfWidth(ctx,width,height,'//','stroke',this.state.sync.beat.value);

    }
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