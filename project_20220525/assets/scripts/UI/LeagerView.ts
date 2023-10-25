import Consts from "../Consts/Consts";
import BaseView from "../FGUI/BaseView";
import FGUIMgr from "../FGUI/FGUIMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import Utility from "../Utility";
import DateItem from "./Itme/DateItem";
import LeagerItem from "./Itme/LeagerItem";

export enum ScrollArrow {
    None,
    Up,
    Down,
}

const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass
export default class LeagerView extends BaseView {
    private backBtn: fgui.GButton = null;
    private listView: fgui.GList = null;

    private pageCollter: fgui.Controller = null;
    private pointCollter: fgui.Controller = null;
    /**分数排名 */
    private pointsTtxt: fgui.GTextField = null;
    /**矩形消除排名 */
    private squareTxt: fgui.GTextField = null;
    /**全部玩家 */
    private allPlayerTxt: fgui.GTextField = null;
    /**当前排名 */
    private ranktxt: fgui.GTextField = null;
    /**排行数组 */
    private rankList: { uname: string, order: number, score: string, uid: number }[] = [];
    /**过滤数组 */
    private fliterList: { uname: string, order: number, score: string, uid: number }[] = [];

    private currentPage: number = 0;

    private topRankList: LeagerItem[] = [];
    /**输入Input */
    // private inputText: fgui.GTextInput = null;
    private networkText: fgui.GComponent = null;
    private arrow: ScrollArrow = ScrollArrow.None;
    private footerControl: fgui.Controller = null;
    private networkTrs: fgui.Transition = null;
    private loginBtn: fgui.GButton = null;
    private accountName: fgui.GTextField = null;

    protected InitUI(): void {
        this.rankList = Game.Instance.Data.GetScoreRandList();
        this.backBtn = this.View.getChild("n2").asButton;
        this.listView = this.View.getChild("n35").asList;

        this.pageCollter = this.View.getController("c1");
        this.pointCollter = this.View.getController("c2");

        this.pageCollter.on(fgui.Event.STATUS_CHANGED, this.PageStatsChange.bind(this));

        this.listView.itemRenderer = this.OnRenderItem.bind(this);
        this.listView.setVirtual();
        this.listView.numItems = 0;

        this.listView.on(fgui.Event.PULL_UP_RELEASE, this.PullUpRefres.bind(this));
        this.listView.on(fgui.Event.PULL_DOWN_RELEASE, this.PullDownRefres.bind(this));

        this.listView.on(fgui.Event.SCROLL, this.OnScroll.bind(this), this);

        this.pointsTtxt = this.View.getChild("Points_txt").asTextField;
        this.squareTxt = this.View.getChild("Square_txt").asTextField;
        this.allPlayerTxt = this.View.getChild("AllPlayer_txt").asTextField;
        this.ranktxt = this.View.getChild("SquareLeader_txt").asTextField;

        this.networkText = this.View.getChild("Network_Text").asCom;
        this.loginBtn = this.View.getChild("Login_Btn").asButton;
        // this.inputText = this.View.getChild("n27").asTextInput;

        // for (let i = 0; i < 3; i++) {
        //     let com = this.View.getChild(`n${48 + i}`).asCom;
        //     this.topRankList.push(new LeagerItem(com, i));
        //     com.visible = false;
        // }
        this.networkText.alpha = 0;
        this.footerControl = this.listView.scrollPane.footer.getController("c1");
        this.footerControl.setSelectedIndex(0);
        this.networkTrs = this.View.getTransition("t0");
        this.accountName = this.View.getChild("ID_txt").asTextField;
    }

    protected InitEvent(): void {
        this.backBtn.onClick(this.OnClickBackBtn.bind(this));
        GameEventMgr.Instance.AddEvent(Consts.Event.EUpdateRankData, this.UpdateRankDataEvent.bind(this), this)
        GameEventMgr.Instance.AddEvent(Consts.Event.ETopRankData, this.UpdateTopRankDataEvent.bind(this), this)
        GameEventMgr.Instance.AddEvent(Consts.Event.ENetworkError, this.NetworkError.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EChangeName, this.UpdateSelfInfo.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECancelChangeName, this.UpdateSelfInfo.bind(this), this);


        // this.inputText.node.on(fgui.Event.Submit, this.OnEditEnd.bind(this), this);
        // this.inputText.node.on("editing-did-began", this.OnEditingDidBegan.bind(this), this);
        // this.inputText.on(fgui.Event.TEXT_CHANGE, this.OnTextChange.bind(this), this);
        // this.inputText._editBox.inputMode = cc.EditBox.InputMode.SINGLE_LINE;
        // this.inputText._editBox.maxLength = 17;

        this.loginBtn.onClick(this.OnClickLoginBtn.bind(this));
    }

