/* Browser play is ad-free. Native adapter is installed by native.js in www. */
window.TTAds={native:false,ready:false,busy:false,status:'Ads are available in the Android app.',
 async init(){return false},async banner(){},async hide(){},async interstitial(){return false},async reward(){return false},async privacy(){return false}};
if(window.Capacitor?.isNativePlatform?.()){
 const script=document.createElement('script');script.src='native.js';script.onerror=()=>{window.TTAds.status='Ads could not start. The game remains playable.'};document.head.appendChild(script);
}
