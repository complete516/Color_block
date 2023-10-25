import Consts from "../Consts/Consts";
import { GameType } from "../Consts/Define";
import BaseView from "../FGUI/BaseView";
import FGUIMgr from "../FGUI/FGUIMgr";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import SDKMgr from "../SDK/SDKMgr";
import DateItem from "./Itme/DateItem";

export enum ArrowStatue {
    First,
    End,
    Normal,
}

export default class DailyChallenges {
    private view: fgui.GComponent = null;
    /**翻页 */
    private listView: fgui.GList = null;
    /**当前页 */
    private currentPage: number = 0;
    private itemNum: number = 0;

    private dateItemList: DateItem[] = [];

    private dateRoot: fgui.GComponent = null;
    private monthText: fgui.GTextField = null;
    private yearText: fgui.GTextField = null;
    private levelText: fgui.GTextField = null;
    private controller: fgui.Controller = null;

    private leftBtn: fgui.GButton = null;
    private rightBtn: fgui.GButton = null;
    private playBtn: fgui.GButton = null;
    private baseView: BaseView = null;
    private veList: number[] = [];


    constructor(view: fgui.GComponent, baseView: BaseView) {
        this.view = view;
        this.baseView = baseView;
    }

    public InitUI() {
        this.listView = this.view.getChild("n50").asList;
        this.dateRoot = this.view.getChild("DateRoot").asCom;
        this.monthText = this.view.getChild("Daliy_Month").asTextField;
        this.yearText = this.view.getChild("Daliy_Year").asTextField;
        this.levelText = this.view.getChild("Daliy_LevelCom").asTextField;
        this.leftBtn = this.view.getChild("LeftBtn").asButton;
        this.rightBtn = this.view.getChild("RightBtn").asButton;

        this.itemNum = this.listView.numItems;
        this.controller = this.view.getController("c1");
        this.playBtn = this.view.getChild("n69").asButton;

        let arr = ["s", "m", "t", "w", "t2", "f", "s2"]
        for (let index of arr) {
            let com = this.view.getChild(index).asCom;
            this.veList.push(com.x);
        }

    }

    public InitEvent() {
        this.listView.on(fgui.Event.SCROLL, this.OnPageScroll.bind(this), this);
        this.leftBtn.onClick(this.OnClickLeftBtn.bind(this), this);
        this.rightBtn.onClick(this.OnClickRightBtn.bind(this), this);
        this.playBtn.onClick(this.OnClickPlayBtn.bind(this), this);
    }

    /**滑动*/
    private OnPageScroll() {
        let scrollPane = this.listView.scrollPane;
        let page = scrollPane.currentPageX;
        if (page != this.currentPage) {
            this.currentPage = page;
            this.UpdatePage();
        }
    }

    private UpdatePage() {
        let page = this.itemNum - this.currentPage - 1;
        let date = this.Date.GetPreviousDate(page);
        let calendar = this.Date.GetCalendar(date.year, date.month);
        this.UpdateDate(date.year, date.month);

        let targetDate = Game.Instance.Cache.DailyFinish;
        let index = 0;
        //第几行
        let row = 0;
        for (let i = 0; i < calendar.length; i++) {
            let data = calendar[i];
            let item = this.dateItemList[i];
            if (item == null) {
                item = this.CreateDateItem() as DateItem;
                this.dateItemList.push(item);
                item.node.on(cc.Node.EventType.TOUCH_END, () => {
                    this.OnClickItem(i);
                }, this);
                this.dateRoot.addChild(item);
            }

            let h = item.height;
            if (i > 0) {
                index++;
            } else {
                index = data.week;
            }
            item.alpha = 1;
            let ix = index % 7;

            item.setPosition(this.veList[ix] - item.width / 2, (Math.floor(index / 7) * 1.2 - 0.5) * h + 30);
            item.SetData(date.month, data.date, targetDate, row);
            if (ix >= 6) {
                row++;
            }
        }

        for (let i = calendar.length; i < this.dateItemList.length; i++) {
            this.dateItemList[i].alpha = 0;
        }

        if (page == 0) {
            this.controller.setSelectedIndex(ArrowStatue.End);
        } else if (page == this.itemNum - 1) {
            this.controller.setSelectedIndex(ArrowStatue.First);
        } else {
            this.controller.setSelectedIndex(ArrowStatue.Normal);
        }

        Game.Instance.Cache.SelectDate = { month: this.Date.Month - page, day: calendar.length - 1 };
        let selectData = Game.Instance.ContinueDailyChallenges();
        Game.Instance.Cache.SelectDate = selectData;
        this.dateItemList[selectData.day].SetSelectState(true);


        let starCount = Game.Instance.GetDailyStarCount();

        if (Game.Instance.Cache.DailyFinish != null) {
            let day = Game.Instance.Cache.DailyFinish.day;
            this.RewardStarAction(day, () => {
                this.dateItemList[day].Finish();
                this.levelText.text = `${starCount}/${calendar.length}`;
                this.UpdateTrophy(page, starCount, calendar.length, date.month);
                if (starCount >= calendar.length) {
                    this.CompleteDailyChallenges(date.month);
                }
            });
        } else {
            this.levelText.text = `${starCount}/${calendar.length}`;
            this.UpdateTrophy(page, starCount, calendar.length, date.month);
        }
        Game.Instance.Cache.DailyFinish = null;

    }

