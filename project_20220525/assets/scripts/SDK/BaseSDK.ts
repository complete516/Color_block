

export default class BaseSDK {
    private rewardSuccess: Function = null;
    private rewardFailed: Function = null;

    /**加载插屏广告 */
    LoadInterstitial(): void {

    }

    /**显示插屏广告 */
    ShowInterstitialAD(): void {

    }

    /**加载激励视频 */
    LoadRewardAd(): void {

    }

    /**显示激励广告*/
    ReadyShowRewardedAD(success: Function, failed: Function): void {
        this.rewardFailed = failed;
        this.rewardSuccess = success;
        this.ShowRewardedAD();
    }

    /**显示激励广告*/
    ShowRewardedAD(): void {

    }

    RewardADFinish() {
        this.rewardSuccess && this.rewardSuccess();
    }

    RewardADFailed() {
        this.rewardFailed && this.rewardFailed();
        this.ResetRewardAd();
    }

    /**激励视屏失败了需要的处理  */
    protected ResetRewardAd() {

    }

    /**插屏广告播放失败*/
    public InterstitialAdPlayFailed() {

    }

    /**插屏广告加载完成 */
    public InterstitialLoadFinish() {

    }

    /**插屏广告加载失败 */
    public InterstitialAdLoadFailed() {

    }

    /**关闭插屏广告 */
    public CloseInterstitialAd() {

    }

    public ShowNativeAD() {

    }

    public HideNativeAD() {

    }

    public ShowBanner() {

    }

    public HideBanner() {

    }

}