import Consts from "../Consts/Consts";
import { EventStatus, GameType } from "../Consts/Define";
import BaseView from "../FGUI/BaseView";
import FGUIMgr from "../FGUI/FGUIMgr";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import Utility from "../Utility";
import GetImageWnd from "./GetImageWnd";
import EventItem from "./Itme/EventItem";

const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass
export default class EventView extends BaseView {
    private backBtn: fgui.GButton = null;
    private controller: fgui.Controller = null;
    private itemList: fgui.GList = null;
    private childerList: EventItem[] = [];
    private currentPage: number = 0;
    private numText: fgui.GTextField = null;
    private statusBtn: fgui.GButton = null;
    private currentStatus: EventStatus = EventStatus.Close;
    private eventNameList: string[] = [];
    private unlockIndex: number = 0;
    private titleText: fgui.GTextField = null;
    private timeText: fgui.GTextField = null;

    protected InitUI(): void {
        this.backBtn = this.View.getChild("n9").asButton;
        this.controller = this.View.getController("c1");
        this.itemList = this.View.getChild("n20").asList;

        let conf = Game.Instance.EventTimeConfig.OpenEvent();
        let children = this.itemList._children;
        for (let i = 0; i < children.length; i++) {
            let item = new EventItem(children[i], i, conf[`Image${i + 1}`]);
            this.childerList.push(item);
        }

        this.itemList.on(fgui.Event.SCROLL, this.OnPageScroll.bind(this), this);
        this.numText = this.View.getChild("Number_Text").asTextField;
        this.statusBtn = this.View.getChild("n15").asButton;
        this.titleText = this.View.getChild("Title_Text").asTextField;
        this.timeText = this.View.getChild("n8").asCom.getChild("EventTime").asTextField;
        this.timeText.text = Game.Instance.EventTimeConfig.OpenEvent().Name;
        this.schedule(this.UpdateTime.bind(this), 60);
        this.titleText.text = Game.Instance.EventTimeConfig.OpenEvent().Name;
    }

    protected InitEvent(): void {
        this.backBtn.onClick(this.OnClickBackMain.bind(this), this);
        this.statusBtn.onClick(this.OnClickStatusBtn.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EBackMainView, this.BackMainView.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EStartPlayEventGame, this.PlayEvent.bind(this), this);
    }

    /**点击返回主界面按钮 */
    private OnClickBackMain() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.EBackMainView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();

        cc.log("EventView-OnClickBackMain")
    }
    /**状态按钮 */
    private OnClickStatusBtn() {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);

        if (this.currentStatus == EventStatus.Close) {
            this.itemList.scrollPane.setCurrentPageX(this.unlockIndex);
        } else if (this.currentStatus == EventStatus.Open) {
            this.StartEventGame();
        } else if (this.currentStatus == EventStatus.Finish) {
            this.itemList.scrollPane.setCurrentPageX(this.unlockIndex);
        }
    }

    protected OnShow(): void {
        let data = Game.Instance.GetEventDefaultSelect();
        this.unlockIndex = data.index;
        this.eventNameList = data.arr;

        if (Game.Instance.Cache.CurrentEventIndex == -1) {
            Game.Instance.Cache.CurrentEventIndex = data.index;
        }


        for (let ch of this.childerList) {
            ch.SetControlStatus(data.index);
        }

        this.itemList.scrollPane.setCurrentPageX(this.unlockIndex);
        this.UpdateState();
        this.PlayWhiteAnim();
        this.UpdateTime();

        if (Game.Instance.Cache.CurrentEventIndex != data.index) {
            FGUIMgr.Instance.ShowWindow(Consts.ResName.GetImage, GetImageWnd, Game.Instance.Cache.CurrentEventIndex);
            Game.Instance.Cache.CurrentEventIndex = data.index;
        }

        cc.log(Game.Instance.Cache.CurrentEventIndex, data.index);
    }

    private OnPageScroll() {
        let scrollPane = this.itemList.scrollPane;
        let page = scrollPane.currentPageX;
        if (page != this.currentPage) {
            this.currentPage = page;
            this.UpdateState();
        }
    }

    /**刷新状态 */
    private UpdateState() {
        let value = Consts.EventItemList[this.currentPage];
        this.numText.text = `${value.length - this.eventNameList.length}/${value.length}`;
        let item = this.childerList[this.currentPage];
        this.currentStatus = EventStatus.Close;
        if (this.currentPage == this.unlockIndex) {
            item.UpdateSelect(this.eventNameList);
            Game.Instance.Cache.SelectEvent = { index: this.currentPage, eventName: item.GetSelectItme().ItemName };
            this.currentStatus = EventStatus.Open;
        } else {
            item.UpdateSelect([]);
            if (this.currentPage < this.unlockIndex) {
                this.currentStatus = EventStatus.Finish;
            }
        }

        this.controller.setSelectedIndex(this.currentStatus);
        item.SetControlStatus(this.unlockIndex);
    }

    /**刷新时间 */
    private UpdateTime() {
        let data = Game.Instance.EventTimeConfig.OpenEvent();

        let st = data.Start;
        let et = data.End;
        let ct = Utility.TimeStamp();
        if (ct > st && ct < et) {
            let s = (et - ct) / 1000;
            let day = Math.floor(s / (3600 * 24));
            let hour = Math.floor((s - day * 3600 * 24) / 3600);
            this.timeText.text = `${day}d${Utility.FormatZeroPad(hour)}h`
        }
    }

    /**开始事件模式游戏 */
    private StartEventGame() {
        Game.Instance.Cache.GameType = GameType.EventType;
        let data = Game.Instance.Score.GetEventData(Game.Instance.Cache.SelectEvent.index, Game.Instance.Cache.SelectEvent.eventName);
        if (data.s > 0) {
            FGUIMgr.Instance.ShowUI(Consts.ResName.EventGameStateView);
        } else {
            this.PlayGame();
        }
    }

    private PlayEvent() {
        this.PlayGame();
    }

    /**开始游戏 */
    private PlayGame() {
        Game.Instance.SetEventBlockProbability();
        GameEventMgr.Instance.EmitEvent(Consts.Event.EStartNewGame);
        this.Close();
    }

    /**返回主界面 */
    private BackMainView() {
        this.Close();
    }
}