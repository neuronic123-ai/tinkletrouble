import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AdMob, AdmobConsentStatus, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, InterstitialAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';
const config=window.TT_CONFIG.admob;
let initPromise,interstitialReady=false,rewardReady=false,bannerVisible=false,bannerWanted=false,lastInterstitial=0,loadI,loadR;
const inset=h=>document.documentElement.style.setProperty('--ad-inset',`${h}px`);
const ads={native:Capacitor.getPlatform()==='android',ready:false,busy:false,status:'Starting ads…',
 init(){if(initPromise)return initPromise;initPromise=(async()=>{if(!ads.native)return false;try{
  let consent=await AdMob.requestConsentInfo();
  if(consent.isConsentFormAvailable&&consent.status===AdmobConsentStatus.REQUIRED)consent=await AdMob.showConsentForm();
  if(!consent.canRequestAds){ads.status='Ads are unavailable until consent is resolved.';return false}
  await AdMob.initialize({initializeForTesting:config.testMode});
  await AdMob.addListener(BannerAdPluginEvents.SizeChanged,s=>{if(bannerVisible)inset(s.height+12)});
  ads.ready=true;ads.status='Ads ready';void preload();return true;
 }catch(e){ads.status='Ads unavailable right now. Try again later.';console.warn('AdMob initialization:',e.message);return false}})();const pending=initPromise;pending.then(()=>{if(!ads.ready)initPromise=null});return pending},
 async banner(){bannerWanted=true;if(!await ads.init()||!bannerWanted||bannerVisible)return;try{bannerVisible=true;inset(80);await AdMob.showBanner({adId:config.bannerId,adSize:BannerAdSize.ADAPTIVE_BANNER,position:BannerAdPosition.BOTTOM_CENTER,isTesting:config.testMode,margin:0});if(!bannerWanted)await ads.hide()}catch{bannerVisible=false;inset(0)}},
 async hide(){bannerWanted=false;bannerVisible=false;inset(0);if(ads.ready)try{await AdMob.removeBanner()}catch{}},
 async interstitial(){if(!ads.ready||ads.busy||!interstitialReady||Date.now()-lastInterstitial<90000)return false;ads.busy=true;interstitialReady=false;const listeners=[];try{
  let resolveEnd;const ended=new Promise(resolve=>resolveEnd=resolve);
  listeners.push(await AdMob.addListener(InterstitialAdPluginEvents.Dismissed,()=>resolveEnd(true)));
  listeners.push(await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow,()=>resolveEnd(false)));
  // Showing resolves before dismissal; gameplay starts only after the close event.
  Promise.resolve(AdMob.showInterstitial()).catch(()=>resolveEnd(false));
  const shown=await ended;if(shown)lastInterstitial=Date.now();return shown;
 }catch{return false}finally{for(const l of listeners)await l.remove();ads.busy=false;void loadInterstitial()}},
 async reward(){if(!await ads.init()||ads.busy)return false;ads.busy=true;const listeners=[];let earned=false;try{
  if(!rewardReady)await loadReward();if(!rewardReady)return false;rewardReady=false;
  let resolveEnd;const ended=new Promise(resolve=>resolveEnd=resolve);
  listeners.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded,r=>{if(r.amount>0)earned=true}));
  listeners.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed,()=>resolveEnd()));
  listeners.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow,()=>resolveEnd()));
  // On Android the show promise may never resolve if the player closes early.
  // Dismissal controls completion; only the SDK Rewarded event grants coins.
  Promise.resolve(AdMob.showRewardVideoAd()).catch(()=>resolveEnd());
  await ended;return earned;
 }catch{return earned}finally{for(const l of listeners)await l.remove();ads.busy=false;void loadReward()}
 },
 async privacy(){if(!ads.native)return false;try{await AdMob.showPrivacyOptionsForm();await ads.hide();ads.ready=false;initPromise=null;await ads.init();return true}catch{return false}}
};
async function loadInterstitial(){if(loadI)return loadI;loadI=(async()=>{try{await AdMob.prepareInterstitial({adId:config.interstitialId,isTesting:config.testMode});interstitialReady=true}catch{interstitialReady=false}})();try{await loadI}finally{loadI=null}}
async function loadReward(){if(loadR)return loadR;loadR=(async()=>{try{await AdMob.prepareRewardVideoAd({adId:config.rewardedId,isTesting:config.testMode});rewardReady=true}catch{rewardReady=false}})();try{await loadR}finally{loadR=null}}
async function preload(){await Promise.allSettled([loadInterstitial(),loadReward()])}
window.TTAds=ads;
window.TTNative={exit:()=>App.exitApp()};
App.addListener('backButton',()=>window.TTGame?.back()).catch(()=>{});
App.addListener('appStateChange',({isActive})=>{if(!isActive)window.TTGame?.pause()}).catch(()=>{});
window.dispatchEvent(new Event('tt:native-ready'));
