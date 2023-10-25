import Consts from "../Consts/Consts";
import BaseView from "../FGUI/BaseView";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";

const { ccclass, property } = cc._decorator;
/**事件模式游戏状态选择 */
@ccclass

export default class EventGameStateView extends BaseView {
    private trans: fgui.Transition = null;
    private cancelBtn: fgui.GButton = null;
    private resetBtn: fgui.GButton = null;
    private continueBtn: fgui.GButton = null;

    protected InitUI(): void {
        this.trans = this.View.getTransition("t0");
        let com = this.View.getChild("n0").asCom;
        this.cancelBtn = com.getChild("n8").asButton;
        this.resetBtn = com.getChild("n16").asButton;
        this.continueBtn = com.getChild("n7").asButton;

        this.View.getChild("BackGround").on(fgui.Event.TOUCH_BEGIN, this.OnTouchBegin.bind(this), this);
    }

    protected InitEvent(): void {
        this.cancelBtn.onClick(this.OnClickCloseBtn.bind(this), this);
        this.resetBtn.onClick(this.OnClickResetGameBtn.bind(this), this);
        this.continueBtn.onClick(this.OnClickContinueBtn.bind(this), this);
    }

    private OnTouchBegin() {
        this.Close();
    }

    private OnClickCloseBtn() {
        this.Close();
    }

    private OnClickResetGameBtn() {
        cc.log("重新开始");
        Game.Instance.Clear();
        this.PlayGame();
    }

    private OnClickContinueBtn() {
        this.PlayGame();
    }

    private PlayGame() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.EStartPlayEventGame);
        this.Close();
    }

    protected OnShow(): void {
        this.trans.play();
    }
}