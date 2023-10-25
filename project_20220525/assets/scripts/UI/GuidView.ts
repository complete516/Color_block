import Consts from "../Consts/Consts";
import BaseView from "../FGUI/BaseView";
import FGUIMgr from "../FGUI/FGUIMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";

const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass

export default class GuidView extends cc.Component {

    @property(cc.Mask)
    private mainMask: cc.Mask = null;

    @property(cc.Mask)
    private handMask: cc.Mask = null;

    @property(cc.Node)
    private maskNode: cc.Node = null;

    @property(cc.Animation)
    private anim: cc.Animation = null;

    @property(cc.Node)
    private hand: cc.Node = null;

    @property(cc.Animation)
    private lineAnim: cc.Animation = null;

    @property(cc.Animation)
    private rectangleAnim: cc.Animation = null;

    @property(cc.Node)
    private Trans: cc.Node = null;

    @property(cc.Mask)
    private mask3: cc.Mask = null;

    @property(cc.Mask)
    private mask4: cc.Mask = null;

    private secondCount: number = 0;
    private isStart: boolean = false;

    @property(cc.Node)
    private root: cc.Node = null;




    protected onLoad(): void {
        this.hand.active = false;
    }

    protected start(): void {

        this.isStart = false;
        this.hand.active = false;
        GameEventMgr.Instance.AddEvent(Consts.Event.EFinishChessGuidStep, this.FinishChessGuidStep.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ETouchMoveBlock, this.TouchMove.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ETouchEndBlock, this.TouchEnd.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EResetChessGuidStep, this.ResetChessGuidStep.bind(this), this);
        this.mask3.enabled = false;
        this.mask4.enabled = false;
        this.Action();
    }

    private TouchMove() {
        this.isStart = false;
        this.hand.active = false;
        this.anim.stop();
    }

    private TouchEnd() {
        this.secondCount = 0;
        this.isStart = true;
    }

    /**重新开始*/
    private ResetChessGuidStep() {
        FGUIMgr.Instance.ShowUI(Consts.ResName.GameView);
        Game.Instance.GameGuide.NormalGuideStep = 0;
        this.node.active = true;
        this.mask3.enabled = false;
        this.mask4.enabled = false;
        this.handMask.enabled = true;
        this.isStart = true;
        this.anim.stop();
        this.Action();
    }

    private FinishChessGuidStep() {
        let guidStep = Game.Instance.GameGuide.NormalGuideStep;

        if (guidStep < 2) {
            this.lineAnim.play();
            GameEventMgr.Instance.EmitEvent(Consts.Event.EStartChessGuidStep);
        } else if (guidStep == 2) {
            this.lineAnim.play();
            this.isStart = false;
            this.hand.active = false;
            this.anim.stop();
            this.mainMask.enabled = false;
            this.handMask.enabled = false;
            this.maskNode.active = false;
            this.scheduleOnce(() => {
                this.Action();
                this.mask3.enabled = true;
                GameEventMgr.Instance.EmitEvent(Consts.Event.EStartChessGuidStep);
            }, 1);
        }
        else {

            if (guidStep < 4) {
                this.mask3.enabled = false;
                this.mask4.enabled = true;
                this.rectangleAnim.play();
                GameEventMgr.Instance.EmitEvent(Consts.Event.EStartChessGuidStep);
            }

            if (guidStep == 4) {
                this.rectangleAnim.play();
                this.mask4.enabled = false;
                this.mainMask.enabled = false;
                this.isStart = false;
                this.hand.active = false;
                this.anim.stop();
                this.scheduleOnce(() => {
                    FGUIMgr.Instance.ShowUI(Consts.ResName.PtGuideView);
                    this.node.active = false;
                }, 2);
            }
        }
    }

    /**运动*/
    private Action() {
        this.Trans.opacity = 255;
        cc.tween(this.Trans).delay(0.1).call(() => {
            GameEventMgr.Instance.EmitEvent(Consts.Event.EStartChessGuidStep);
        }).start();
        cc.tween(this.Trans).to(0.5, { opacity: 0 }, { easing: "smooth" }).call(() => {
            this.mainMask.enabled = true;
            // this.handMask.enabled = true;
            this.maskNode.active = true;
            this.PlayHandAnim();
        }).start();
    }

    protected update(dt: number): void {
        if (this.isStart) {
            this.secondCount += dt;
            if (this.secondCount >= 2) {
                this.secondCount = 0;
                this.isStart = false;
                this.PlayHandAnim();
            }
        }
    }

    private PlayHandAnim() {
        let anim: string = "Guid2"
        if (Game.Instance.GameGuide.NormalGuideStep < 3) {
            anim = "Guid1"
        }

        if (Game.Instance.GameGuide.NormalGuideStep >= 4) {
            return;
        }


        this.isStart = false;
        this.hand.active = true;
        this.anim.play(anim);

    }

    // private AnimationFinish() {
    //     this.scheduleOnce(() => {
    //         this.hand.active = false;
    //         this.isStart = true;
    //     }, 1);
    // }

    protected onDestroy(): void {
        this.anim.node.off(cc.Animation.EventType.FINISHED);
        GameEventMgr.Instance.RemoveEvent(Consts.Event.EFinishChessGuidStep, this);
        GameEventMgr.Instance.RemoveEvent(Consts.Event.EAddScore, this);
    }
}