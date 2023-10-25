import Consts from "../Consts/Consts";
import { GameType } from "../Consts/Define";
import BaseView from "../FGUI/BaseView";
import FGUIMgr from "../FGUI/FGUIMgr";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import SDKMgr from "../SDK/SDKMgr";
import Utility from "../Utility";
import DailyChallenges from "./DailyChallenges";
import DailyGuideView from "./DailyGuideView";
import DailyBlockItem from "./Itme/DailyBlockItem";
import EventBlockItem from "./Itme/EventBlockItem";
import ShowCupView from "./ShowCupView";
import ShowTextureView from "./ShowTextureView";


const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass
export default class MainView extends BaseView {
    /**控制器 */
    private eventList: fgui.GList = null;
    private btnList: fgui.GList = null;
    /**状态按钮列表 */
    private statusBtnList: fgui.GButton[] = [];

    private dailyChallenges: DailyChallenges = null;
    private bestScore: fgui.GButton = null;

    private dailyItem: DailyBlockItem = null;
    private eventItem: EventBlockItem = null;
    // private tra2: fgui.Transition = null;
    private cupView: ShowCupView = null;
    private textureView: ShowTextureView = null;
    private rewardController: fgui.Controller = null;
    private rankBtn: fgui.GButton = null;
    private currentRewardIndex: number = 0;

    private isFirst: boolean = true;

    protected InitUI(): void {
        this.dailyChallenges = new DailyChallenges(this.View, this);

        this.eventList = this.View.getChild("Main_Block1").asList;
        this.btnList = this.View.getChild("n34").asList;

        this.btnList.on(fgui.Event.CLICK_ITEM, this.OnClickBtnList.bind(this), this);
        this.eventList.on(fgui.Event.CLICK_ITEM, this.OnCLickEventList.bind(this), this);
        this.bestScore = this.View.getChild("n31").asButton;
        this.rankBtn = this.View.getChild("RankBtn").asButton;

        for (let btnName of ["n4", "n6", "n5"]) {
            let btn = this.View.getChild(btnName).asButton;
            btn.on(fgui.Event.STATUS_CHANGED, this.ChangeState.bind(this), this);
            this.statusBtnList.push(btn);
        }
        this.dailyChallenges.InitUI();
        Game.Instance.Cache.GameType = GameType.NormalType;

        let childer = this.eventList._children;
        this.dailyItem = new DailyBlockItem(childer[0].asCom);
        this.eventItem = new EventBlockItem(childer[1]);

        // let conf = Game.Instance.EventTimeConfig.OpenEvent();
        // if (conf == null) {
        //     this.eventList.removeChild(childer[1]);
        //     this.eventItem = null;
        // } else {
        //     if (Game.Instance.Date.EventTime == conf.End) {
        //         this.eventList.removeChild(childer[1]);
        //         this.eventItem = null;
        //     }
        // }
        this.InitEventModel();

        // this.eventList.removeChild(childer[1])
        // this.eventList.addItem("ui://MainPackage/EventBlock");

        this.rewardController = this.View.getController("Reward");
        this.cupView = new ShowCupView(this.View);
        this.textureView = new ShowTextureView(this.View, this.rewardController);

        this.schedule(this.CheckEvent.bind(this), 60);
        this.rewardController.on(fgui.Event.STATUS_CHANGED, this.OnRewardStates.bind(this));
        this.currentRewardIndex = 0;

        this.View.getChild("n94").asButton.onClick(() => {
            FGUIMgr.Instance.ShowUI(Consts.ResName.SettView);
        }, this);

    }

    protected InitEvent(): void {
        // GameEventMgr.Instance.AddEvent(Consts.Event.EResetCheckEvent, this.ResetCheckEvent.bind(this), this);
        this.dailyChallenges.InitEvent();
        this.rankBtn.onClick(this.OnClickRankBtn.bind(this));
    }

    private InitEventModel() {
        if (Game.Instance.EventTimeConfig.OpenEvent() == null) {
            this.eventList.removeChild(this.eventList._children[1]);
            Game.Instance.Map.ClearEventList();
            Game.Instance.Score.ClearEventList();
            Game.Instance.Select.ClearEventList();
        } else {
            let eventConf = Game.Instance.EventTimeConfig.OpenEvent();
            if (Game.Instance.Date.EventTime == null || eventConf.Start > Game.Instance.Date.EventTime) {
                Game.Instance.Map.ClearEventList();
                Game.Instance.Score.ClearEventList();
                Game.Instance.Select.ClearEventList();
            }

            if (eventConf.Start >= Game.Instance.Date.EventTime) {
                let childer = this.eventList._children
                if (childer.length > 1) {
                    this.eventList.removeChild(childer[1]);
                }
                Game.Instance.Date.EventTime = eventConf.Start;
                this.eventList.addItem("ui://MainPackage/EventBlock");
                this.eventItem = new EventBlockItem(this.eventList._children[1]);
            } else {
                Game.Instance.Map.ClearEventList();
                Game.Instance.Score.ClearEventList();
                Game.Instance.Select.ClearEventList();
            }
        }


    }

