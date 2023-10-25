import Consts from "../Consts/Consts";
import { GameType } from "../Consts/Define";
import GameCache from "../Data/GameCache";
import SquareEffect from "../Effect/SquareEffect";
import BaseView from "../FGUI/BaseView";
import FGUIMgr from "../FGUI/FGUIMgr";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import ResMgr from "../Framework/ResMgr";
import Game from "../Game";
import SDKMgr from "../SDK/SDKMgr";
import AllTimeScoreTips from "./Tips/AllTimeScoreTips";
import ComboTips from "./Tips/ComboTips";
import ScoreTips from "./Tips/ScoreTips";

const { ccclass, property } = cc._decorator;
/**游戏界面 */
@ccclass
export default class GameView extends BaseView {
    /**控制器 */
    private controller: fgui.Controller = null;
    private scoreText: fgui.GTextField = null;
    private backBtn: fgui.GButton = null;
    private prevScore: number = 0;

    private dailyTileText: fgui.GTextField = null;
    private dailyProgress: fgui.GProgressBar = null;
    private dailyScoreText: fgui.GTextField = null;

    private allTimeScoreText: fgui.GTextField = null;
    private allTimeTileText: fgui.GTextField = null;
    /**奖杯 */
    private trophy: fgui.GComponent = null;
    /**大奖杯*/
    private bigTrophy: fgui.GComponent = null;
    private bigtrophyPos: cc.Vec2 = cc.v2();
    private normalRoot: fgui.GComponent = null;
    private guidNode: cc.Node = null;

    private eventTileText: fgui.GTextField = null;
    private eventScoreText: fgui.GTextField = null;
    private eventProgress: fgui.GProgressBar = null;

    private setBtn: fgui.GButton = null;

    

    protected InitUI(): void {
        this.controller = this.View.getController("Gametype");
        this.controller.setSelectedIndex(1);
        this.scoreText = this.View.getChild("title").asTextField;
        this.backBtn = this.View.getChild("BackBtn").asButton;

        let daily = this.View.getChild("Game-Daily").asCom;

        this.dailyTileText = daily.getChild("Daily-Ttle").asTextField;
        this.dailyProgress = daily.getChild("DailyBar").asProgress;
        this.dailyScoreText = daily.getChild("Daily-score").asTextField

        this.normalRoot = this.View.getChild("Game-Pt").asCom;
        this.allTimeScoreText = this.normalRoot.getChild("title").asTextField;
        this.allTimeTileText = this.normalRoot.getChild("All").asTextField;

        this.trophy = this.View.getChild("Pt-Jb").asCom;
        this.bigTrophy = this.View.getChild("BigTrophy").asCom;
        this.bigtrophyPos = cc.v2(this.bigTrophy.x, this.bigTrophy.y);
        // this.trophy.visible = Game.Instance.Score.IsRecord();

        let event = this.View.getChild("Game-Event").asCom;
        this.eventTileText = event.getChild("Daily-Ttle").asTextField;
        this.eventScoreText = event.getChild("Daily-score").asTextField;
        this.eventProgress = event.getChild("DailyBar").asProgress;

        this.setBtn = this.View.getChild("SetBtn").asButton;
    }

    protected InitEvent(): void {
        this.backBtn.onClick(this.onClickBackBtn.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EUpdateCurrentScore, this.UpdateScore.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EGameOver, this.GameOverEvent.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECompleteDilyChallenges, this.CompleteDilyChallenges.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECompleteEventChallenges, this.CompleteEventChallenges.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EAddScoreAction, this.AddScoreAction.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EComboAction, this.ComboAction.bind(this), this);

        GameEventMgr.Instance.AddEvent(Consts.Event.EDayRecord, this.DayRecord.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EWeekRecord, this.WeekRecord.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EMonthRecord, this.MonthRecord.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EHistoryRecord, this.HistoryRecord.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ESquareEffect, this.SquareEffect.bind(this), this);
        // GameEventMgr.Instance.AddEvent(Consts.Event.EFinishChessGuid, this.FinishChessGuid.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EResetChessGuidStep, this.ResetChessGuidStep.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECloseSetting, this.CloseSetting.bind(this), this);
        this.setBtn.onClick(this.OnClickSetBtn.bind(this), this);

    }