    // /** */
    // private OnEditingDidBegan() {
    //     Game.Instance.Cache.inputStr = this.inputText.text;
    //     FGUIMgr.Instance.ShowUI(Consts.ResName.NameSure);
    // }


    // private OnTextChange() {
    //     Game.Instance.Cache.inputStr = this.inputText.text;
    //     GameEventMgr.Instance.EmitEvent(Consts.Event.ETextChange, Game.Instance.Cache.inputStr);
    // }

    private OnEditEnd() {
    }

    protected OnShow(): void {
        this.currentPage = 0;
        this.pageCollter.setSelectedIndex(0);
        this.listView.numItems = 0;
        this.PlayWhiteAnim();
        this.UpdateAllPlayer();
        this.UpdateSelfInfo();


        this.UpdateRankListData();
        // this.RefreshTopItme();
        this.networkTrs.stop();
        this.SetListViewPos();
    }

    private ShowName(name: string) {
        this.accountName.text = Utility.NameFormat(name);
        // this.inputText.text = Utility.NameFormat(Game.Instance.Data.User.name);
    }


    // /**刷新top榜 */
    // private RefreshTopItme() {
    //     let topList = this.GetTopList();
    //     /**更新数据 */

    //     if (topList.length > 0) {
    //         let user = Game.Instance.Data.User;
    //         for (let i = 0; i < this.topRankList.length; i++) {
    //             let data = topList[i];
    //             let item = this.topRankList[i];
    //             if (data) {
    //                 item.Point = data.score.toString();
    //                 item.Square = data.score.toString();
    //                 item.SetStatus(this.currentPage);
    //                 item.Visible = true;
    //                 if (this.currentPage == 0) {
    //                     item.Self(user.uid == data.uid);
    //                 } else {
    //                     item.Self(user.uid2 == data.uid);
    //                 }
    //                 item.UserName = data.uname;
    //             } else {
    //                 item.Visible = false;
    //             }
    //         }
    //     } else {
    //         for (let item of this.topRankList) {
    //             item.Visible = false;
    //         }

    //         if (this.currentPage == 0) {
    //             Game.Instance.Net.GetScoreTopRankList();
    //         } else if (this.currentPage == 1) {
    //             Game.Instance.Net.GetRectangleTopRankList();
    //         }
    //     }
    // }

    /**刷新Top榜*/
    private UpdateTopRankDataEvent() {
        this.networkText.alpha = 0;
        // this.RefreshTopItme();
        this.UpdateSelfInfo();
    }

    /**刷新排行数据*/
    private UpdateRankDataEvent() {
        this.networkText.alpha = 0;
        this.networkTrs.stop();
        this.UpdateSelfInfo();
        // cc.log(this.rankList,"xxxxxx",!this.View.visible)
        // if (!this.View.visible) {
        //     return;
        // }

        cc.log("UpdateRankDataEvent");

        this.UpdateAllPlayer();
        let rankList = this.GetRankList();

        if (rankList.length == 0) {
            this.simulateHintFinished();
            return;
        }

        this.fliterList = [];
        if (this.arrow == ScrollArrow.Up) {
            let item = this.rankList[this.rankList.length - 1];
            this.fliterList = rankList.filter((value) => { return value.order >= item.order && value.uid != item.uid });
            this.rankList = this.rankList.concat(this.fliterList);
            this.listView.numItems += this.fliterList.length;
        } else if (this.arrow == ScrollArrow.Down) {
            let item = this.rankList[0];
            this.fliterList = rankList.filter((value) => { return value.order <= item.order && value.uid != item.uid });
            this.rankList = this.fliterList.concat(this.rankList);
            this.listView.numItems += this.fliterList.length;
        } else {
            this.rankList = rankList
            this.listView.numItems = this.rankList.length;
        }

        this.scheduleOnce(() => {
            this.simulateHintFinished();
        }, 1);
    }

    // /**裁剪排行数组 */
    // private SpliceRankList(rankList: { uname: string, order: number, score: string, uid: number }[]) {
    //     this.rankList = [];
    //     if (rankList.length == 0) {
    //         return [];
    //     }
    //     let count = 4 - rankList[0].order
    //     let index = 0;
    //     for (let i = 0; i < rankList.length; i++) {
    //         index++;
    //         if (index <= count) {
    //             continue;
    //         }
    //         this.rankList.push(rankList[i]);
    //     }
    //     return this.rankList;
    // }

    private GetTopList() {
        if (this.currentPage == 1) {
            return Game.Instance.Data.TopSquareRankList;
        }
        return Game.Instance.Data.TopScoreRankList;
    }

