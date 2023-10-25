import Consts from "../Consts/Consts";
import { GameType } from "../Consts/Define";
import ColourBarEffect from "../Effect/ColourBarEffect";
import FGUIMgr from "../FGUI/FGUIMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import ResMgr from "../Framework/ResMgr";
import Game from "../Game";
import Chessboard from "./Chessboard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameFight extends cc.Component {
    private chess: Chessboard = null;

    @property(cc.Node)
    private mask: cc.Node = null;

    protected onLoad(): void {
        this.chess = this.node.getChildByName("GameControl").getChildByName("Chessboard").getComponent(Chessboard);
    }
    protected onEnable(): void {
        this.mask.active = false;
        this.mask.opacity = 0;
        FGUIMgr.Instance.ShowUI(Consts.ResName.GameView);
    }

    start() {
        this.InitEvent();
    }

    private InitEvent() {
        GameEventMgr.Instance.AddEvent(Consts.Event.EBackMainView, this.BackMainView.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EGameFailed, this.BackMainView.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EGameOver, this.GameOver.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EEventChallenges, this.EventChallenges.bind(this), this);

        GameEventMgr.Instance.AddEvent(Consts.Event.ECompleteDilyChallenges, this.CompleteDilyChallenges.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECompleteEventChallenges, this.CompleteEventChallenges.bind(this), this);

    }

    private BackMainView() {
        this.node.active = false;
    }

    private GameOver() {
        this.mask.active = true;
        cc.tween(this.mask).to(2, { opacity: 128 }, { easing: "smooth" }).delay(0.5).call(() => {
            GameEventMgr.Instance.EmitEvent(Consts.Event.EGameFailed);
            this.mask.opacity = 0;
            this.node.active = false;
        }).start();
    }

    private EventChallenges() {
        this.node.active = false;
    }

    private CompleteDilyChallenges() {
        this.mask.active = true;
        this.AddEffectt();
        cc.tween(this.mask).to(2, { opacity: 128 }, { easing: "smooth" }).delay(0.5).call(() => {
            cc.tween(this.mask).delay(1.2).call(() => {
                this.mask.opacity = 0;
                this.node.active = false;
                FGUIMgr.Instance.ShowUI(Consts.ResName.DailyEndingView);
            }).start();
        }).start();
    }

    private CompleteEventChallenges() {
        this.mask.active = true;
        this.AddEffectt();
        cc.tween(this.mask).to(2, { opacity: 128 }, { easing: "smooth" }).delay(0.5).call(() => {
            cc.tween(this.mask).delay(1.2).call(() => {
                this.mask.opacity = 0;
                this.node.active = false;
                FGUIMgr.Instance.ShowUI(Consts.ResName.EventEndView);
            }).start();
        }).start();
    }

    private AddEffectt() {
        cc.tween(this.node).delay(0.5).call(() => {
            let obj = Game.Instance.EffectPool.Pop(Consts.ResName.ColourBar);
            obj.position = cc.v3(0, cc.winSize.height / 2 + 200);
            this.node.addChild(obj);
            obj.getComponent(ColourBarEffect).Play();
        }).start();
    }

}
