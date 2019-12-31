import Visualizer from './classes/visualizer'
import {interpolateNumber} from 'd3-interpolate'
import {differenceInHours, differenceInMinutes, differenceInSeconds, differenceInMilliseconds,formatDistanceToNow, addMinutes, startOfMinute} from 'date-fns'
import repeatTextVertically from './visualizations/repeatTextVertically'
import repeatText from './visualizations/repeatText'
// import images from './images'


const newYear = new Date('January 1, 2020');
// const newYear = new Date('December 31, 2019 17:28');
// const newYearEndVisuals = new Date('December 31, 2019 17:29');
const newYearEndVisuals = new Date('January 1, 2020 00:01:30');
export default class Template extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 60})
    this.state={
      sync:{
        segment:{
          random:[],
          randomSetsOfFour:[],
          value:0,
          max:16
        },
        tatum:{
          random:[],
          randomSetsOfFour:[],
          value:0,
          max:8
        },
        beat:{
          random:[],
          randomSetsOfFour:[],
          value:0,
          max:4,
          secondsLeft:60
        },
        bar:{
          random:[],
          randomSetsOfFour:[],
          value:0,
          max:4
        },
        section:{
          random:[],
          randomSetsOfFour:[],
          value:0,
          max:4
        }
      },
      timbreRectangles:{
        draw:true,
        number:5,
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
    this.state.sync.beat.secondsLeft = differenceInSeconds(newYear, Date.now())-(differenceInMinutes(newYear,Date.now())*60);



    // store volume to state
    this.state.volume = this.sync.volume;
    // this.state.grow = !this.state.grow;

    // set colours randomly
    this.state.colours[0] = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},1)`;
    this.state.colours[1] = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},1)`;
  })

  this.sync.on('bar', bar => {

      this.handleStateUpdateForSync('bar');

    })

    this.sync.on('section', section => {

      this.handleStateUpdateForSync('section');
      this.state.attackAverage = 0;
      this.state.attackSum = 0
      this.state.pointsAveraged = 0;


    })
  }

  generateRandomSetsOfFour = (syncInterval='segment') => {
     // create random Sets of 4 numbers
     for(let counter=0;counter<=200;counter++){
      this.state.sync[syncInterval].randomSetsOfFour[counter]=[];
      for(let index=0;index<4;index++){
        this.state.sync[syncInterval].randomSetsOfFour[counter][index] = Math.random();
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
    this.generateRandomSetsOfFour(syncIntervalName);

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
    ctx.fillStyle =' white';
    const hoursLeft = differenceInHours(newYear, Date.now());
    const minutesLeft = differenceInMinutes(newYear, Date.now())-(hoursLeft*60);
    const secondsLeft = differenceInSeconds(newYear, Date.now())-(differenceInMinutes(newYear,Date.now())*60);
    const millisecondsLeft = differenceInMilliseconds(newYear, Date.now())-(differenceInSeconds(newYear,Date.now())*1000);


    // Background
    const gradient = ctx.createLinearGradient(0,0,width+width/4,height+height/4);
    gradient.addColorStop(0,this.state.colours[0]);
    // add intermediate color stop
    gradient.addColorStop(Math.min(1,(1/this.state.sync.bar.max)*this.sync.bar.progress+ 1/this.state.sync.bar.max*(this.state.sync.bar.value-1)),'red');
    gradient.addColorStop(1,this.state.colours[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);





    // set range for fontSize
    // const textSizeByVolume = interpolateNumber(44,100) ;
    // ctx.font=`${textSizeByVolume((this.state.grow ? 1.2 : 0.8)*this.sync.volume )}px Arial`;
    // ctx.font = '900 Arial'
    ctx.lineWidth= 2.2;
    // ctx.textAlign ='center';

    // ctx.fillStyle= 'white';

    // timbre rectangles
    if(minutesLeft%10 === 0 && (minutesLeft+hoursLeft) > 0){
      console.log(hoursLeft,minutesLeft, minutesLeft%10);
      let edgeRectangleCount = Math.min(11,this.state.timbreRectangles.number-1);
      if(this.state.sync.beat.secondsLeft<5){
        edgeRectangleCount = 4 - this.state.sync.beat.value;
      }
        for(let i = 0; i<=edgeRectangleCount;i++){
          // random fill rectangles
          if(secondsLeft <=20){
            drawCenterEdgeRectangles(ctx, this.sync.segment.timbre[i]/95*(this.state.grow ? 1.1 : 0.6) * this.sync.volume, true, `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},${Math.random()})`, width/2, height/2, this.state.timbreRectangles.depth, width,height, i*(this.state.timbreRectangles.depth +this.state.timbreRectangles.spacing));
          }
          // stroke rectangles
          drawCenterEdgeRectangles(ctx, this.sync.segment.timbre[i]/95*(this.state.grow ? 1.1 : 0.6) * this.sync.volume, false, 'red', width/2, height/2, this.state.timbreRectangles.depth, width,height, i*(this.state.timbreRectangles.depth +this.state.timbreRectangles.spacing));
        }
    }







      if(Date.now() < newYear){
        // Last minute
        if(Date.now() < newYear && hoursLeft < 1 && minutesLeft<=1){
          const numberOfRects = Math.round((60-this.state.sync.beat.secondsLeft)/3);
          drawRandomRectangles(ctx,this.state.sync.bar.randomSetsOfFour,0,width,height,numberOfRects,9);
        }
        ctx.fillStyle ='white';
        // Countdown text
        ctx.save();
        ctx.font = '18px Arial';
        ctx.fillStyle ='white';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`-[${padWithZeroes(hoursLeft,2)}:${padWithZeroes(minutesLeft,2)}:${padWithZeroes(secondsLeft,2)}:${padWithZeroes(millisecondsLeft,3)}]`,width/81*80,height/81*79);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.font = '12px Arial';
        ctx.fillText(formatDistanceToNow(newYear),width/81*80,height/81*79);

        ctx.restore();

      // Last 10 seconds
      if(hoursLeft<1 && secondsLeft<=60){
        ctx.save();

        ctx.textAlign = 'center';

        ctx.textBaseline = 'middle';

        const smallFontSize = Math.round((60-this.state.sync.beat.secondsLeft)/2) * 12;
        const largeFontSize = Math.round((60-this.state.sync.beat.secondsLeft)/2) *15;
        const fontSize = this.state.sync.beat.value %2 ? largeFontSize : smallFontSize;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(secondsLeft,width/2,height/2);
        ctx.strokeText(secondsLeft,width/2,height/2);
        ctx.restore();
      }
      // }
    }

    // New Year
    if(Date.now() >= newYear && Date.now() < newYearEndVisuals){
      // Last minute
      drawRandomRectangles(ctx,this.state.sync.bar.randomSetsOfFour,0,width,height,30,9);
      for(let i =0;i<=(Math.round(this.sync.beat.progress*9));i++){
        ctx.save();
        ctx.textAlign ='left';
        ctx.textBaseline = 'top';
        ctx.font = '96px Arial';
        for(let j=0;j<=(Math.round(this.sync.beat.progress*9));j++){
          if(this.sync.bar.progress <= 0.7){

            ctx.fillStyle = 'black';
          }else{
            ctx.fillStyle ='white';
          }
          ctx.font = '96px Arial black';

          ctx.fillText('2020',width/9*i,height/9*j,width/9);
        }
        ctx.restore();
      }
    }
    // Song and Artist
    if(!(Date.now() < newYearEndVisuals && Date.now() >= newYear)){
      if(minutesLeft > 0 && minutesLeft%6=== 0){
        drawRandomRectangles(ctx,this.state.sync.bar.randomSetsOfFour,0,width,height,Math.max(1,minutesLeft%4),9);
      }

     ctx.save();
     ctx.textAlign = 'right';

     ctx.textBaseline = 'bottom';

     ctx.font = '12px Arial';
     ctx.fillStyle = 'white';
     const songPosition = Date.now() > newYear ? 78.5 : 75;
     const artistPosition = Date.now() > newYear ? 80 : 76.5;
     ctx.fillText(this.sync.state.currentlyPlaying.name,width/81*80,height/81*songPosition);
     ctx.fillText(this.sync.state.currentlyPlaying.artists[0].name,width/81*80,height/81*artistPosition);
     ctx.restore();
   }
    }
}



const padWithZeroes = (number, desiredLength=2)=>{
  const zeroesAndNumber = '000' + number;
  return('000'+number).substr(-(desiredLength));
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

const drawRandomImages = (ctx, randomSetsOfFour=[[]],randomSeedAddition, width=1000,height=1000, numberOfImages=1, gridDivision =9,images=[]) => {
  const image = new Image();
  const imageInstanceLimit = Math.min(numberOfImages, randomSetsOfFour.length)
  for(let currentIndex = 0; currentIndex<imageInstanceLimit;currentIndex++){
    // pick a random image from images to draw
    image.src = images[Math.min(images.length-1,Math.round(randomSetsOfFour[currentIndex][0]*(images.length-1)))];

    const {randomX,randomY,randomWidth,randomHeight} = randomCoordinatesAndSize(randomSetsOfFour,randomSeedAddition, currentIndex, width,height,gridDivision);
    // draw the image in a random position and size
    ctx.drawImage(image,randomX,randomY,randomWidth,randomHeight);
  }
}

const randomCoordinatesAndSize = (randomSetsOfFour, randomSeedAddition, currentIndex, width=1000, height=1000, gridDivision=9) => {
  const randomX = Math.round(Math.min(width-width/gridDivision,Math.round(randomSetsOfFour[currentIndex+randomSeedAddition][0]*gridDivision)  * width/gridDivision));
  const randomY = Math.round(Math.min(height-height/gridDivision,Math.round(randomSetsOfFour[currentIndex+randomSeedAddition][1]*gridDivision)  * height/gridDivision));
  const randomWidth = Math.round(Math.round(randomSetsOfFour[currentIndex+randomSeedAddition][2]*gridDivision+1)  * width/gridDivision);
  const randomHeight = Math.round(Math.round(randomSetsOfFour[currentIndex+randomSeedAddition][3]*gridDivision+1)  * height/gridDivision);
return {randomX,randomY,randomWidth,randomHeight};
}
const drawRandomRectangles = (ctx, randomSetsOfFour=[[]],randomSeedAddition, width=1000,height=1000, numberOfRectangles=1, gridDivision=9) => {
  for(let currentIndex = 0; currentIndex<numberOfRectangles;currentIndex++){
    const {randomX,randomY,randomWidth,randomHeight} = randomCoordinatesAndSize(randomSetsOfFour,randomSeedAddition, currentIndex, width,height,gridDivision);
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