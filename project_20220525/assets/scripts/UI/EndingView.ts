import Consts from "../Consts/Consts";
import { GameType, TileColor } from "../Consts/Define";
import BaseView from "../FGUI/BaseView";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import ResMgr from "../Framework/ResMgr";
import Game from "../Game";
import Tile from "../Game/Block/Tile";
import SDKMgr from "../SDK/SDKMgr";

const { ccclass, property } = cc._decorator;
/**游戏结算 */
@ccclass
export default class EndingView extends BaseView {
    private scoreText: fgui.GTextField = null;
    private newGameBtn: fgui.GButton = null;
    private backMainBtn: fgui.GButton = null;

    private dayText: fgui.GTextField = null;
    private monthText: fgui.GTextField = null;
    private weekText: fgui.GTextField = null;
    private historyText: fgui.GTextField = null;

    private dayPlusBtn: fgui.GButton = null;
    private monthPlusBtn: fgui.GButton = null;
    private weekPlusBtn: fgui.GButton = null;
    private historyPlusBtn: fgui.GButton = null;
    private chessRoot: fgui.GComponent = null;
    private tileRoot: cc.Node = null;
    private controller: fgui.Controller = null;

    protected InitUI(): void {
        this.scoreText = this.View.getChild("n11").asTextField;
        this.newGameBtn = this.View.getChild("n36").asButton;
        this.backMainBtn = this.View.getChild("n37").asButton;

        this.dayText = this.View.getChild("DayScore").asTextField;
        this.monthText = this.View.getChild("WeekScore").asTextField;
        this.weekText = this.View.getChild("MonthScore").asTextField;
        this.historyText = this.View.getChild("AllScore").asTextField;

        this.dayPlusBtn = this.View.getChild("DayPlus").asButton;
        this.weekPlusBtn = this.View.getChild("WeekPlus").asButton;
        this.monthPlusBtn = this.View.getChild("MonthPlus").asButton;
        this.historyPlusBtn = this.View.getChild("AllTimePlus").asButton;
        this.chessRoot = this.View.getChild("n22").asCom;

        this.controller = this.View.getController("c1");
    }

    protected InitEvent(): void {
        this.backMainBtn.onClick(this.OnClickBackMainBtn.bind(this), this);
        this.newGameBtn.onClick(this.OnClickNewGameBtn.bind(this), this);
    }

    protected OnShow(): void {
        let score = Game.Instance.Score;
        this.scoreText.text = score.Score.toString();
        let currentScore = score.Score;
        let cache = score.GetScoreCache();
        // Game.Instance.Net.UpdateScore(currentScore);

        let isDay = this.ShowPlus(this.dayPlusBtn, score.Day - cache.day);
        let isWeek = this.ShowPlus(this.weekPlusBtn, score.Week - cache.week);
        let isMonth = this.ShowPlus(this.monthPlusBtn, score.Month - cache.month);
        let isHistory = this.ShowPlus(this.historyPlusBtn, score.History - cache.history);
        GameEventMgr.Instance.EmitEvent(Consts.Event.EUpdateNormalScore);

        this.dayText.text = score.Day.toString();
        this.weekText.text = score.Week.toString();
        this.monthText.text = score.Month.toString();
        this.historyText.text = score.History.toString();

        let matrix = Game.Instance.MapMatrix();
        this.DrawChessboard(matrix);
        if (isDay || isWeek || isMonth || isHistory) {
            this.controller.setSelectedIndex(0);
        } else {
            this.controller.setSelectedIndex(1);
        }
        SDKMgr.Instance.SendNormalModelScore(currentScore);
        Game.Instance.Clear();
        this.PlayWhiteAnim();

        if (isHistory) {
            Game.Instance.Net.UpdateScore(score.History);
        }
    }

    /**画棋牌*/
    private DrawChessboard(matrix: number[]) {
        if (this.tileRoot && this.tileRoot.isValid) {
            this.tileRoot.destroy();
        }

        let tileConf = Game.Instance.TileConfig;
        let res = ResMgr.Instance.GetRes<cc.Prefab>(Consts.ResName.Tile);
        let node = new cc.Node();
        let scale = 0.6;
        this.chessRoot.node.addChild(node);
        node.width = 9 * res.res.data.width;
        node.height = 9 * res.res.data.height;
        node.scale = scale;
        node.position = cc.v3(this.chessRoot.width / 2 - node.width * scale / 2, -this.chessRoot.height / 2 - node.height * scale / 2);
        this.tileRoot = node;
        for (let i = 0; i < matrix.length; i++) {
            let tileId = matrix[i];
            let xIndex = i % 9;
            let yIndex = Math.floor(i / 9);
            let n = cc.instantiate(res.res);

            node.addChild(n);
            let tile = n.getComponent(Tile);
            let x = (xIndex + 0.5) * n.width - this.node.width / 2;
            let y = (8 - yIndex + 0.5) * n.height - this.node.height / 2;
            n.position = cc.v3(x, y);

            if (tileId != 0) {
                let data = tileConf.GetTileToId(tileId);
                let tp = Consts.TilePropertyList[data.Type - 1];
                tile.SetData(tp, 1);
            } else {
                tile.SetData({ tileColor: TileColor.None, spriteFrame: Consts.ResName.Floor, fontColor: cc.color() }, 0);
            }
        }
    }

    private ShowPlus(btn: fgui.GButton, score: number) {
        btn.visible = score > 0;
        btn.title = score.toString();
        return score > 0;
    }

    /**新游戏 */
    private OnClickNewGameBtn() {
        Game.Instance.Cache.GameType = GameType.NormalType;
        GameEventMgr.Instance.EmitEvent(Consts.Event.EStartNewGame);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();
    }

    /**返回主几面 */
    private OnClickBackMainBtn() {
        Game.Instance.Cache.GameType = GameType.NormalType;
        GameEventMgr.Instance.EmitEvent(Consts.Event.EBackMainView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();
    }

    public ViewClose(): void {
        SDKMgr.Instance.FixedTimeShowInterstitial();
    }
}