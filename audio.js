/* Original procedural audio. No external recordings or copyright dependencies. */
window.TTAudio=class{
 constructor(settings){this.settings=settings;this.ctx=null;this.timer=null;this.beat=0;this.active=false;this.nodes=new Set();this.stream=null;this.splashBuffer=null}
 async unlock(){try{if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')await this.ctx.resume()}catch{} }
 tone(freq,duration=.12,type='sine',volume=.04,end=freq){if(!this.ctx||this.ctx.state!=='running')return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),now=this.ctx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,now);o.frequency.exponentialRampToValueAtTime(Math.max(1,end),now+duration);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(now+duration);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);o.disconnect();g.disconnect()}}
 fx(name){if(!this.settings.sound)return;const effects={tap:[440,.06,'sine',.035,660],coin:[740,.2,'sine',.06,1100],flush:[180,.6,'sawtooth',.025,25],mop:[240,.3,'triangle',.045,640],start:[220,.2,'square',.025,880]};this.tone(...(effects[name]||effects.tap))}

 /* Continuous spray + broad, irregular impact noise. No pitched sipping/plop loop. */
 makeSplashBuffer(){
  const rate=this.ctx.sampleRate,buffer=this.ctx.createBuffer(1,rate*3,rate),data=buffer.getChannelData(0);let pulse=0,soft=0;
  for(let i=0;i<data.length;i++){
   const white=Math.random()*2-1;soft=.8*soft+.2*white;
   if(Math.random()<85/rate)pulse=Math.max(pulse,.45+Math.random()*.55);
   pulse*=Math.exp(-1/(rate*.014));
   const bed=.26+.055*Math.sin(i/rate*19)+.035*Math.sin(i/rate*37);
   data[i]=(white*.75+soft*.25)*(bed+pulse*.7);
  }
  // Crossfade the loop seam so long holds do not produce a click every 3 seconds.
  const fade=Math.floor(rate*.035);for(let i=0;i<fade;i++){const blend=i/fade;data[i]=data[i]*blend+data[data.length-fade+i]*(1-blend)}
  return buffer;
 }
 flow(holding,inBowl=true){
  if(!holding||!this.settings.sound||!this.ctx||this.ctx.state!=='running'){this.stopFlow();return}
  if(!this.stream){
   if(!this.splashBuffer)this.splashBuffer=this.makeSplashBuffer();
   const source=this.ctx.createBufferSource(),high=this.ctx.createBiquadFilter(),spray=this.ctx.createBiquadFilter(),body=this.ctx.createBiquadFilter(),sprayGain=this.ctx.createGain(),bodyGain=this.ctx.createGain(),master=this.ctx.createGain();
   source.buffer=this.splashBuffer;source.loop=true;
   high.type='highpass';high.frequency.value=350;high.Q.value=.5;
   spray.type='lowpass';spray.frequency.value=5400;spray.Q.value=.65;
   body.type='bandpass';body.frequency.value=950;body.Q.value=.7;
   source.connect(high);high.connect(spray);high.connect(body);spray.connect(sprayGain);body.connect(bodyGain);sprayGain.connect(master);bodyGain.connect(master);master.connect(this.ctx.destination);
   master.gain.setValueAtTime(0,this.ctx.currentTime);master.gain.linearRampToValueAtTime(.25,this.ctx.currentTime+.025);
   const nodes=[source,high,spray,body,sprayGain,bodyGain,master];source.onended=()=>{for(const n of nodes)n.disconnect()};
   this.stream={source,master,sprayGain,bodyGain,good:null};source.start();
  }
  if(this.stream.good!==inBowl){const now=this.ctx.currentTime;this.stream.sprayGain.gain.setTargetAtTime(inBowl ? 0.52 : 0.8,now,.04);this.stream.bodyGain.gain.setTargetAtTime(inBowl ? 0.65 : 0.14,now,.04);this.stream.good=inBowl}
 }
 stopFlow(){if(!this.stream)return;const stream=this.stream;this.stream=null;try{const now=this.ctx.currentTime;stream.master.gain.cancelScheduledValues(now);stream.master.gain.setTargetAtTime(0,now,.005);stream.source.stop(now+.035)}catch{try{stream.source.disconnect();stream.master.disconnect()}catch{}}}
 start(){this.stop();this.active=true;if(!this.settings.music)return;const tune=[261.63,0,329.63,392,349.23,0,329.63,293.66,261.63,392,523.25,0,440,349.23,293.66,0];this.timer=setInterval(()=>{if(!this.settings.music)return;const n=tune[this.beat%tune.length];if(n)this.tone(n,.16,'triangle',.024);if(this.beat%2===0)this.tone(this.beat%8<4?130.81:98,.16,'square',.012);this.tone(70,.07,'sine',.015,28);this.beat++},220)}
 stop(){this.stopFlow();clearInterval(this.timer);this.timer=null;this.active=false;for(const n of this.nodes){try{n.stop()}catch{}}this.nodes.clear()}
};
