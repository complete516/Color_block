import Tile from "./Block/Tile";
import Consts from "../Consts/Consts";
import { GameType, TileColor } from "../Consts/Define";
import { GameEventMgr } from "../Framework/GameEvent";
import ResMgr from "../Framework/ResMgr";
import Game from "../Game";
import GameControl from "./GameControl";
import Utility from "../Utility";
import AudioMgr from "../Framework/AudioMgr";
import RectanglePromptTips from "../UI/Tips/RectanglePromptTips";


const { ccclass, property } = cc._decorator;
/**棋盘 画棋盘和棋子的 */
@ccclass
export default class Chessboard extends cc.Component {

    /**块的位置 */
    private tileLocation: cc.Vec2[] = [];
    private tileList: Tile[] = [];
    /**块节点*/
    private tileNodeList: cc.Node[] = [];

    private gameControll: GameControl = null;

    private mapMatrix: number[] = [];
    private isFirst: boolean = true;
    /**当前时间 */
    private currentTime: number = 0;
    private isStartFriendy: boolean = true;

    private rectanglePromptTips: RectanglePromptTips = null;

    protected onEnable(): void {
        if (!this.isFirst) {
            this.InitGame();
        }
        this.isFirst = false;
    }

    protected onDisable(): void {
        this.isStartFriendy = false;
        this.currentTime = 0;
        this.EndFriendlyTips();
    }

    protected onLoad(): void {
        this.gameControll = this.node.parent.getComponent(GameControl);
        let res = ResMgr.Instance.GetRes<cc.Prefab>(Consts.ResName.RectanglePromptTips);
        let node = cc.instantiate(res.res);
        this.node.addChild(node, cc.macro.MAX_ZINDEX - 1);
        this.rectanglePromptTips = node.getComponent(RectanglePromptTips);
        this.rectanglePromptTips.Chessboard();
        node.active = false;
    }


    protected start(): void {
        this.InitEvent();
        if (Game.Instance.Cache.GameType != GameType.GuideType) {
            this.InitGame();
        }

    }

    protected update(dt: number): void {
        if (Game.Instance.Cache.GameType == GameType.GuideType) {
            return;
        }

        if (Game.Instance.Cache.GameOver) {
            this.currentTime = 0;
            this.isStartFriendy = false;
            return;
        }

        if (this.isStartFriendy) {
            this.currentTime += dt;
            if (this.currentTime >= 3) {
                this.isStartFriendy = false;
                this.StartFriendlyTips();
            }
        }
    }

    private InitEvent() {
        GameEventMgr.Instance.AddEvent(Consts.Event.EUnionChessboard, this.PlaceBlock.bind(this), this);
        // GameEventMgr.Instance.AddEvent(Consts.Event.EEliminateBlock, this.EliminateBlockEvent.bind(this), this);
        // GameEventMgr.Instance.AddEvent(Consts.Event.ERectangleEliminate, this.RectangleEliminateEvent.bind(this), this);

        GameEventMgr.Instance.AddEvent(Consts.Event.EUnifyEliminate, this.UnifyEliminateEvent.bind(this), this);

        GameEventMgr.Instance.AddEvent(Consts.Event.EUnionMove, this.ShowShadow.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ENotUnionMove, this.HideShadow.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ESameBlockHighlight, this.SameBlockHighlight.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ERectangleBlockHighlight, this.RectangleBlockHighlight.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECanCelSameBlockHighlight, this.CanCelSameBlockHighlight.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EStartChessGuidStep, this.StartChessGuidStep.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EResetChessGuidStep, this.ResetChessGuidStep.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EShowFriendlyTips, this.ShowFriendlyTipsTile.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EToucnBlock, this.ToucnBlock.bind(this), this);

        GameEventMgr.Instance.AddEvent(Consts.Event.EStartRectanglePrompt, this.StartRectanglePrompt.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EEndRectanglePrompt, this.EndRectanglePrompt.bind(this), this);
        // GameEventMgr.Instance.AddEvent(Consts.Event.EEndFriendlyTips, this.EndFriendlyTips.bind(this), this);
    }

    private StartChessGuidStep() {
        if (Game.Instance.GameGuide.NormalGuideStep <= 2) {
            this.InitGame();
        }
    }

    private ResetChessGuidStep() {
        this.InitGame();
    }

