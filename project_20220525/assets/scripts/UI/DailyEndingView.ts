import Consts from "../Consts/Consts";
import { GameType } from "../Consts/Define";
import GameCache from "../Data/GameCache";
import BaseView from "../FGUI/BaseView";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import SDKMgr from "../SDK/SDKMgr";

const { ccclass, property } = cc._decorator;
/**游戏结算 */
@ccclass
export default class DailyEndingView extends BaseView {

    private controll: fgui.Controller = null;
    private progress: fgui.GProgressBar = null;
    private continueBtn: fgui.GButton = null;
    private resetBtn: fgui.GButton = null;
    private dailyBtn: fgui.GButton = null;
    private progressText: fgui.GTextField = null;
    private finishText: fgui.GTextField = null;

    protected InitUI(): void {
        this.controll = this.View.getController("c1");
        this.progress = this.View.getChild("n6").asProgress;
        this.continueBtn = this.View.getChild("n2").asButton;
        this.resetBtn = this.View.getChild("n5").asButton;
        this.dailyBtn = this.View.getChild("n10").asButton;
        this.finishText = this.View.getChild("n3").asTextField;
        this.progressText = this.View.getChild("n8").asTextField;
    }

    protected InitEvent(): void {
        this.continueBtn.onClick(this.OnClickContinueBtn.bind(this), this);
        this.dailyBtn.onClick(this.OnClickDailyBtn.bind(this), this);
        this.resetBtn.onClick(this.OnClickResetBtn.bind(this), this);
    }

    protected OnShow(): void {
        let maxScore = Game.Instance.GetTargetScore();
        let currScore = Game.Instance.GetCurrentScore();
        if (currScore >= maxScore) {
            this.controll.setSelectedIndex(0)
        } else {
            this.controll.setSelectedIndex(1);
        }
        this.UpdateProgress(currScore, maxScore);

        let date = Game.Instance.Cache.SelectDate;
        this.finishText.text = `You have completed the daily\nchallenge for ${Consts.Months[date.month - 1]} ${date.day + 1}`;
        Game.Instance.Clear();
        this.PlayWhiteAnim();

    }

    /**更新进度*/
    private UpdateProgress(score: number, maxScore: number) {
        let value = Math.floor((score / maxScore) * 100);
        fgui.GTween.to(0, value, 1.5).onUpdate((t: fgui.GTweener) => {
            this.progressText.text = `${Math.floor(t.value.x)}% Completed`;
            this.progress.value = t.value.x;
        });
    }

    /**点击继续*/
    private OnClickContinueBtn() {
        let selectData = Game.Instance.ContinueDailyChallenges();
        Game.Instance.Cache.SelectDate = selectData;
        GameEventMgr.Instance.EmitEvent(Consts.Event.EBackMainView);
        this.Close();
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    /**每日挑战 */
    private OnClickDailyBtn() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.EBackMainView);
        this.Close();
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    /**重新 */
    private OnClickResetBtn() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.EStartNewGame);
        this.Close();
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    public ViewClose(): void {
        SDKMgr.Instance.FixedTimeShowInterstitial();
    }
}