    protected OnShow(): void {

        let score = Game.Instance.GetCurrentScore();
        this.scoreText.text = score.toString();
        this.controller.setSelectedIndex(Game.Instance.Cache.GameType);
        let cache = Game.Instance.Cache;

        if (cache.GameType == GameType.GuideType) {
            if (this.guidNode == null || !this.guidNode.isValid) {
                let res = ResMgr.Instance.GetRes<cc.Prefab>(Consts.ResName.Mask);
                let node = cc.instantiate(res.res);
                this.View.node.addChild(node);
                this.guidNode = node;
            }
        }

        if (cache.GameType == GameType.NormalType) {
            this.UpdateRecord();
        } else if (cache.GameType == GameType.DailyType) {
            let date = cache.SelectDate;
            this.dailyTileText.text = `${Consts.Months[date.month - 1]} ${date.day + 1}`;
            this.dailyScoreText.text = `${Game.Instance.GetTargetScore()}`;
        } else if (cache.GameType == GameType.EventType) {
            this.eventTileText.text = "";
            let targetScore = Game.Instance.GetTargetScore();
            this.eventScoreText.text = `${targetScore}`;
            this.eventProgress.value = Math.floor(score / targetScore * 100);
        }

        this.PlayWhiteAnim();
        this.scheduleOnce(() => {
            SDKMgr.Instance.ShowNativeAD();
        }, 0.5);

        this.trophy.visible = Game.Instance.Score.IsRecord();

        if (cache.GameType != GameType.GuideType) {
            SDKMgr.Instance.ShowBanner();
        }

    }