    private InitGame() {

        this.currentTime = 0;
        this.isStartFriendy = true;

        this.DrawChessboard();
    }

    private ShowShadow(indices: { x: number, y: number }[]) {
        this.EndFriendlyTips();
        this.ShowFloor();
        for (let i = 0; i < indices.length; i++) {
            let p = indices[i];
            let tile = this.tileList[p.y * 9 + p.x];
            tile.SetData(this.Shadow);
            tile.StopFriendlyAction();
        }
        this.currentTime = 0;
        this.isStartFriendy = false;
    }

    private HideShadow() {
        // cc.log("HideShadow");
        this.ShowFloor();
        this.currentTime = 0;
        this.isStartFriendy = true;
    }

    private ShowFloor() {
        for (let tile of this.tileList) {
            if (tile.TileColor == TileColor.Shadow) {
                tile.SetData(this.FloorProperty);
            }
        }
    }


    /**相同方块高亮 */
    private SameBlockHighlight(blockList: { x: number, y: number }[]) {
        for (let i = 0; i < blockList.length; i++) {
            let p = blockList[i];
            let index = p.y * 9 + p.x;
            let tile = this.tileList[index];
            if (tile.TileColor > TileColor.Shadow) {
                // cc.log(tile.TileColor)
                tile.node.opacity = 120;
            }
        }
    }

    /**矩形方块高亮*/
    private RectangleBlockHighlight(tileColor: number) {
        // let index = x + y * 9;
        // let id = this.mapMatrix[index];
        // let type = Game.Instance.TileConfig.GetTileToId(id).Type;
        // let tileColor = Consts.TilePropertyList[type - 1].tileColor;

        // cc.log(tileColor)
        for (let i = 0; i < this.tileList.length; i++) {
            let tile = this.tileList[i];
            if (tile.TileColor == tileColor) {
                // tile.node.opacity = 120;
                tile.Twinkle();
            }
        }
    }


    /**取消高亮 */
    private CanCelSameBlockHighlight() {
        for (let i = 0; i < this.tileList.length; i++) {
            let tile = this.tileList[i];
            tile.node.opacity = 255;
            tile.StopTwinkle();
        }
    }

    // /**消除方块 */
    // private EliminateBlockEvent(indices: { x: number, y: number }[], combo: number) {
    //     let count = indices.length;
    //     for (let i = 0; i < indices.length; i++) {
    //         let p = indices[i];
    //         let index = p.y * 9 + p.x;
    //         let tile = this.tileList[index];
    //         tile.Count--;
    //         if (tile.Count <= 0) {
    //             tile.Action(this.FloorProperty, i * 0.05);
    //             this.mapMatrix[index] = 0;
    //         }
    //         tile.RefreshCountText();
    //     }


    //     let startPoint = indices[0]
    //     let startPos = this.tileList[startPoint.y * 9 + startPoint.x].node.position;
    //     this.ScoreAndEvent(count, startPos, combo);

    // }

    // /**矩形消除*/
    // private RectangleEliminateEvent(tileColor: number, x: number, y: number) {
    //     let count: number = 0;
    //     for (let i = 0; i < this.tileList.length; i++) {
    //         let tile = this.tileList[i];
    //         if (tile.TileColor == tileColor) {
    //             --tile.Count;
    //             if (tile.Count <= 0) {
    //                 let dy = count * 0.05;
    //                 tile.Action(this.FloorProperty, Math.min(dy, 0.2), true);
    //                 this.mapMatrix[i] = 0;
    //             }
    //             tile.RefreshCountText();
    //             count++;
    //         }
    //     }
    //     let index = y * 9 + x;
    //     let startPos = this.tileList[index].node.position;
    //     this.ScoreAndEvent(count, startPos);
    // }

