import Consts from "../Consts/Consts";
import { GameType, TileColor } from "../Consts/Define";
import SquareEffect from "../Effect/SquareEffect";
import { GameEventMgr } from "../Framework/GameEvent";
import ResMgr from "../Framework/ResMgr";
import Game from "../Game";
import SDKMgr from "../SDK/SDKMgr";
import Utility from "../Utility";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameControl extends cc.Component {
    /**临时矩阵*/
    private tempMatrix: number[] = [];

    private chessRect: cc.Rect = null;
    /**大小偏移范围 */
    private sizeOffset: cc.Vec2 = cc.v2(110, 110);
    /**行 */
    private row: number = 9;
    /**列 */
    private column: number = 9;
    /**是否放置 */
    private isPlace: boolean = false;
    /**和棋盘同步的矩阵*/
    private currentMatrix: number[] = [];

    //以当前点位起点，构建4个正方形 满足其中一个就可以消除了
    private readonly pointRect: cc.Vec2[][] = [
        [cc.v2(-1, 0), cc.v2(0, 1)],
        [cc.v2(-1, -1), cc.v2(0, 0)],
        [cc.v2(0, 0), cc.v2(1, 1)],
        [cc.v2(0, -1), cc.v2(1, 0)]
    ]

    start() {
        this.InitEvent();
    }

    public SetCheckRect(w: number, h: number, matrix: number[]) {
        this.node.width = w + this.sizeOffset.x;
        this.node.height = h + this.sizeOffset.y;
        let width = this.node.width;
        let height = this.node.height;
        let pos = this.node.parent.convertToWorldSpaceAR(this.node.position);

        this.chessRect = new cc.Rect(pos.x - width / 2, pos.y - height / 2, width, height);
        this.currentMatrix = matrix;
        this.UpdateTempMatrix();
    }

    private InitEvent() {
        GameEventMgr.Instance.AddEvent(Consts.Event.ETouchEndBlock, this.TouchEndBlockEvent.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ETouchMoveBlock, this.TouchMoveBlockEvent.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECheckGameState, this.CheckGameState.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EStartFriendlyTips, this.StartFriendlyTips.bind(this), this);
    }

    /**触摸结束 方块*/
    private TouchEndBlockEvent(rect: cc.Rect, blockType: number, index: number, normalTileList: number[], iskWarehouse: boolean) {
        GameEventMgr.Instance.EmitEvent(Consts.Event.ECanCelSameBlockHighlight);
        if (this.chessRect.containsRect(rect)) {
            this.UpdateTempMatrix();
            this.isPlace = true;
            let location = this.GetChessLocation(rect);
            let indices = this.GetProjectionPoint(location.x, location.y, blockType);

            if (Game.Instance.Cache.GameType == GameType.GuideType) {
                let gInices = Game.Instance.GameGuide.NormalInices();
                if (indices[0].x == gInices.x && indices[0].y == gInices.y) {
                    GameEventMgr.Instance.EmitEvent(Consts.Event.EUnionChessboard, indices, normalTileList);
                    this.UpdateTempMatrix();
                    this.CheckTileColor(indices);
                    GameEventMgr.Instance.EmitEvent(Consts.Event.EPlaceBlock, blockType, index);
                } else {
                    GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionChessboard);
                    // GameEventMgr.Instance.EmitEvent(Consts.Event.ECheckWarehouse, rect, blockType,index);
                    GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionMove);
                }
                return;
            }

            if (this.IsLocationEmpty(indices)) {
                GameEventMgr.Instance.EmitEvent(Consts.Event.EUnionChessboard, indices, normalTileList);
                this.UpdateTempMatrix();
                this.CheckTileColor(indices);
                GameEventMgr.Instance.EmitEvent(Consts.Event.EPlaceBlock, blockType, index);
            } else {
                // GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionChessboard);
                GameEventMgr.Instance.EmitEvent(Consts.Event.ECheckBlockLocation, rect, blockType, index);
            }
        } else {
            // GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionChessboard);
            GameEventMgr.Instance.EmitEvent(Consts.Event.ECheckBlockLocation, rect, blockType, index);
        }
        GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionMove);
    }

    /**移动方块 */
    private TouchMoveBlockEvent(rect: cc.Rect, blockType: number, tileIndexList: number[]) {

        GameEventMgr.Instance.EmitEvent(Consts.Event.ECanCelSameBlockHighlight);
        if (this.chessRect.containsRect(rect)) {
            this.UpdateTempMatrix();
            this.isPlace = false;
            let location = this.GetChessLocation(rect);
            let indices = this.GetProjectionPoint(location.x, location.y, blockType);

            if (this.IsLocationEmpty(indices)) {
                for (let i = 0; i < indices.length; i++) {
                    let p = indices[i];
                    let index = p.y * 9 + p.x;
                    let data = Game.Instance.TileConfig.GetNormalTileList()[tileIndexList[i]];
                    this.tempMatrix[index] = data.Id;
                }
                this.CheckTileColor(indices);
                GameEventMgr.Instance.EmitEvent(Consts.Event.EUnionMove, indices, blockType);
            } else {
                GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionMove);
            }
        } else {
            GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionMove);
        }
    }

    /**获取在棋盘上的位置 */
    private GetChessLocation(rect: cc.Rect) {
        let re = cc.rect(0, 0, 0, 0);
        this.chessRect.intersection(re, rect);
        let startX = re.x - this.chessRect.x;
        let startY = re.y - this.chessRect.y;
        let ox = 0;
        let oy = 10;

        let sx = startX + ox;
        let sy = startY + oy;

        let x = Math.round(sx / ((this.chessRect.width) / this.row));
        let y = Math.round(sy / ((this.chessRect.height) / this.column));
        return { x: x, y: y };
    }

    /**获取投影位置 */
    private GetProjectionPoint(xIndex: number, yIndex: number, blockType: number) {
        let martix = Game.Instance.BlockConfig.GetAllBlock()[blockType];
        let points: { x: number, y: number }[] = [];
        for (let i = 0; i < martix.length; i++) {
            if (martix[i] == 1) {
                let x = i % 4;
                let y = Math.floor(i / 4);
                points.push({ x: x + xIndex, y: y + yIndex });
            }
        }
        return points;
    }

    /**这个位置是否是空位 */
    private IsLocationEmpty(indices: { x: number, y: number }[]) {

        for (let i = 0; i < indices.length; i++) {
            let p = indices[i];
            let y = p.y;

            if (p.x > 8 || y > 8) {
                return false;
            }

            if (this.tempMatrix[y * this.row + p.x] != 0) {
                return false;
            }
        }
        return true;
    }

    /**检查块的颜色*/
    private CheckTileColor(indices: { x: number, y: number }[]) {
        let totalSameTileList: { x: number, y: number }[] = [];
        let rectList: { x: number, y: number }[][] = [];
        let phPos: { x: number, y: number } = cc.v2(0, 0);
        let pvPos: { x: number, y: number } = cc.v2(0, 0);
        let count: number = 0;

        for (let i = 0; i < indices.length; i++) {
            let sameTileList: { x: number, y: number }[] = [];
            let vertex = indices[i];
            let vx = vertex.x;
            let vy = vertex.y;
            let hList = this.CheckHorizontal(vx, vy);
            let vList = this.CheckVertical(vx, vy);

            if (hList.length >= 3) {
                sameTileList = sameTileList.concat(hList);
                if (phPos.x != vx && phPos.y != vy) {
                    count++;
                }
                phPos = vertex;
            }

            if (vList.length >= 3) {
                sameTileList = sameTileList.concat(vList);
                if (pvPos.y != vy && pvPos.x != vx) {
                    count++;
                }
                pvPos = vertex;
            }

            if (sameTileList.length >= 3) {
                for (let i = 0; i < sameTileList.length; i++) {
                    let v = sameTileList[i];
                    let fList = totalSameTileList.filter((item) => item.x == v.x && item.y == v.y);
                    if (fList.length == 0) {
                        totalSameTileList.push(v);
                    }
                }
            }

            let rList = this.CheckRectangle(vx, vy);
            if (rList.length > 0) {
                for (let i = 0; i < rList.length; i++) {
                    rectList.push(rList[i]);
                }
            }
        }

        //没有可消除的
        if (rectList.length == 0 && totalSameTileList.length == 0) {
            if (this.isPlace) {
                /**没有消除, combo断了*/
                GameEventMgr.Instance.EmitEvent(Consts.Event.ECancelCombo);
                GameEventMgr.Instance.EmitEvent(Consts.Event.EAddPlaceScore, indices.length);
            }
            return;
        }

        let tileColorList: TileColor[] = [];
        let startPoint: { x: number, y: number }[] = []
        // if (rectList.length > 0) {
        for (let i = 0; i < rectList.length; i++) {
            let p = rectList[i][0];
            let type = this.GetTileType(p.x, p.y);
            let color = Consts.TilePropertyList[type - 1].tileColor;
            // if (i == 0) {
            //     startPoint.push(p);
            //     tileColorList.push(color);
            // } else {
            //     if (tileColorList[tileColorList.length - 1] != color) {
            //         tileColorList.push(color);
            //         startPoint.push(p);
            //     }
            // }

            if (tileColorList.indexOf(color) == -1) {
                tileColorList.push(color);
                startPoint.push(p);
            }
            // }

            // for (let i = 0; i < tileColorList.length; i++) {
            //     let color = tileColorList[i];
            //     let p = startPoint[i];
            //     if (this.isPlace) {
            //         GameEventMgr.Instance.EmitEvent(Consts.Event.ERectangleEliminate, color, p.x, p.y);
            //     } else {
            //         GameEventMgr.Instance.EmitEvent(Consts.Event.ERectangleBlockHighlight, color);
            //     }
            // }
        }

        // if (totalSameTileList.length > 0) {
        let fList = totalSameTileList;

        if (tileColorList.length > 0) {

            fList = totalSameTileList.filter((item) => {
                let type = this.GetTileType(item.x, item.y);
                let tc = Consts.TilePropertyList[type - 1].tileColor;
                // for (let i = 0; i < tileColorList.length; i++) {
                //     let color = tileColorList[i];
                //     if (tc == color) {
                //         return false;
                //     }
                // }
                // return true;
                return tileColorList.indexOf(tc) == -1;
            });
        }

        // if (fList.length <= 0) {
        //     return;
        // }

        // if (this.isPlace) {
        //     GameEventMgr.Instance.EmitEvent(Consts.Event.EEliminateBlock, fList, count);
        // } else {
        //     GameEventMgr.Instance.EmitEvent(Consts.Event.ESameBlockHighlight, fList)
        // }


        // }

        if (!this.isPlace) {
            for (let tColor of tileColorList) {
                GameEventMgr.Instance.EmitEvent(Consts.Event.ERectangleBlockHighlight, tColor);
            }

            if (fList.length > 0) {
                GameEventMgr.Instance.EmitEvent(Consts.Event.ESameBlockHighlight, fList);
            }
        } else {
            GameEventMgr.Instance.EmitEvent(Consts.Event.EUnifyEliminate, fList, tileColorList, startPoint);
            if (tileColorList.length > 0) {
                let tile = tileColorList[0]
                GameEventMgr.Instance.EmitEvent(Consts.Event.ESquareEffect, tile);
                GameEventMgr.Instance.EmitEvent(Consts.Event.ESquare);
            }
        }
    }

    /**检查水平方向 */
    private CheckHorizontal(x: number, y: number) {
        let tileType = this.GetTileType(x, y);

        let locations: { x: number, y: number }[] = [];
        locations.push({ x: x, y: y });
        //向左查询
        for (let i = x - 1; i >= 0; i--) {
            if (tileType == 0 || tileType != this.GetTileType(i, y)) {
                break;
            }
            locations.push({ x: i, y: y });
        }

        //向右查询
        for (let i = x + 1; i < this.row; i++) {
            if (tileType == 0 || tileType != this.GetTileType(i, y)) {
                break;
            }
            locations.push({ x: i, y: y });
        }
        return locations;
    }

    /**检查竖直方向 */
    private CheckVertical(x: number, y: number) {
        let tileType = this.GetTileType(x, y);
        let locations: { x: number, y: number }[] = [];
        locations.push({ x: x, y: y });
        //向下搜索
        for (let i = y - 1; i >= 0; i--) {
            let type = this.GetTileType(x, i);
            if (type != tileType || tileType == 0) {
                break;
            }
            locations.push({ x: x, y: i });
        }

        //向上搜索
        for (let i = y + 1; i < this.row; i++) {
            let type = this.GetTileType(x, i);
            if (type != tileType || tileType == 0) {
                break;
            }
            locations.push({ x: x, y: i });
        }
        return locations;
    }

    /**检查矩形消除*/
    private CheckRectangle(x: number, y: number) {
        let tileType = this.GetTileType(x, y);
        let rect: { x: number, y: number }[][] = [];

        for (let i = 0; i < this.pointRect.length; i++) {
            let p = this.pointRect[i];
            let startX = Math.max(x + p[0].x, 0);
            let startY = Math.max(y + p[0].y, 0);

            let endX = Math.min(x + p[1].x, 8);
            let endY = Math.min(y + p[1].y, 8);
            let arr = this.Rectangle(startX, startY, endX, endY, tileType);
            // if (rect.length >= 4) {
            //     break;
            // }
            if (arr.length > 0) {
                rect.push(arr);
            }
        }

        return rect;
    }

    /**矩形*/
    private Rectangle(startX: number, startY: number, endX: number, endY: number, tileType: number) {
        let rect: { x: number, y: number }[] = [];
        for (let i = startY; i <= endY; i++) {
            for (let j = startX; j <= endX; j++) {
                if (tileType != 0 && this.GetTileType(j, i) == tileType) {
                    rect.push({ x: j, y: i });
                }
            }
        }
        if (rect.length < 4) {
            rect = [];
        }
        return rect;
    }

    /**快类型*/
    private GetTileType(x: number, y: number) {
        let id = this.tempMatrix[y * this.row + x];
        if (id <= 0) {
            return 0;
        }
        let data = Game.Instance.TileConfig.GetTileToId(id);
        return data.Type;
    }

    /**检查能否放置方块  算法可以优化*/
    private CheckGameState(blockList: { blockType: number, isPlace: boolean }[]) {

        //新手引导跳过检查
        if (Game.Instance.Cache.GameType == GameType.GuideType) {
            return;
        }

        //游戏结束不检查
        if (Game.Instance.Cache.GameOver) {
            return;
        }

        this.UpdateTempMatrix();
        let bIndexList: number[] = [];
        let noIndexList: number[] = [];
        for (let i = 0; i < blockList.length; i++) {
            let block = blockList[i];
            if (!block.isPlace) {
                for (let iy = 0; iy < 9; iy++) {
                    for (let ix = 0; ix < 9; ix++) {
                        let indices = this.GetProjectionPoint(ix, iy, block.blockType);
                        if (this.IsLocationEmpty(indices)) {
                            bIndexList.push(i);
                        }
                    }
                }
                if (bIndexList.indexOf(i) == -1) {
                    noIndexList.push(i);
                }
            }
        }

        GameEventMgr.Instance.EmitEvent(Consts.Event.EBlockCanPlace, noIndexList);

        if (bIndexList.length > 0) {
            return;
        }

        //游戏结束
        GameEventMgr.Instance.EmitEvent(Consts.Event.EGameOver);
        GameEventMgr.Instance.EmitEvent(Consts.Event.ECancelCombo);
        cc.log(blockList, "游戏结束~~~~~~~~~~~~,不能放方块了");
    }

    /**同步临时矩阵 */
    private UpdateTempMatrix() {
        for (let i = 0; i < this.currentMatrix.length; i++) {
            this.tempMatrix[i] = this.currentMatrix[i];
        }
    }

    /**开始友情提示 */
    private StartFriendlyTips() {

        if (Game.Instance.Cache.GameOver) {
            return;
        }

        let isRectangle = false;
        let tileList = Game.Instance.Cache.TileTypeList;
        let arr: { x: number, y: number }[][] = [];
        for (let i = 0; i < tileList.length; i++) {
            let data = tileList[i];
            if (!data.isPlace) {
                let re = this.GuideRectangle(data.blockType, data.tileColor, arr);
                if (re) {
                    GameEventMgr.Instance.EmitEvent(Consts.Event.EStartRectanglePrompt, i, re.reList);
                    isRectangle = true;
                    break;
                }
            }
        }
        this.UpdateTempMatrix();
        //矩形提示
        if (isRectangle) {
            return;
        }

        //优化检测 O(n^2);
        // let blockType = Game.Instance.Cache.CurrentBlockType;
        // let arr = this.GetBlockIndices(blockType);

        if (arr.length > 0) {
            let index = Utility.RandomRangeInt(0, arr.length - 1);
            let indices = arr[index];
            GameEventMgr.Instance.EmitEvent(Consts.Event.EShowFriendlyTips, indices);
        } else {
            this.scheduleOnce(this.StartFriendlyTips.bind(this), 1);
        }
    }

    private GetBlockIndices(blockType: number) {
        let arr: { x: number, y: number }[][] = [];
        for (let iy = 0; iy < 9; iy++) {
            for (let ix = 0; ix < 9; ix++) {
                let indices = this.GetProjectionPoint(ix, iy, blockType);
                if (this.IsLocationEmpty(indices)) {
                    arr.push(indices)
                }
            }
        }
        return arr;
    }

    /**引导矩形消除*/
    public GuideRectangle(blockType: number, tileColor: number[], arr: { x: number, y: number }[][]) {
        let arrList = this.GetBlockIndices(blockType);

        if (blockType == Game.Instance.Cache.CurrentBlockType) {
            for (let i = 0; i < arrList.length; i++) {
                arr.push(arrList[i]);
            }
        }

        if (arrList.length > 0) {
            for (let i = 0; i < arrList.length; i++) {
                this.UpdateTempMatrix();
                let indices = arrList[i];
                let reList = this.CheckFriendlyRectangle(indices, tileColor);
                if (reList.length > 0) {
                    return { indices: indices, reList: reList[0] }
                }
            }
        }

        return null;
    }

    /**友情提示田字格消除 */
    private CheckFriendlyRectangle(indices: { x: number, y: number }[], tileColorList: number[]) {
        for (let i = 0; i < indices.length; i++) {
            let p = indices[i]
            let index = p.y * 9 + p.x;
            let data = Game.Instance.TileConfig.GetNormalTileList()[tileColorList[i]];
            this.tempMatrix[index] = data.Id;
        }

        for (let i = 0; i < indices.length; i++) {
            let p = indices[i];
            let reList = this.CheckRectangle(p.x, p.y);
            if (reList.length > 0) {
                return reList;
            }
        }

        return [];
    }

}
