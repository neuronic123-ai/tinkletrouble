const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function adapter({earned=true,consent=true,showFail=false,bannerWait=false}={}){
 const listeners=new Map();let resolveBanner,shown=0,removed=0;
 const events={Dismissed:'dismiss',FailedToShow:'failed',Rewarded:'reward'};
 const emit=(e,p)=>{for(const fn of listeners.get(e)||[])fn(p)};
 const AdMob={requestConsentInfo:async()=>({canRequestAds:consent,status:'obtained'}),initialize:async()=>{},addListener:async(e,fn)=>{if(!listeners.has(e))listeners.set(e,new Set());listeners.get(e).add(fn);return {remove:async()=>listeners.get(e).delete(fn)}},prepareRewardVideoAd:async()=>{},prepareInterstitial:async()=>{},showBanner:async()=>{shown++;if(bannerWait)await new Promise(r=>resolveBanner=r)},removeBanner:async()=>{removed++},showRewardVideoAd:()=>{queueMicrotask(()=>{if(showFail){emit('failed');return}if(earned)emit('reward',{amount:1});emit('dismiss')});return new Promise(()=>{})},showInterstitial:async()=>{queueMicrotask(()=>emit(showFail?'failed':'dismiss'))},showPrivacyOptionsForm:async()=>{}};
 const scope={window:{TT_CONFIG:{admob:{testMode:true}},dispatchEvent:()=>{}},AdMob,Capacitor:{getPlatform:()=> 'android'},App:{addListener:()=>Promise.resolve({}),exitApp:()=>{}},AdmobConsentStatus:{REQUIRED:'required'},BannerAdSize:{ADAPTIVE_BANNER:1},BannerAdPosition:{BOTTOM_CENTER:1},BannerAdPluginEvents:{SizeChanged:'size'},InterstitialAdPluginEvents:events,RewardAdPluginEvents:events,document:{documentElement:{style:{setProperty:()=>{}}}},console,Event:class{},Date,Promise};
 const source=fs.readFileSync('src/native.js','utf8').replace(/^import .*?;\n/gm,'');vm.runInNewContext(source,scope);
 return {ads:scope.window.TTAds,emit,resolve:()=>resolveBanner?.(),stats:()=>({shown,removed}),listeners};
}
test('early dismissed rewarded ad completes without granting coins',async()=>{const {ads}=adapter({earned:false});assert.equal(await ads.reward(),false);assert.equal(ads.busy,false)});
test('only actual rewarded callback grants a reward',async()=>{const {ads}=adapter();assert.equal(await ads.reward(),true);assert.equal(ads.busy,false)});
test('failed rewarded show releases the UI lock',async()=>{const {ads}=adapter({showFail:true});assert.equal(await ads.reward(),false);assert.equal(ads.busy,false)});
test('no consent prevents all ad requests',async()=>{const {ads,stats}=adapter({consent:false});assert.equal(await ads.init(),false);await ads.banner();assert.equal(stats().shown,0);assert.equal(await ads.reward(),false)});
test('interstitial waits for dismissal and enforces cooldown',async()=>{const {ads}=adapter();await ads.init();await new Promise(r=>setImmediate(r));assert.equal(await ads.interstitial(),true);assert.equal(ads.busy,false);assert.equal(await ads.interstitial(),false)});
test('entering gameplay cancels a banner waiting for consent/init',async()=>{const {ads,stats}=adapter();const banner=ads.banner();await ads.hide();await banner;assert.equal(stats().shown,0)});