    /**联合消除事件 */
    private UnifyEliminateEvent(fList: { x: number, y: number }[], rectColorList: TileColor[], rectPoint: { x: number, y: number }[]) {
        let count: number = fList.length || 0;
        let startPos: cc.Vec3 = null;
        if (fList.length > 0) {
            for (let i = 0; i < fList.length; i++) {
                let p = fList[i];
                let index = p.y * 9 + p.x;
                let tile = this.tileList[index];
                tile.Count--;
                if (tile.Count <= 0) {
                    tile.Action(this.FloorProperty, i * 0.05);
                    this.mapMatrix[index] = 0;
                }
                tile.RefreshCountText();
            }
            let startPoint = fList[0]
            startPos = this.tileList[startPoint.y * 9 + startPoint.x].node.position;
        }

        if (rectColorList.length > 0) {
            for (let tileColor of rectColorList) {
                for (let i = 0; i < this.tileList.length; i++) {
                    let tile = this.tileList[i];
                    if (tile.TileColor == tileColor) {
                        tile.StopTwinkle();
                        --tile.Count;
                        if (tile.Count <= 0) {
                            let dy = count * 0.05;
                            tile.Action(this.FloorProperty, Math.min(dy, 0.2), true);
                            this.mapMatrix[i] = 0;
                        }
                        tile.RefreshCountText();
                        count++;
                    }
                }
            }
            let p = rectPoint[0];
            let index = p.y * 9 + p.x;
            startPos = this.tileList[index].node.position;
        }
        this.ScoreAndEvent(count, startPos);
    }

    /**分数和事件处理*/
    private ScoreAndEvent(count: number, startPos: cc.Vec3, combo: number = 1) {
        if (Game.Instance.Cache.GameType == GameType.GuideType) {
            // GameEventMgr.Instance.EmitEvent(Consts.Event.EFinishChessGuidStep);
        } else {
            //数量x(连续消除次数+3)
            let wp = this.node.convertToWorldSpaceAR(cc.v3(startPos));
            GameEventMgr.Instance.EmitEvent(Consts.Event.EAddComboCount, combo);
            GameEventMgr.Instance.EmitEvent(Consts.Event.EComboAction, Game.Instance.Cache.Combo, cc.v3(wp));
            let score = count * (Game.Instance.Cache.Combo + 3);
            GameEventMgr.Instance.EmitEvent(Consts.Event.EAddScore, score);
            GameEventMgr.Instance.EmitEvent(Consts.Event.EAddScoreAction, score, cc.v3(wp));
            this.UpdateMatrix();
            Utility.PhoneVibrator();
        }

        AudioMgr.Instance.PlayEffect(Consts.ResName.xiaochu);
    }


    /**放置方块 */
    private PlaceBlock(indices: { x: number, y: number }[], tileIndexList: number[]) {
        let tileList = Game.Instance.TileConfig.GetNormalTileList();

        for (let i = 0; i < indices.length; i++) {
            let p = indices[i];
            let index = p.y * 9 + p.x;
            let tile = this.tileList[index];

            let data = tileList[tileIndexList[i]];
            this.mapMatrix[index] = data.Id;
            tile.SetData(Consts.TilePropertyList[data.Type - 1]);
        }

        this.UpdateMatrix();
        Utility.PhoneVibrator();
        this.isStartFriendy = true;
        this.currentTime = 0;
        this.EndFriendlyTips();
    }

    /**画棋盘 */
    private DrawChessboard() {
        let row = 9;
        let column = 9;
        this.tileLocation = [];
        this.tileList = [];
        let res = ResMgr.Instance.GetRes<cc.Prefab>(Consts.ResName.Tile);
        this.mapMatrix = [];
        this.node.width = column * res.res.data.width;
        this.node.height = row * res.res.data.height;

        let tileConf = Game.Instance.TileConfig;
        let matrix = this.GetMergeMatrix();

        for (let i = 0; i < matrix.length; i++) {
            let tileId = matrix[i];
            let xIndex = i % 9;
            let yIndex = Math.floor(i / 9);

            let n = this.tileNodeList[i];
            if (n == null) {
                n = cc.instantiate(res.res);
                this.tileNodeList.push(n);
                this.node.addChild(n);
            }
            let tile = n.getComponent(Tile);

            let x = (xIndex + 0.5) * n.width - this.node.width / 2;
            let y = (8 - yIndex + 0.5) * n.height - this.node.height / 2;

            n.position = cc.v3(x, y);
            this.tileLocation.push(cc.v2(x, y));
            tile.node.active = true;
            if (tileId != 0) {
                let data = tileConf.GetTileToId(tileId);
                if (data.Type == -1) {
                    tile.node.active = false;
                    tile.SetData(this.FloorProperty, 0);
                } else {
                    let count = Game.Instance.GetTileCount(i, data.Type);
                    let tp = Consts.TilePropertyList[data.Type - 1];
                    tile.SetData(tp, count);
                }
            } else {
                tile.SetData(this.FloorProperty, 0);
            }

            let ix = xIndex + (8 - yIndex) * 9;
            this.tileList[ix] = tile;
            this.mapMatrix[ix] = tileId;
        }
        this.gameControll.SetCheckRect(this.node.width, this.node.height, this.mapMatrix);
    }

