(function(root){
'use strict';
const KEY='tinkleTrouble.v1';
const themes=[
 {id:'mint',name:'Mint condition',price:0,desc:'The original porcelain paradise.',bg:'#38dbaf',tile:'#17b38e',seat:'#ffffff',water:'#167ecc',accent:'#422068',tiles:['#44e4c4','#72e7f5','#ffdf75','#a7f2d2']},
 {id:'neon',name:'Neon night',price:350,desc:'Late-night glow. Maximum drama.',bg:'#35145f',tile:'#69389a',seat:'#fbf2ff',water:'#823ed8',accent:'#efff5d',tiles:['#482075','#602590','#7a38a5','#2b426d']},
 {id:'royal',name:'Royal flush',price:650,desc:'A golden throne for your highness.',bg:'#ffd05b',tile:'#d88c1a',seat:'#fff1ba',water:'#168d9a',accent:'#60315b',tiles:['#ffe385','#ffa75f','#ffce66','#ffeaa8']},
 {id:'space',name:'Space station',price:900,desc:'One small splash for mankind.',bg:'#233779',tile:'#4356a1',seat:'#e5f5ff',water:'#0878b0',accent:'#a9ffec',tiles:['#305398','#243e7e','#4d50a7','#255c8c']},
 {id:'pink',name:'Bubblegum',price:500,desc:'Pink tiles. Impeccable taste.',bg:'#ff70be',tile:'#d84194',seat:'#fff4fd',water:'#9a46d5',accent:'#57216e',tiles:['#ff9bcf','#fb75bb','#d6a6ff','#ffb8dc']},
 {id:'ocean',name:'Deep sea',price:750,desc:'The captain goes down with the drip.',bg:'#2fc3f6',tile:'#0796c3',seat:'#eaffff',water:'#0b6cae',accent:'#263e80',tiles:['#64e4ff','#3cc9f1','#73efdb','#77d1ff']}
];
const achievements=[
 {id:'first',name:'First flush',desc:'Finish your first run.',icon:'🚽',reward:50,test:s=>s.games>=1,progress:s=>`${Math.min(s.games,1)} / 1 run`},
 {id:'score',name:'Porcelain pro',desc:'Score 1,000 in one run.',icon:'🎯',reward:100,test:s=>s.best>=1000,progress:s=>`${Math.min(s.best,1000)} / 1,000`},
 {id:'master',name:'Lord of the loo',desc:'Score 2,000 in one run.',icon:'👑',reward:200,test:s=>s.best>=2000,progress:s=>`${Math.min(s.best,2000)} / 2,000`},
 {id:'clean',name:'Floor whisperer',desc:'Finish a full timed run at 95% accuracy, flowing for at least 60% of it.',icon:'✨',reward:150,test:s=>s.cleanRuns>=1,progress:s=>`${Math.min(s.cleanRuns,1)} / 1 clean run`},
 {id:'combo',name:'Steady hands',desc:'Keep a clean stream for 10 seconds.',icon:'🧘',reward:100,test:s=>s.maxStreak>=10,progress:s=>`${Math.min(Math.floor(s.maxStreak),10)} / 10 seconds`},
 {id:'daily',name:'Clock blocker',desc:'Complete a daily challenge.',icon:'⏱',reward:150,test:s=>s.dailyWins>=1,progress:s=>`${Math.min(s.dailyWins,1)} / 1 challenge`},
 {id:'wardrobe',name:'Throne collector',desc:'Own three bathroom themes.',icon:'🛍',reward:100,test:s=>s.owned.length>=3,progress:s=>`${Math.min(s.owned.length,3)} / 3 themes`},
 {id:'regular',name:'Frequent flusher',desc:'Finish 20 runs.',icon:'🏆',reward:200,test:s=>s.games>=20,progress:s=>`${Math.min(s.games,20)} / 20 runs`}
];
function initial(){return {version:1,coins:0,best:0,bestAccuracy:0,games:0,cleanRuns:0,maxStreak:0,dailyWins:0,owned:['mint'],theme:'mint',mops:1,shields:0,unlocked:[],settings:{music:true,sound:true,haptics:true,motion:false},reward:{last:'',streak:0},daily:{day:'',best:0,claimed:false}}}
function finite(v,d=0){return typeof v==='number'&&Number.isFinite(v)&&v>=0?v:d}
function sanitize(raw){const d=initial();if(!raw||raw.version!==1)return d;for(const k of ['coins','best','bestAccuracy','games','cleanRuns','maxStreak','dailyWins','mops','shields'])d[k]=finite(raw[k],d[k]);d.coins=Math.floor(d.coins);d.bestAccuracy=Math.min(100,d.bestAccuracy);d.owned=Array.from(new Set(['mint',...(Array.isArray(raw.owned)?raw.owned:[]).filter(id=>themes.some(t=>t.id===id))]));d.theme=d.owned.includes(raw.theme)?raw.theme:'mint';d.unlocked=(Array.isArray(raw.unlocked)?raw.unlocked:[]).filter(id=>achievements.some(a=>a.id===id));for(const k of Object.keys(d.settings))if(typeof raw.settings?.[k]==='boolean')d.settings[k]=raw.settings[k];if(raw.reward&&/^\d{4}-\d{2}-\d{2}$/.test(raw.reward.last)){d.reward={last:raw.reward.last,streak:Math.floor(finite(raw.reward.streak))}}if(raw.daily&&/^\d{4}-\d{2}-\d{2}$/.test(raw.daily.day)){d.daily={day:raw.daily.day,best:Math.floor(finite(raw.daily.best)),claimed:raw.daily.claimed===true}}return d}
function dayKey(date=new Date()){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')}
function previousDay(date=new Date()){const p=new Date(date);p.setDate(p.getDate()-1);return dayKey(p)}
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function daily(date=new Date()){const day=dayKey(date),seed=hash(day),i=seed%3;return {day,seed,seconds:[30,40,35][i],target:[1000,1400,1100][i],name:['Gust buster','Wobble Wednesday (on any day)','The quick drip'][i],desc:['Thirty seconds. A cheeky crosswind. Keep the stream in the bowl.','The seat has a mind of its own. Follow the rhythm and keep it tidy.','A faster moving bowl and a shorter clock. Steady hands win.'][i],variant:i}}
const rewards=[50,75,100,125,150,200,350];
function rewardInfo(s,date=new Date()){const today=dayKey(date);const claimed=s.reward.last>=today;const streak=claimed?s.reward.streak:(s.reward.last===previousDay(date)?s.reward.streak+1:1);const index=Math.max(0,(streak-1)%7);return {claimed,streak,index,amount:rewards[index]}}
function claim(s,date=new Date()){const r=rewardInfo(s,date);if(r.claimed)return 0;s.coins+=r.amount;s.reward={last:dayKey(date),streak:r.streak};return r.amount}
function unlock(s){const fresh=[];for(const a of achievements)if(!s.unlocked.includes(a.id)&&a.test(s)){s.unlocked.push(a.id);s.coins+=a.reward;fresh.push(a)}return fresh}
function purchaseTheme(s,id){const t=themes.find(t=>t.id===id);if(!t)return false;if(s.owned.includes(id)){s.theme=id;return true}if(s.coins<t.price)return false;s.coins-=t.price;s.owned.push(id);s.theme=id;return true}
function hit(x,y,tx,ty,rx=65,ry=84){return ((x-tx)/rx)**2+((y-ty)/ry)**2<=1}
function target(t,mode='classic',seed=0,variant=0){const phase=(seed%628)/100;const level=Math.min(4,Math.floor(t/10));const speed=mode==='daily'?[1.1,1.5,1.9][variant]:.75+level*.18;const amplitude=mode==='daily'?[66,88,100][variant]:32+level*15;return {x:220+Math.sin(t*speed+phase)*amplitude,y:257+Math.cos(t*speed*.7+phase)*18,wind:mode==='daily'&&variant===0?Math.sin(t*1.7+phase)*29:(t>15?Math.sin(t*1.1)*Math.min(30,(t-15)*1.5):0),level}}
class Round{
 constructor(mode='classic',challenge=daily()){this.mode=mode;this.challenge=challenge;this.duration=mode==='daily'?challenge.seconds:45;this.elapsed=0;this.score=0;this.mess=0;this.hitTime=0;this.flowTime=0;this.streak=0;this.maxStreak=0;this.over=false;this.shield=false;this.shieldTime=0;this.x=220;this.y=257;this.coins=0}
 update(dt,flow){if(this.over)return;dt=Math.min(Math.max(0,dt),this.duration-this.elapsed);this.elapsed+=dt;const t=target(this.elapsed,this.mode,this.challenge.seed*(this.mode==='daily'),this.challenge.variant);this.shieldTime=Math.max(0,this.shieldTime-dt);if(flow){this.flowTime+=dt;const good=hit(this.x+t.wind,this.y,t.x,t.y);if(good){this.hitTime+=dt;this.streak+=dt;this.maxStreak=Math.max(this.maxStreak,this.streak);this.score+=dt*60*Math.min(4,1+Math.floor(this.streak/3));this.mess=Math.max(0,this.mess-dt*.8)}else{this.streak=0;if(this.shieldTime===0)this.mess+=dt*11}}else this.streak=0;if(this.mess>=100&&this.shield){this.shield=false;this.mess=40;this.shieldTime=3}if(this.elapsed>=this.duration||this.mess>=100){this.over=true;this.score=Math.floor(this.score);this.coins=Math.floor(this.score/20)}return t}
 get accuracy(){return this.flowTime>0?Math.round(this.hitTime/this.flowTime*100):0}
 get combo(){return Math.min(4,1+Math.floor(this.streak/3))}
}
function settle(s,r,date=new Date()){s.games++;s.best=Math.max(s.best,Math.floor(r.score));s.bestAccuracy=Math.max(s.bestAccuracy,r.accuracy);s.maxStreak=Math.max(s.maxStreak,r.maxStreak);s.coins+=r.coins;if(r.elapsed>=r.duration&&r.accuracy>=95&&r.flowTime>=r.duration*.6)s.cleanRuns++;let dailyBonus=0;if(r.mode==='daily'){if(s.daily.day!==r.challenge.day)s.daily={day:r.challenge.day,best:0,claimed:false};s.daily.best=Math.max(s.daily.best,Math.floor(r.score));if(r.score>=r.challenge.target&&!s.daily.claimed&&r.challenge.day===dayKey(date)){s.daily.claimed=true;s.dailyWins++;dailyBonus=200;s.coins+=dailyBonus}}return {dailyBonus,achievements:unlock(s)}}
const api={KEY,initial,sanitize,dayKey,previousDay,hash,daily,rewards,rewardInfo,claim,unlock,purchaseTheme,themes,achievements,hit,target,Round,settle};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TTCore=api;
})(typeof window!=='undefined'?window:globalThis);
