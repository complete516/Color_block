import Utility from "../Utility";
import BaseSDK from "./BaseSDK";

export default class AppLovinSdk extends BaseSDK {

    private className: string = "org/cocos2dx/javascript/CocosMaxApplovinSdk"
    private voidParam = "()V"

    private interLoadFinish: boolean = false;

    private interTimer: any = null;

    /**加载插屏广告 */
    public LoadInterstitial() {
        let methodName = "LoadInterstitialAd"
        jsb.reflection.callStaticMethod(this.className, methodName, this.voidParam);
    }

    /**显示插屏广告 */
    public ShowInterstitialAD() {
        let methodName = "ShowInterstitialAd";
        jsb.reflection.callStaticMethod(this.className, methodName, this.voidParam);
    }

    /**插屏广告播放失败*/
    public InterstitialAdPlayFailed() {
        this.interLoadFinish = false;
        this.DelayLoadInterAd();
    }

    /**插屏广告加载完成 */
    public InterstitialLoadFinish() {
        this.interLoadFinish = true;
    }

    /**插屏广告加载失败 */
    public InterstitialAdLoadFailed() {
        this.interLoadFinish = false;
        // this.DelayLoadInterAd();
    }

    /**关闭插屏广告 */
    public CloseInterstitialAd() {
        this.interLoadFinish = false;
        // this.DelayLoadInterAd();
    }


    private DelayLoadInterAd() {
        if (this.interTimer == null) {
            this.interTimer = setInterval(this.InterTick.bind(this), 1000 * 3);
        }
    }

    private InterTick() {
        if (!this.interLoadFinish) {
            this.LoadInterstitial();
        } else {
            clearInterval(this.interTimer);
            this.interTimer = null;
        }
    }


    /**加载激励视频 */
    public LoadRewardAd() {
        Utility.CallAndroidFunc("callLoadRewardedAd");
    }

    /**显示激励广告*/
    public ShowRewardedAD() {

    }

    public ShowNativeAD() {
        // jsb.reflection.callStaticMethod(this.className, "ShowNativeAD", this.voidParam);
    }

    public HideNativeAD() {
        // jsb.reflection.callStaticMethod(this.className, "HideNativeAD", this.voidParam);
    }

    public HideBanner(): void {
        jsb.reflection.callStaticMethod(this.className,"HideBanner",this.voidParam);

    }
    
    public ShowBanner(): void {
        jsb.reflection.callStaticMethod(this.className,"ShowBanner",this.voidParam);
    }

}