    /**获取底板属性 */
    private get FloorProperty() {
        return { tileColor: TileColor.None, spriteFrame: Consts.ResName.Floor, fontColor: cc.color(), color: cc.color() };
    }

    /**获取合并的矩阵 */
    private GetMergeMatrix() {

        let matrix: number[] = [];
        matrix = Game.Instance.MapMatrix();
        if (matrix && matrix.length > 0) {
            return matrix;
        }

        let mapConf = Game.Instance.MapConfig;
        let terrainConf = Game.Instance.TerrainConfig;
        let mapList = mapConf.GetAllMap();
        let terrainList = terrainConf.GetTerrain();
        let data = Game.Instance.GetMapIndex();

        let mIndex = data.mIndex;
        let tIndex = data.tIndex;

        // cc.log(mIndex, tIndex, "GetMergeMatrix");

        let mMatrix = mapList[mIndex];
        let tMatrix = terrainList[tIndex];

        for (let i = 0; i < mMatrix.length; i++) {
            let mData = mMatrix[i];
            let tData = tMatrix[i];
            if (mData != 0) {
                matrix.push(mData);
            } else {
                matrix.push(tData);
            }
        }
        return matrix;
    }

    /**刷新矩阵 */
    private UpdateMatrix() {
        if (Game.Instance.Cache.GameType == GameType.NormalType) {
            GameEventMgr.Instance.EmitEvent(Consts.Event.EUpdateNormalMatrix, this.mapMatrix);
        } else if (Game.Instance.Cache.GameType == GameType.DailyType ||
            Game.Instance.Cache.GameType == GameType.EventType) {
            let countList: number[] = [];
            for (let i = 0; i < this.tileList.length; i++) {
                countList.push(this.tileList[i].Count);
            }
            GameEventMgr.Instance.EmitEvent(Consts.Event.EUpdateMapMatrix, this.mapMatrix, countList);
        }
    }

    /**显示友情提示块 */
    private ShowFriendlyTipsTile(indices: { x: number, y: number }[]) {
        this.EndFriendlyTips();
        if (Game.Instance.Cache.GameOver) {
            return;
        }

        for (let i = 0; i < indices.length; i++) {
            let p = indices[i];
            let index = p.y * 9 + p.x;
            let tile = this.tileList[index];
            if (!tile.IsFriendly) {
                tile.SetData(this.Friendly);
                tile.FriendlyAction();
            }
        }
    }

    private EndFriendlyTips() {
        for (let tile of this.tileList) {
            if (tile.TileColor == TileColor.FriendlyTips) {
                tile.StopFriendlyAction();
                tile.SetData(this.FloorProperty);
            }
        }

        GameEventMgr.Instance.EmitEvent(Consts.Event.EEndRectanglePrompt);
    }

    /**开始友情提示 */
    private StartFriendlyTips() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.EStartFriendlyTips);
    }

    /**点击方块 */
    private ToucnBlock() {
        this.EndFriendlyTips();
        this.currentTime = 0;
        this.isStartFriendy = true;
    }

    /**游戏提示 */
    private get Friendly() {
        return { tileColor: TileColor.FriendlyTips, spriteFrame: "yinying", fontColor: cc.color(), color: cc.color() }
    }

    /**阴影 */
    private get Shadow() {
        return { tileColor: TileColor.Shadow, spriteFrame: "yinying", fontColor: cc.color(), color: cc.color() };
    }

    /**开始田字格消除提示 */
    private StartRectanglePrompt(_: number, indices: { x: number, y: number }[]) {
        let index = indices[0].x + (8 - indices[0].y) * 9;
        let pos = cc.v3(this.tileLocation[index]);
        pos.x += this.tileList[0].node.width / 2;
        pos.y += this.tileList[0].node.height / 2;
        this.rectanglePromptTips.ShowPrompt(pos);
    }

    private EndRectanglePrompt() {
        this.rectanglePromptTips.Hide();
    }

}

