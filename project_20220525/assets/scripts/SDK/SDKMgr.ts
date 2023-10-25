

import Consts from "../Consts/Consts";
import { GameState, GameType, Platform } from "../Consts/Define";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import Utility from "../Utility";

import AppLovinSdk from "./AppLovinSdk";
import BaseSDK from "./BaseSDK";
import WebSDK from "./WebSDK";


/**激励视频看完回调 */
window["RewardADFinishCallback"] = function RewardADFinishCallback() {
    SDKMgr.Instance.RewardADFinishCallback();
}

//激励视频失败回调
window["RewardADFailedCallback"] = function RewardADFailedCallback() {
    SDKMgr.Instance.RewardADFailedCallback();
}

//关闭插屏广告
window["CloseInterstitialAd"] = function CloseInterstitialAd() {
    SDKMgr.Instance.CloseInterstitialAd();
}

//插屏广告加载失败
window["InterstitialAdLoadFailed"] = function InterstitialAdLoadFailed() {
    SDKMgr.Instance.InterstitialAdLoadFailed();
}

//插屏广告播放失败
window["InterstitialAdPlayFailed"] = function InterstitialAdPlayFailed() {
    SDKMgr.Instance.InterstitialAdPlayFailed();
}

//插屏广告加载完成
window["InterstitialLoadFinish"] = function InterstitialLoadFinish() {
    SDKMgr.Instance.InterstitialLoadFinish();
}

window["SetGoogleAdvertId"] = function SetGoogleAdvertId(gaid: string) {
    cc.sys.localStorage.setItem(Consts.GameName + "gaid", gaid);
    GameEventMgr.Instance.EmitEvent(Consts.Event.ESetGAID, gaid);
}

window["SignOutGoogle"] = function SignOutGoogle() {
    Game.Instance.Cache.IsLogin = false;
    GameEventMgr.Instance.EmitEvent(Consts.Event.ESignOutGoogle);
}

window["SignInSuccess"] = function SignInSuccess() {
    Game.Instance.Cache.IsLogin = true;
    GameEventMgr.Instance.EmitEvent(Consts.Event.ESignGoogle);
}


/**SDK管理 */
export default class SDKMgr {
    private static instance: SDKMgr = null;
    private sdk: BaseSDK = null;
    private prevTime: number = 0;

    public static get Instance() {
        if (SDKMgr.instance == null) {
            SDKMgr.instance = new SDKMgr();
        }
        return SDKMgr.instance;
    }

    /**初始化*/
    public Init() {
        switch (Consts.GamePlatform) {
            case Platform.Web:
                this.sdk = new WebSDK();
                break;
            case Platform.Android:
                this.sdk = new AppLovinSdk();
                break;
        }
    }

    /**固定时间显示插屏广告 */
    public FixedTimeShowInterstitial() {
        let current = Utility.TimeStamp();
        if (this.prevTime == 0) {
            this.prevTime = current;
        }

        if ((current - this.prevTime) / 1000 >= Consts.Constant.FixedTimeInterstitial) {
            this.ShowInterstitialAD();
            // this.prevTime = current;
        }
    }

    /**显示插屏广告 */
    public ShowInterstitialAD() {
        this.sdk?.ShowInterstitialAD();
    }

    /**加载插屏广告 */
    public LoadInterstitialAD() {
        this.sdk?.LoadInterstitial();
    }

    /**加载激励视频广告 */
    public LoadRewardedAD() {
        this.sdk?.LoadRewardAd();
    }

    /**显示激励广告*/
    public ShowRewardedAD(success?: Function, failed?: Function) {
        this.sdk?.ReadyShowRewardedAD(success, failed);
    }

    /**激励视频看完回调- */
    public RewardADFinishCallback() {
        if (this.sdk) {
            this.sdk.RewardADFinish();
        }
    }

    /**激励视频失败回调 */
    public RewardADFailedCallback() {
        if (this.sdk) {
            this.sdk.RewardADFailed();
        }
    }


    /**关闭插屏广告 */
    public CloseInterstitialAd() {
        this.sdk.CloseInterstitialAd();
        this.prevTime = Utility.TimeStamp();
        Utility.DebugLog("CloseInterstitialA" + this.prevTime.toString());
    }

    /**插屏广告加载失败 */
    public InterstitialAdLoadFailed() {
        this.sdk.InterstitialAdLoadFailed();
    }

    /**插屏广告加载完成 */
    public InterstitialLoadFinish() {
        this.sdk.InterstitialLoadFinish();
    }


    /**插屏广告播放失败*/
    public InterstitialAdPlayFailed() {
        this.sdk.InterstitialAdPlayFailed();
    }

    public ShowNativeAD() {
        this.sdk.ShowNativeAD();
    }

    public HideNativeAD() {
        this.sdk.HideNativeAD();
    }

    /**显示Banner广告 */
    public ShowBanner() {
        this.sdk.ShowBanner();
    }

    /**隐藏Banner广告 */
    public HideBanner() {
        this.sdk.HideBanner();
    }