    /**刷新奖杯 */
    private UpdateTrophy(page: number, current: number, totalNum: number, month: number) {
        let index = this.itemNum - page - 1;
        let controller = this.listView._children[index].asCom.getChild("n0").asCom.getController("trophy");
        if (current >= totalNum) {
            if (Game.Instance.Reward.CupContain(month)) {
                Game.Instance.Reward.PushCupList(month);
            }
        } 
        controller.setSelectedIndex(current >= totalNum ? 0 : 1);
    }

    public Show() {
        this.currentPage = this.itemNum - 1;
        this.listView.scrollPane.setCurrentPageX(this.itemNum - 1);
        this.UpdateDate(this.Date.Year, this.Date.Month);
        this.UpdatePage();

        // this.CompleteDailyChallenges();
        SDKMgr.Instance.FixedTimeShowInterstitial();
    }

    /**刷新日期 */
    private UpdateDate(year: number, month: number) {
        this.monthText.text = Consts.Months[month - 1];
        this.yearText.text = year.toString();
    }

    private CreateDateItem() {
        let obj = fgui.UIPackage.createObject("MainPackage", "LevelItem", DateItem);
        return obj;
    }

    private OnClickItem(index: number) {
        this.SelectItme(index);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    private SelectItme(index: number) {
        let item = this.dateItemList[index];
        if (item.IsUnlock()) {
            this.dateItemList.forEach((item) => item.SetSelectState(false));
            item.SetSelectState(true);
            Game.Instance.Cache.SelectDate.day = index;
        }
    }

    /**点击向左按钮 */
    private OnClickLeftBtn() {
        this.currentPage--;
        this.listView.scrollPane.setCurrentPageX(this.currentPage, true);
        this.UpdatePage();
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    /**点击向右按钮*/
    private OnClickRightBtn() {
        this.currentPage++;
        this.listView.scrollPane.setCurrentPageX(this.currentPage, true);
        this.UpdatePage();
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    /**点击开始按钮*/
    private OnClickPlayBtn() {
        Game.Instance.Cache.GameType = GameType.DailyType;
        GameEventMgr.Instance.EmitEvent(Consts.Event.EDailyChallenges);
        this.baseView.Close();
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    /**刷新日期进度 关卡完成的星*/
    public UpdateProgress() {
        //todo 日期进度  关卡星
        let selectDate = Game.Instance.Cache.SelectDate;
        this.currentPage = this.itemNum - (this.Date.Month - selectDate.month) - 1;
        this.UpdatePage();
        this.SelectItme(selectDate.day);
    }

    private get Date() {
        return Game.Instance.Date;
    }

    /**获得星星动画 */
    private RewardStarAction(day: number, call: Function) {
        let startItem = fgui.UIPackage.createObject("RepublicPackage", "StarItem");
        this.view.addChild(startItem);
        let w = this.view.width;
        let h = this.view.height;

        startItem.x = w / 2 - startItem.width / 2;
        startItem.y = h / 2 - startItem.height / 2;

        let p = this.dateItemList[day].localToGlobal();
        let ts = this.dateItemList[day].width / startItem.width;
        // cc.log(p.x, startItem.x, startItem.y, p.y);

        cc.tween(this.view.node).delay(0.5).call(() => {
            fgui.GTween.to3(startItem.x, startItem.y, 1, p.x, p.y, ts, 0.8).onUpdate((t: fgui.GTweener) => {
                startItem.x = t.value.x;
                startItem.y = t.value.y;
                startItem.scaleX = t.value.z;
                startItem.scaleY = t.value.z;
            }).setEase(fgui.EaseType.SineOut).onComplete(() => {
                call && call()
                startItem.dispose();
            });
        }).start();
    }

    /**完成每日挑战挑战 */
    private CompleteDailyChallenges(month: number) {
        for (let i = 0; i < this.dateItemList.length; i++) {
            let item = this.dateItemList[i];
            item.OnTranComplete = null;
            if (i == this.dateItemList.length - 1) {
                item.OnTranComplete = () => {
                    FGUIMgr.Instance.ShowUI(Consts.ResName.GetCupView);
                }
            }
            item.ShowWaterfallAction();
        }

        if (Game.Instance.Reward.CupContain(month)) {
            Game.Instance.Reward.PushCupList(month);
        }
    }


}