    protected OnShow(): void {
        this.bestScore.title = Game.Instance.Score.History.toString();
        if (Game.Instance.Cache.GameType == GameType.DailyType) {
            this.dailyChallenges.UpdateProgress();
        } else if (Game.Instance.Cache.GameType == GameType.NormalType) {
            if (Game.Instance.Map.NormalMap().length > 0) {
                this.btnList._children[1].visible = true;
            } else {
                this.btnList._children[1].visible = false;
            }
        }

        let date = Game.Instance.Date;

        let p = Game.Instance.GetDateProgress(date.Month, date.Day)

        if (p.history == 0) {
            if (p.currentScore == 0) {
                this.dailyItem.UpdateState(0);
            } else {
                this.dailyItem.UpdateState(1);
            }
        } else {
            this.dailyItem.UpdateState(2);
        }

        this.PlayWhiteAnim();
        this.CheckEvent();

        if (Game.Instance.Cache.GameType == GameType.NormalType) {
            if (Game.Instance.Score.History > 0) {
                Game.Instance.Net.UpdateScore(Game.Instance.Score.History);
                Game.Instance.Data.User.score = Game.Instance.Score.History;
                Game.Instance.Data.UpdateSelfScore();
            }

            if (Game.Instance.Data.Square > 0) {
                Game.Instance.Net.UpdateRectangleNum(Game.Instance.Data.Square);
                Game.Instance.Data.UpdateSelfSquare();
            }
        }

        if (!this.isFirst) {
            SDKMgr.Instance.HideBanner();
        }
        this.isFirst = false;

    }

    /**检查事件 */
    private CheckEvent() {
        if (this.eventItem == null) {
            return;
        }
        let data = Game.Instance.EventTimeConfig.OpenEvent();
        if (data) {
            if (Game.Instance.Date.EventTime >= data.End) {
                this.eventList.removeChild(this.eventList._children[1]);
                this.eventItem = null;
            } else {
                let st = data.Start;
                let et = data.End;
                let ct = Utility.TimeStamp();
                if (ct > st && ct < et) {
                    let s = (et - ct) / 1000;
                    let day = Math.floor(s / (3600 * 24));
                    let h = Math.floor((s - day * 3600 * 24) / 3600);
                    this.eventItem.SetEventName(data.Name);
                    this.eventItem.SetEventTime(day, h);
                    this.eventItem.SetIcon(data.Icon);
                }
            }
        }
    }

    private OnClickBtnList(item: fgui.GComponent) {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        let index = this.btnList.getChildIndex(item);
        if (index == 0) {
            Game.Instance.Cache.GameType = GameType.NormalType;
            this.NewGame();
        } else {
            this.ContinueGame();
        }
    }

    private OnCLickEventList(item: fgui.GComponent) {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        let index = this.eventList.getChildIndex(item);
        if (index == 0) {
            // cc.log('每日挑战')
            let date = Game.Instance.Date;
            Game.Instance.Cache.SelectDate = { month: date.Month, day: date.Day - 1 };
            Game.Instance.Cache.GameType = GameType.DailyType;
            GameEventMgr.Instance.EmitEvent(Consts.Event.EDailyChallenges);
        } else if (index == 1) {
            // cc.log('事件')
            Game.Instance.Cache.GameType = GameType.EventType;
            GameEventMgr.Instance.EmitEvent(Consts.Event.EEventChallenges);
        }
        this.Close();
    }

    /**更改状态 */
    private ChangeState(btn: fgui.GButton) {
        let index = this.statusBtnList.indexOf(btn);
        this.ChangePage(index);
    }


    /**切换分页*/
    private ChangePage(index: number) {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        if (index == 1) {
            if (Game.Instance.GameGuide.DailyGuideStep == 0) {
                FGUIMgr.Instance.ShowWindow(Consts.ResName.DailyGuideView, DailyGuideView);
            }
            this.dailyChallenges.Show();
            Game.Instance.Cache.GameType = index;
        } else if (index == 2) {
            if (this.currentRewardIndex == 0) {
                this.cupView.Update();
            } else {
                this.textureView.Update();
            }
        }
        this.PlayWhiteAnim();

    }

    /**新游戏 */
    private NewGame() {
        Game.Instance.Cache.GameType = GameType.NormalType;
        GameEventMgr.Instance.EmitEvent(Consts.Event.EStartNewGame);
        this.Close();
    }

    /**继续游戏 */
    private ContinueGame() {
        Game.Instance.Cache.GameType = GameType.NormalType;
        GameEventMgr.Instance.EmitEvent(Consts.Event.EContinueGame);
        this.Close();
    }

    /**奖励状态更改 */
    private OnRewardStates(controll: fgui.Controller) {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        let current = controll.selectedIndex;
        if (current == 0) {
            this.cupView.Update();
        } else {
            this.textureView.Update();
        }
        this.currentRewardIndex = current;
    }

    /**排行榜*/
    private OnClickRankBtn() {
        FGUIMgr.Instance.ShowUI(Consts.ResName.RankView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        SDKMgr.Instance.EnterRankList();
    }

}