    private OnClickBackBtn() {
        this.Close();
    }

    /**页切换 */
    private PageStatsChange() {
        this.footerControl.setSelectedIndex(0);
        let previsousIndex = this.pageCollter.previsousIndex;
        if (previsousIndex == 0) {
            this.UpdateRectangleRank();
            this.currentPage = 1;
        } else if (previsousIndex == 1) {
            this.UpdateScoreRank();
            this.currentPage = 0;
        }
        this.listView.numItems = 0;
        this.rankList = [];
        // this.RefreshTopItme();
        this.UpdateSelfInfo();
        this.UpdateAllPlayer();
        // this.listView.scrollPane.setPosY(10);
        this.UpdateRankListData();
        this.SetListViewPos();
    }

    /**刷新排行数据 */
    private UpdateRankListData() {
        let previsousIndex = this.pageCollter.previsousIndex;
        this.rankList = this.GetRankList();
        if (previsousIndex == 0) {
            // this.rankList = Game.Instance.Data.GetSquareRandList();
        } else if (previsousIndex == 1 || previsousIndex == -1) {
            // this.rankList = Game.Instance.Data.GetScoreRandList();
            if (this.rankList.length == 0) {
                this.rankList = Game.Instance.Data.TopScoreRankList;
            }
        }
        // Utility.DebugLog(this.rankList.length + "   UpdateRankListData");

        if (this.rankList.length == 0) {
            if (this.currentPage == 0) {
                Game.Instance.Net.GetScoreFrontAndAfterRankList();
            } else {
                Game.Instance.Net.GetRectangleFrontAndAfterRankList();
            }
            this.listView.numItems = 0;
        } else {
            // this.SpliceRankList(this.rankList);
            this.listView.numItems = this.rankList.length;
        }
        // cc.log(this.rankList,"xxxxxxxxxxxx");
    }

    private SetListViewPos() {
        let order = 0;
        if (this.currentPage == 0) {
            let uid = Game.Instance.Data.User.uid;
            // order = Game.Instance.Data.User.sorder;
            for (let i = 0; i < this.rankList.length; i++) {
                if (this.rankList[i].uid == uid) {
                    order = i;
                    break;
                }
            }
        } else {
            let uid = Game.Instance.Data.User.uid2;
            for (let i = 0; i < this.rankList.length; i++) {
                if (this.rankList[i].uid == uid) {
                    order = i;
                    break;
                }
            }
            // order = Game.Instance.Data.User.corder;
        }

        // let items = this.listView.numItems;
        // // let index = 0;
        // // if (order <= 3) {
        // //     index = 0;
        // // } else {
        // //     index = order - 3;
        // // }

        // // this.listView.selectedIndex = index;
        // if (order < this.listView.numItems && order >= 0) {
        //     this.listView.scrollToView(order);
        // } else {
        //     if (order == -1) {
        //         this.listView.scrollToView(0);
        //     } else {
        //         this.listView.scrollToView(this.listView.numItems - 1);
        //     }
        // }
        // cc.log(order, "order", this.listView.numItems);
        this.listView.scrollToView(order);

    }

    /**刷新分数排行 */
    private UpdateScoreRank() {

    }
    /**刷新田字格排行 */
    private UpdateRectangleRank() {

    }

    private OnRenderItem(index: number, item: fgui.GObject) {
        let data = this.rankList[index];

        let com = item.asCom;
        let idText = com.getChild("ID_Text").asTextField;
        let pointsText = com.getChild("Points_Text").asTextField;
        let squareText = com.getChild("Square_Text").asTextField;
        let rankText = com.getChild("Rank_Text").asTextField;
        let controller = com.getController("c1");
        let controller2 = com.getController("c2");
        let controller3 = com.getController("c3");
        let background = com.getChild("your_bg").asCom;

        background.visible = false;
        let user = Game.Instance.Data.User;
        if (data.order <= 3) {
            controller2.setSelectedIndex(0);
            controller3.setSelectedIndex(data.order - 1);
        } else {
            controller2.setSelectedIndex(1);
        }
        controller.setSelectedIndex(this.currentPage);
        if (data) {
            let isSelf = false;
            rankText.text = `#${data.order}`;
            if (this.currentPage == 0) {
                pointsText.text = `${data.score} Points`;
                isSelf = user.uid == data.uid;
                // cc.log(user.uid, data.uid);
                background.visible = isSelf;
            } else {
                squareText.text = `${data.score} Times`;
                isSelf = data.uid == user.uid2;
                background.visible = isSelf;
                // cc.log(user.uid2,data.uid)
            }
            if (isSelf) {
                idText.text = Utility.NameFormat(Game.Instance.Data.User.name);  //"Yours";
                if (Game.Instance.Cache.IsLogin) {
                    idText.text = Utility.NameFormat(Game.Instance.Cache.Account.name);
                }

            } else {
                idText.text = Utility.NameFormat(data.uname);
            }
        }
    }

