import Consts from "./Consts/Consts";
import { GameState, GameType } from "./Consts/Define";
import FGUIMgr from "./FGUI/FGUIMgr";
import AudioMgr from "./Framework/AudioMgr";
import { GameEventMgr } from "./Framework/GameEvent";
import ResMgr from "./Framework/ResMgr";
import Game from "./Game";
import SDKMgr from "./SDK/SDKMgr";
import Utility from "./Utility";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    @property(cc.Node)
    private gameRoot: cc.Node = null;
    /**游戏节点 */
    private gameNode: cc.Node = null;

    private prevTime: number = 0;

    start() {

        if (Game.Instance.GameGuide.NormalGuideStep < 4) {
            Game.Instance.GameGuide.NormalGuideStep = 0;
            Game.Instance.Cache.GameType = GameType.GuideType;
            this.ShowGameNode();
        } else {
            FGUIMgr.Instance.ShowUI(Consts.ResName.MainView);
        }
        this.InitEvent();
    }

    InitEvent() {
        GameEventMgr.Instance.AddEvent(Consts.Event.EStartNewGame, this.StartNewGameEvent.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EContinueGame, this.ContinueGameEvent.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EBackMainView, this.BackMainView.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EDailyChallenges, this.StartNewGameEvent.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EEventChallenges, this.EventChallenges.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EGameFailed, this.GameFailed.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECompleteDilyChallenges, this.CompleteDailyChallenges.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECompleteEventChallenges, this.CompleteEventChallenges.bind(this), this);

        GameEventMgr.Instance.AddEvent(Consts.Event.EPlaceBlock, this.PlaceBlock.bind(this), this)
        GameEventMgr.Instance.AddEvent(Consts.Event.ENotUnionChessboard, this.PlaceBlockFailed.bind(this), this)

    }

    private PlaceBlock() {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Fangzhichenggong);

    }

    private PlaceBlockFailed() {
        AudioMgr.Instance.PlayEffect(Consts.ResName.fangzhishibai);
    }


    /**开始新游戏 */
    private StartNewGameEvent() {
        Game.Instance.Data.AddNum();
        if (Game.Instance.Cache.GameType == GameType.NormalType) {
            SDKMgr.Instance.GameModelCensus(Game.Instance.Cache.GameType, GameState.Open);
            SDKMgr.Instance.SendEvent("NormalStartGame", { from: "普通模式", state: "普通模式开始游戏" });
            Game.Instance.Clear();
        } else if (Game.Instance.Cache.GameType == GameType.DailyType) {

        } else if (Game.Instance.Cache.GameType == GameType.EventType) {

        }
        this.ShowGameNode();
    }


    /**继续游戏 */
    private ContinueGameEvent() {
        this.ShowGameNode();
    }

    private GameFailed() {
        if (Game.Instance.Cache.GameType == GameType.NormalType) {
            FGUIMgr.Instance.ShowUI(Consts.ResName.GameOverView);
        } else if (Game.Instance.Cache.GameType == GameType.DailyType) {
            FGUIMgr.Instance.ShowUI(Consts.ResName.DailyEndingView);
            Game.Instance.AddFaileCount();
            SDKMgr.Instance.DailyChallengesEvent(2, Game.Instance.Cache.SelectDate.month, Game.Instance.Cache.SelectDate.day);
        } else if (Game.Instance.Cache.GameType == GameType.EventType) {
            FGUIMgr.Instance.ShowUI(Consts.ResName.EventEndView);
            Game.Instance.AddFaileCount();
            SDKMgr.Instance.EventChallengesEvent(2, Game.Instance.Cache.SelectEvent.index, Game.Instance.Cache.SelectEvent.eventName);
        }

        SDKMgr.Instance.GameModelCensus(Game.Instance.Cache.GameType, GameState.Failed);
        AudioMgr.Instance.PlayEffect(Consts.ResName.shibai);
    }

    private EventChallenges() {
        FGUIMgr.Instance.ShowUI(Consts.ResName.EventView);
        SDKMgr.Instance.FixedTimeShowInterstitial();
    }

    /**完成每日挑战 */
    private CompleteDailyChallenges() {
        // cc.log("完成每日挑战了")
        // let selectDate = Game.Instance.Cache.SelectDate;
        Game.Instance.CompleteDailyChallenges();
        // FGUIMgr.Instance.ShowUI(Consts.ResName.DailyEndingView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.shengli);
    }

    private CompleteEventChallenges() {
        Game.Instance.CompleteEventChallenges();
        // FGUIMgr.Instance.ShowUI(Consts.ResName.EventEndView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.shengli);
    }

    /**显示游戏节点 */
    private ShowGameNode() {
        Game.Instance.Init();
        if (this.gameNode == null) {
            let assets = ResMgr.Instance.GetRes<cc.Prefab>(Consts.ResName.GameNode);
            let node = cc.instantiate(assets.res);
            this.gameRoot.addChild(node);
            node.position = cc.v3();
            this.gameNode = node;
        } else {
            this.gameNode.active = true;
        }

        SDKMgr.Instance.FixedTimeShowInterstitial();
    }

    /**返回主界面 */
    private BackMainView() {
        cc.log("BackMainView");
        FGUIMgr.Instance.ShowUI(Consts.ResName.MainView);
    }
}