    private onClickBackBtn() {
        cc.log("Click-onClickBackBtn");
        GameEventMgr.Instance.EmitEvent(Consts.Event.EBackMainView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();
    }

    /**刷新分数 */
    private UpdateScore() {
        let targetScore = Game.Instance.GetCurrentScore();
        fgui.GTween.to(this.prevScore, targetScore, 0.2).onUpdate((t: fgui.GTweener) => {
            this.scoreText.text = Math.floor(t.value.x).toString();
            if (Game.Instance.Cache.GameType == GameType.EventType) {
                let value = Math.floor(t.value.x / Game.Instance.GetTargetScore() * 100);
                this.eventProgress.value = value;
            }
        }, this);
        this.prevScore = targetScore;
    }

    /**添加分数 */
    private AddScoreAction(score: number, pos: cc.Vec2) {

        pos = this.View.globalToLocal(pos.x, pos.y);
        let scoreItem = fgui.UIPackage.createObject("GamePackage", "ScoreTips", ScoreTips);
        let tips = scoreItem as ScoreTips;
        tips.SetData(score);
        let px = Math.max(pos.x - scoreItem.width / 2, -scoreItem.width / 2 + 30);
        let py = this.View.height - pos.y - scoreItem.height / 2 - 150;

        px = Math.min(px, this.View.width - scoreItem.width / 2 - 30);

        scoreItem.setPosition(px, py);
        this.View.addChild(scoreItem);
        scoreItem.setScale(0, 0);

        fgui.GTween.to2(0, 0, 1, 1, 0.5).setTarget(scoreItem, scoreItem.setScale).setEase(fgui.EaseType.BackOut).onComplete(() => {
            fgui.GTween.to2(px, py, px, py - 100, 0.5).setDelay(0.5).setTarget(scoreItem, scoreItem.setPosition).setEase(fgui.EaseType.BackOut).onComplete(() => {
                scoreItem.dispose();
            }, this);
        })
    }

    /**连击次数 */
    private ComboAction(comboCount: number, pos: cc.Vec2) {
        if (comboCount < 2) {
            return;
        }

        pos = this.View.globalToLocal(pos.x, pos.y);
        let comboTips = fgui.UIPackage.createObject("GamePackage", "ComboTips", ComboTips);
        let tips = comboTips as ComboTips;
        tips.SetData(comboCount);
        let px = Math.max(pos.x - comboTips.width / 2, -comboTips.width / 2 + 30);
        let py = this.View.height - pos.y - comboTips.height / 2 - 300;
        px = Math.min(px, this.View.width - comboTips.width / 2 - 30);

        comboTips.setPosition(px, py);
        this.View.addChild(comboTips);
        comboTips.setScale(0, 0);

        fgui.GTween.to2(0, 0, 1, 1, 0.5).setTarget(comboTips, comboTips.setScale).setEase(fgui.EaseType.BackOut).onComplete(() => {
            fgui.GTween.to2(px, py, px, py - 100, 0.5).setDelay(0.5).setTarget(comboTips, comboTips.setPosition).setEase(fgui.EaseType.BackOut).onComplete(() => {
                comboTips.dispose();
            }, this);
        });
    }

    /**天纪录 */
    private DayRecord() {
        this.RecordAction();
        this.ShowRecordTips(0);
    }

    /**周纪录 */
    private WeekRecord() {
        this.RecordAction();
        this.ShowRecordTips(1);
    }
    /**月纪录 */
    private MonthRecord() {
        this.RecordAction();
        this.ShowRecordTips(2);
    }

    /**历史纪录 */
    private HistoryRecord() {
        this.RecordAction();
        this.ShowRecordTips(3);
    }

    /**特效*/
    private SquareEffect(tile: number) {
        SDKMgr.Instance.RectangleEliminate();
        let res = ResMgr.Instance.GetRes<cc.Prefab>(Consts.ResName.SquareEffect)
        let pb = cc.instantiate(res.res);
        this.View.node.addChild(pb);


        pb.position = cc.v3(cc.winSize.width / 2 + 50, -cc.winSize.height / 2 - 700);
        pb.getComponent(SquareEffect).PlayAnim(tile);
    }

    /**破纪录动作*/
    private RecordAction() {
        let targetPos = cc.v2(this.trophy.x, this.trophy.y);
        this.bigTrophy.visible = true;
        let scale = this.bigTrophy.scaleX;
        fgui.GTween.to3(this.bigtrophyPos.x, targetPos.x, this.bigTrophy.scaleX, this.bigtrophyPos.y, targetPos.y, 1, 0.5).
            onUpdate((tw: fgui.GTweener) => {
                let x = tw.value.x;
                let y = tw.value.y;
                let z = tw.value.z;
                this.bigTrophy.setPosition(x, y);
                this.bigTrophy.setScale(z, z);
            }).onComplete(() => {
                this.bigTrophy.visible = false;
                this.bigTrophy.setScale(scale, scale);
                this.bigTrophy.setPosition(this.bigtrophyPos.x, this.bigtrophyPos.y);
                this.trophy.visible = true;
            })
        AudioMgr.Instance.PlayEffect(Consts.ResName.pojilu);

        let obj = Game.Instance.EffectPool.Pop(Consts.ResName.RecordBreaking);
        obj.position = cc.v3(0, 0);
        this.scoreText.node.addChild(obj);

        cc.tween(this.scoreText.node).delay(1.0).call(() => {
            let obj = Game.Instance.EffectPool.Pop(Consts.ResName.RecordBehindEffect);
            this.node.addChild(obj);
            obj.position = cc.v3(cc.winSize.width / 2, cc.winSize.height);
        }).start();
    }

    private ShowRecordTips(index: number) {
        let tx = Consts.RecordTips[index];
        let recordTips = fgui.UIPackage.createObject("GamePackage", "AllTimeScoreTips", AllTimeScoreTips);
        let tips = recordTips as AllTimeScoreTips;
        tips.SetData(tx);
        recordTips.setPosition(this.View.width / 2 - recordTips.width / 2, this.View.height / 2 - recordTips.height / 2 - 200);
        this.View.addChild(recordTips);
        recordTips.setScale(0, 0);

        fgui.GTween.to2(0, 0, 1, 1, 0.5).setTarget(recordTips, recordTips.setScale).onComplete(() => {
            fgui.GTween.to2(1, 1, 0, 0, 0.5).setDelay(1).setTarget(recordTips, recordTips.setScale).onComplete(() => {
                recordTips.dispose();
            }, this);
        }, this);
        this.UpdateRecord();
    }

    private UpdateRecord() {
        let data = Game.Instance.Score.GetLowestScore();
        if (data) {
            this.normalRoot.visible = true;
            this.allTimeScoreText.text = data.score.toString();
            this.allTimeTileText.text = data.title;
        } else {
            this.normalRoot.visible = false;
        }
    }

    private GameOverEvent() {
        this.Close();
    }


    private ResetChessGuidStep() {
        this.Close();
    }


    /**完成每日挑战 */
    private CompleteDilyChallenges() {
        this.Close();
    }

    private CompleteEventChallenges() {
        this.Close();
    }

    public ViewClose(): void {
        SDKMgr.Instance.HideNativeAD();
        SDKMgr.Instance.HideBanner();
    }

    private OnClickSetBtn() {
        FGUIMgr.Instance.ShowUI(Consts.ResName.SettView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        SDKMgr.Instance.HideBanner();
    }

    private CloseSetting() {
        if (this.node.active) {
            SDKMgr.Instance.ShowBanner();
        }
    }
}