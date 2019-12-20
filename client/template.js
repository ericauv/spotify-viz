import Visualizer from './classes/visualizer'

export default class Template extends Visualizer {
  constructor () {
    super({ volumeSmoothing: 100 })
    this.state={
      i:0
    }
  }
  hooks () {
    this.sync.on('tatum', tatum => {

    })

    this.sync.on('segment', segment => {

    })

    this.sync.on('beat', beat => {
      this.state.i+=50;
    })

    this.sync.on('bar', bar => {

    })

    this.sync.on('section', section => {

    })
  }

  paint ({ ctx, height, width, now }) {
    console.log(this.state.i)
    ctx.font='20px Arial';
    // ctx.strokeText('hello', this.state.i,this.state.i);
    ctx.strokeText(this.sync.state.currentlyPlaying.name, this.state.i,this.state.i);
    // this.sync.volume
    // this.sync.tatum
    // this.sync.segment
    // this.sync.beat
    // this.sync.bar
    // this.sync.section
  }
}