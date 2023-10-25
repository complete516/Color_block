import ConfigMgr from "../Config/ConfigMgr";
import Consts from "../Consts/Consts";
import { TileColor } from "../Consts/Define";
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

export default class EventEndingView extends BaseView {
    private controller: fgui.Controller = null;
    private continueBtn: fgui.GButton = null;
    private resetBtn: fgui.GButton = null;
    private chessRoot: fgui.GComponent = null;
    private mainBtn: fgui.GButton = null;
    tileRoot: cc.Node = null;

    protected InitUI(): void {
        this.controller = this.View.getController("c1");
        this.continueBtn = this.View.getChild("n40").asButton;
        this.resetBtn = this.View.getChild("n36").asButton;
        this.chessRoot = this.View.getChild("n22").asCom;
        this.mainBtn = this.View.getChild("n41").asButton;
    }

    protected InitEvent(): void {
        this.continueBtn.onClick(this.OnClickContinueBtn.bind(this), this);
        this.resetBtn.onClick(this.OnClickResetBtn.bind(this), this);
        this.mainBtn.onClick(this.OnClickMainBtn.bind(this), this);
    }

    protected OnShow(): void {
        let maxScore = Game.Instance.GetTargetScore();
        let currScore = Game.Instance.GetCurrentScore();
        if (currScore >= maxScore) {
            this.controller.setSelectedIndex(0);
        } else {
            this.controller.setSelectedIndex(1);
        }

        let matrix = Game.Instance.MapMatrix();
        this.DrawChessboard(matrix);
        Game.Instance.Clear();
        this.PlayWhiteAnim();

        let data = Game.Instance.GetEventDefaultSelect();
        if (Game.Instance.Cache.CurrentEventIndex != data.index) {
            let date = Game.Instance.Date;
            let time = `${date.Day}/${date.Month}/${date.Year}`;
            let conf = Game.Instance.EventTimeConfig.OpenEvent();
            Game.Instance.Reward.AddTextureList(conf.Id, time);
        }
    }

    private OnClickContinueBtn() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.EEventChallenges);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();
    }

    private OnClickResetBtn() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.EStartNewGame);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();
    }

    private OnClickMainBtn() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.EBackMainView);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();
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
                if (data.Type != -1) {
                    let tp = Consts.TilePropertyList[data.Type - 1];
                    let count = Game.Instance.GetTileCount(i, data.Type);
                    tile.SetData(tp, count);
                } else {
                    n.active = false;
                }
            } else {
                tile.SetData({ tileColor: TileColor.None, spriteFrame: Consts.ResName.Floor, fontColor: cc.color() }, 0);
            }
        }
    }


    public ViewClose(): void {
        SDKMgr.Instance.FixedTimeShowInterstitial();
    }

}