    /**视频广告统计 */




    /**发送事件 打点
     * @param eventID 事件ID
     * @param params 事件参数 
     */
    public SendEvent(eventID: string, params: { from: string, state: string }): void {
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "UmengSendEvent";
            jsb.reflection.callStaticMethod(className, methodName, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", eventID, params["from"], params["state"]);
        }
    }

    /**田字格消除 */
    public RectangleEliminate() {
        this.SendEvent("RectangleEliminate", { from: "消除事件", state: "田字格消除" });
    }

    public SendNormalModelScore(score: number) {
        let key = ""
        let baseScore = 100;
        let length = 7;
        let prev = 0;
        if (score <= (length - 1) * 200 + baseScore) {
            for (let i = 0; i < length; i++) {
                if (score <= i * 200 + baseScore) {
                    key = `${prev + Math.min(i, 1)}-${i * 200 + baseScore}`;
                    break;
                }
                prev = i * 200 + baseScore;
            }
        } else {
            key = `${(length - 1) * 200 + baseScore + 1}`;
        }

        this.UmengKeyValue("NormalMode", key, key);
    }


    /**
     * 每日挑战 事件统计
     * @type 0 进入 1成功 2 失败
    */
    public DailyChallengesEvent(type: number, month: number, day: number) {
        let prefix = "";
        if (type == 0) {
            prefix = "Enter_";
        } else if (type == 1) {
            prefix = "Complete_"
        } else if (type == 2) {
            prefix = "Failed_"
        }

        // let data = { from: prefix + `day_${day + 1}`, state: "每日挑战" }
        // this.SendEvent("DailyChallenges_" + month.toString(), data)
        let key = `day_${day + 1}`;
        let value = prefix + `day_${day + 1}`
        let evnetID = "DailyChallenges_" + month.toString();
        this.UmengKeyValue(evnetID, key, value);
        cc.log("DailyChallengesEvent", key, value);
    }



    /**每日挑战完成时间 */
    public DailyChallengesFinishTime(month: number, day: number, startTime: number) {
        let endTime = Utility.TimeStamp();
        let second = (endTime - startTime) / 1000;
        let ds = 3600;
        if (second > ds) {
            second = ds;
        }

        let minute = Math.floor(second / 60);
        let key = `${month}-${day + 1}`;
        let value = minute.toString() + "min";
        this.UmengKeyValue("DailyChallenges_Time_" + month.toString(), key, value);
        cc.log("DailyChallenges_Time_" + month.toString(), key, value);
    }

    /**时间挑战完成时间 */
    public EventChallengesFinishTime(index: number, item: string, startTime: number) {
        let endTime = Utility.TimeStamp();
        let second = (endTime - startTime) / 1000;
        let ds = 3600;
        if (second > ds) {
            second = ds;
        }

        let minute = Math.floor(second / 60);
        let key = item + "_FinishTime";
        let value = minute.toFixed();
        let evnetID = "Event_Challenge_" + (index + 1).toString();
        this.UmengKeyValue(evnetID, key, value);
    }


    /**
     * 
     * @param type  0 进入 1成功 2 失败
     * @param index 
     * @param item 
     */
    public EventChallengesEvent(type: number, index: number, item: string) {
        let prefix = "";
        if (type == 0) {
            prefix = "Enter_";
        } else if (type == 1) {
            prefix = "Complete_"
        } else if (type == 2) {
            prefix = "Failed_"
        }

        let key = `${item}`;
        let value = prefix + item
        let evnetID = "Event_Challenge_" + (index + 1).toString();
        this.UmengKeyValue(evnetID, key, value);
        cc.log(evnetID, key, value);
    }

    public UmengKeyValue(eventID: string, key: string, value: string) {
        if (Consts.GamePlatform == Platform.Android) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "UmengEventKeyValue";
            jsb.reflection.callStaticMethod(className, methodName, "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", eventID, key, value);
        }
    }

    /**
     * 
     * @param model 游戏模式
     * @param gameState 游戏状态
     */
    public GameModelCensus(model: GameType, gameState: GameState) {
        let eventId = ""
        let key = ""
        if (model == GameType.DailyType) {
            eventId = "DailyModel";
        } else if (model == GameType.EventType) {
            eventId = "EventModel";
        } else if (model == GameType.NormalType) {
            eventId = "NormalMode";
        }

        if (gameState == GameState.Open) {
            key = "Open";
        } else if (gameState == GameState.Failed) {
            key = "Failed";
        } else if (gameState == GameState.Success) {
            key = "Success";
        }


        this.UmengKeyValue(eventId, key, key + "_num");
    }

    /**发送用户首次打开事件 */
    public SendOpenFirstEvent() {
        let eventID = "OpenFirst";
        this.SendEvent(eventID, { from: "打开游戏", state: "用户首次打开游戏" });
    }

    public EnterRankList() {
        let eventId = "EnterRankList";
        this.SendEvent(eventId, { from: "进入排行榜", state: "用户打开排行榜" });
    }
}