    /**上滑刷新 */
    private PullUpRefres() {
        this.arrow = ScrollArrow.Up;
        let lastItem = this.rankList[this.rankList.length - 1];
        this.footerControl.setSelectedIndex(0);

        if (Game.Instance.Cache.networkerror) {
            fgui.GTween.to(0, 1, 1).setTarget(this.networkText.alpha);
        }

        if (lastItem == null) {
            this.listView.scrollPane.lockFooter(0);
            this.footerControl.setSelectedIndex(1);
            return;
        }

        if (lastItem.order >= this.GetTotal()) {
            this.footerControl.setSelectedIndex(1);
            this.scheduleOnce(() => {
                this.listView.scrollPane.lockFooter(0);
            }, 2);
            return;
        }
        // Utility.DebugLog("PullUpRefres ->" + lastItem.uid.toString());
        if (this.currentPage == 0) {
            Game.Instance.Net.GetScoreFrontAndAfterRankList(lastItem.uid);
        } else {
            Game.Instance.Net.GetRectangleFrontAndAfterRankList(lastItem.uid);
        }
        this.footerControl.setSelectedIndex(0);
        this.listView.scrollPane.lockFooter(this.listView.scrollPane.footer.sourceHeight);
    }

    /**下滑 */
    private PullDownRefres() {
        this.arrow = ScrollArrow.Down;
        let item = this.rankList[0];
        if (item == null) {
            this.listView.scrollPane.lockHeader(0);
            return 0;
        }
        // Utility.DebugLog("PullDownRefres ->" + item.uid.toString());
        if (item.order <= 1) {
            cc.log("到顶了");
            this.listView.scrollPane.lockHeader(0);
            return;
        }

        if (this.currentPage == 0) {
            Game.Instance.Net.GetScoreFrontAndAfterRankList(item.uid);
            // Utility.DebugLog(item.uid.toString());
        } else {
            Game.Instance.Net.GetRectangleFrontAndAfterRankList(item.uid);
        }
        this.listView.scrollPane.lockHeader(this.listView.scrollPane.header.sourceHeight);
    }


    private simulateHintFinished() {
        this.listView.scrollPane.lockHeader(0);
        this.footerControl.setSelectedIndex(0);
        this.listView.scrollPane.lockFooter(0);
    }

    /**更新排名 */
    private UpdateRank(rank: number) {
        this.ranktxt.text = `You are currently at\nposition ` + rank.toString();
    }

    private GetRankList() {
        if (this.currentPage == 0) {
            return Game.Instance.Cache.GetScoreRankList();
        }
        return Game.Instance.Cache.GetSquareRankList();
    }

    /**刷新总人数*/
    private UpdateAllPlayer() {
        // this.allPlayerTxt.text = (this.GetTotal() < 10000 ? 10000 : this.GetTotal()).toString();
        if (this.GetTotal() <= 0) {
            this.allPlayerTxt.text = "100+";
        } else {
            this.allPlayerTxt.text = this.GetTotal().toString();
        }
    }

    /**获取总数 */
    private GetTotal() {
        // cc.log(Game.Instance.Data.User);
        if (this.currentPage == 0) {
            return Game.Instance.Data.User.stotal || 0;
        }
        return Game.Instance.Data.User.ctotal || 0;
    }

    private UpdateSelfInfo() {
        let order = Game.Instance.Data.User.sorder
        if (this.currentPage == 1) {
            order = Game.Instance.Data.User.corder;
        }

        if (order != -1) {
            this.UpdateRank(order);
            this.pointCollter.setSelectedIndex(1);
        } else {
            this.pointCollter.setSelectedIndex(0);
        }

        if (Game.Instance.Cache.IsLogin) {
            Utility.DebugLog(Game.Instance.Cache.Account.name + "  登录");
            this.ShowName(Game.Instance.Cache.Account.name);
        } else {
            this.pointCollter.setSelectedIndex(2);
            // this.ShowName(Game.Instance.Data.User.name);
        }


        this.pointsTtxt.text = Game.Instance.Data.User.score.toString() + " points";
        this.squareTxt.text = Game.Instance.Data.User.combo.toString() + " times";
    }

    private NetworkError() {
        // this.networkText.visible = true;
        this.networkTrs.play();
        this.simulateHintFinished();
    }

    private OnScroll() {

    }

    private OnClickLoginBtn() {
        FGUIMgr.Instance.ShowUI(Consts.ResName.SettView);
    }
}

