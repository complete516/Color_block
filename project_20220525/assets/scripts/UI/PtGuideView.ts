import Consts from "../Consts/Consts";
import ColourBarEffect from "../Effect/ColourBarEffect";
import BaseView from "../FGUI/BaseView";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";

const { ccclass, property } = cc._decorator;
/**新手引导 */
@ccclass
export default class PtGuideView extends BaseView {

    private contioueBtn: fgui.GButton = null;
    private resetBtn: fgui.GButton = null;

    private colourNode: cc.Node = null;

    protected InitUI(): void {
        this.contioueBtn = this.View.getChild("n4").asButton;
        this.resetBtn = this.View.getChild("n5").asButton;
    }

    protected InitEvent(): void {
        this.contioueBtn.onClick(this.BackMain.bind(this), this);
        this.resetBtn.onClick(this.ResetGuide.bind(this), this);
    }

    protected OnShow(): void {
        let obj = Game.Instance.EffectPool.Pop(Consts.ResName.ColourBar);
        obj.position = cc.v3(cc.winSize.width / 2, 200);
        this.View.node.addChild(obj);
        let effect = obj.getComponent(ColourBarEffect)
        this.schedule(() => {
            effect.RepeatPlay();
        }, 4);
        this.colourNode = obj;
    }

    private BackMain() {
        cc.log("backMain")
        this.Close();
        // GameEventMgr.Instance.EmitEvent(Consts.Event.EFinishChessGuid);
        GameEventMgr.Instance.EmitEvent(Consts.Event.EBackMainView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    private ResetGuide() {
        Game.Instance.GameGuide.NormalGuideStep = 0;
        GameEventMgr.Instance.EmitEvent(Consts.Event.EResetChessGuidStep);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();
    }

    public ViewClose(): void {
        Game.Instance.EffectPool.Push(Consts.ResName.ColourBar, this.colourNode);
        this.unscheduleAllCallbacks()
    }
}