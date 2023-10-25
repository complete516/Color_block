import Block from "./Block/Block";
import Consts from "../Consts/Consts";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import Utility from "../Utility";
import { GameType } from "../Consts/Define";
import ResMgr from "../Framework/ResMgr";
import RectanglePromptTips from "../UI/Tips/RectanglePromptTips";

const { ccclass, property } = cc._decorator;
@ccclass
export default class SelectArea extends cc.Component {

    @property(cc.Prefab)
    blockPb: cc.Prefab = null;

    /**能选方块的数量*/
    private selectTileCount: number = 0;
    /**全部快类型*/
    private allBlockTypeList: { blockType: number, isWarehouse: boolean, isPlace: boolean, tileColor: number[] }[] = [];

    private blockList: Block[] = [];

    private rectanglePromptTips: RectanglePromptTips = null;

    /**第一次进来 */
    private isFirst: boolean = true;
    /**选择区域范围 */
    private myRect: cc.Rect = null;
    /**仓库节点 */
    @property(cc.Node)
    private warehouseNode: cc.Node = null;
    @property(cc.Node)
    private nodeRoot: cc.Node = null;

    private rectList: cc.Rect[] = [];

    /**仓库方位 */
    private warehouseRect: cc.Rect = null;

    private warehouseBlockList: Block[] = [];

    protected onEnable(): void {
        if (!this.isFirst) {
            this.Init();
        }
        this.isFirst = false;
    }

    protected onLoad(): void {
        let res = ResMgr.Instance.GetRes<cc.Prefab>(Consts.ResName.RectanglePromptTips);
        let node = cc.instantiate(res.res);
        this.node.addChild(node, cc.macro.MAX_ZINDEX - 1);
        this.rectanglePromptTips = node.getComponent(RectanglePromptTips);
        this.rectanglePromptTips.Select();
        node.active = false;
    }

    start() {
        this.InitEvent();
        this.Init();
        let wp = this.node.parent.convertToWorldSpaceAR(this.node.position);
        this.myRect = cc.rect(wp.x - this.node.width / 2, wp.y, this.node.width - 150, this.node.height);

        wp = this.warehouseNode.parent.convertToWorldSpaceAR(this.warehouseNode.position);
        this.warehouseRect = new cc.Rect(wp.x - this.warehouseNode.width / 2, wp.y - this.warehouseNode.height / 2, this.warehouseNode.width, this.warehouseNode.height)

        wp = this.node.parent.convertToWorldSpaceAR(this.node.position);
        for (let i = 0; i < 3; i++) {
            let w = this.node.width / 3;
            let r = cc.rect(wp.x - this.node.width / 2 + i * w + i * 20, wp.y - this.node.height / 2, 200, this.node.height);
            this.rectList.push(r);
        }

        // cc.log(this.myRect)
    }

    private InitEvent() {
        GameEventMgr.Instance.AddEvent(Consts.Event.EPlaceBlock, this.PlaceBlock.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EBlockCanPlace, this.BlockCanPlace.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EStartChessGuidStep, this.StartChessGuidStep.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EStartRectanglePrompt, this.StartRectanglePrompt.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.EEndRectanglePrompt, this.EndRectanglePrompt.bind(this), this);
        // GameEventMgr.Instance.AddEvent(Consts.Event.EPutIntoWarehouse, this.PutIntoWarehouse.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ECheckBlockLocation, this.CheckBlockLocation.bind(this), this);

    }

    private Init() {
        this.selectTileCount = 3;
        if (Game.Instance.Cache.GameType == GameType.GuideType) {
            this.selectTileCount = 1;
        }
        this.allBlockTypeList = Game.Instance.GetSelectBlockList();
        if (this.allBlockTypeList.length == 0) {
            this.RandomBlock();
        }


        this.CreateSelectBlock();
        this.scheduleOnce(() => {
            GameEventMgr.Instance.EmitEvent(Consts.Event.ECheckGameState, this.allBlockTypeList);
        }, 1);
        Game.Instance.Cache.TileTypeList = this.allBlockTypeList;
        // this.SetDefaultBlockType();
    }

    /**开始新手引导步骤 */
    private StartChessGuidStep() {
        this.allBlockTypeList = Game.Instance.GetSelectBlockList();
        this.CreateSelectBlock();
    }


    //放置了一个方块
    private PlaceBlock(blockType: number, index: number) {

        this.allBlockTypeList[index].isPlace = true;
        this.blockList[index].node.active = false;
        //新手模式直接跳出
        if (Game.Instance.Cache.GameType == GameType.GuideType) {
            GameEventMgr.Instance.EmitEvent(Consts.Event.EFinishChessGuidStep);
            return;
        }

        this.CheckSurplusBlock();
    }

    /**放入仓库 */
    private PutIntoWarehouse(blockType: number, index: number) {
        if (Game.Instance.Cache.GameType == GameType.GuideType) {
            GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionChessboard);
            return;
        }

        if (this.allBlockTypeList[index].isWarehouse) {
            return;
        }

        let wIndex = -1;
        for (let i = 0; i < this.allBlockTypeList.length; i++) {
            if (this.allBlockTypeList[i].isWarehouse) {
                wIndex = i;
                break;
            }
        }

        if (wIndex != -1) {
            let w = this.node.width / 3;
            let x = index * w - this.node.width / 2 + w / 2;
            // this.allBlockTypeList[wIndex].isWarehouse = false;
            // this.blockList[wIndex].OldPos = cc.v3(x, 0);

            let old = this.allBlockTypeList[wIndex];
            let oldB = this.blockList[wIndex];

            this.allBlockTypeList[wIndex] = this.allBlockTypeList[index];
            this.allBlockTypeList[index] = old;
            this.allBlockTypeList[wIndex].isWarehouse = true;
            this.allBlockTypeList[index].isWarehouse = false;


            this.blockList[wIndex] = this.blockList[index];
            this.blockList[wIndex].Index = wIndex;
            this.blockList[wIndex].OldPos = cc.v3(this.warehouseNode.position);

            this.blockList[index] = oldB;
            this.blockList[index].Index = index;
            this.blockList[index].OldPos = cc.v3(x, 0);


        } else {
            this.allBlockTypeList[index].isWarehouse = true;
            this.blockList[index].OldPos = cc.v3(this.warehouseNode.position);
            GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionChessboard);
        }


        //方块全部拿完了
        this.CheckSurplusBlock();
    }

    /**检测剩下方块 */
    private CheckSurplusBlock() {
        //没有放置，且不在仓库里面 的数量
        let sList = this.allBlockTypeList.filter((item) => !item.isPlace && !item.isWarehouse);

        if (sList.length == 0) {
            this.RandomBlock();
            this.CreateSelectBlock();
        }

        GameEventMgr.Instance.EmitEvent(Consts.Event.ECheckGameState, this.allBlockTypeList);
        Game.Instance.Cache.TileTypeList = this.allBlockTypeList;
        Game.Instance.UpdateSelect(this.allBlockTypeList);
    }

    /** 方块取消放置*/
    private BlockCanPlace(bList: number[]) {
        let blockType = -1;
        for (let i = 0; i < this.blockList.length; i++) {
            let t = this.blockList[i];
            t.EnabledGray = false;
            if (!bList.includes(i) && blockType == -1 && t.node.active) {
                blockType = t.Type;
                Game.Instance.Cache.CurrentBlockType = blockType;
            }
        }


        for (let i = 0; i < bList.length; i++) {
            let block = this.blockList[bList[i]];
            block.EnabledGray = true;
        }
    }

    /**创建选择方块 */
    private CreateSelectBlock() {
        this.blockList.forEach((item) => item.node.destroy());
        this.blockList = [];

        if (Game.Instance.Cache.GameType == GameType.GuideType) {
            this.CreateBlock(0);
            let w = this.node.width / 3;
            let x = 1 * w - this.node.width / 2 + w / 2;
            this.blockList[0].node.position = cc.v3(x, 0);
            return;
        }

        for (let i = 0; i < this.allBlockTypeList.length; i++) {
            this.CreateBlock(i);
        }
    }

    /**创建方块 */
    private CreateBlock(i: number) {
        let p = cc.instantiate(this.blockPb);
        let tileType = this.allBlockTypeList[i];
        let block = p.getComponent(Block);
        this.nodeRoot.addChild(p);
        block.EnabledGray = false;

        if (!tileType.isWarehouse) {
            this.SetBlockPos(i, p);
            block.Init(tileType.blockType, i, tileType.tileColor, { width: this.node.width / 3 * 1.8, height: this.node.height },true);
        } else {
            block.Init(tileType.blockType, i, tileType.tileColor, { width: this.warehouseNode.width * 1.8, height: this.warehouseNode.height },false);
            p.position = cc.v3(this.warehouseNode.position);
            p.scale = 0.45;
        }
        p.active = !tileType.isPlace;
        this.blockList.push(block);

        cc.log(tileType.blockType);

    }

    /**设置方块的坐标*/
    private SetBlockPos(index: number, p: cc.Node) {
        let w = this.node.width / 3;
        let x = index * w - this.node.width / 2 + w / 2;
        p.position = cc.v3(x, 0);
        p.scale = 0.45;
    }

    /**随机方块*/
    private RandomBlock() {
        let fList = this.allBlockTypeList.filter((item) => item.isWarehouse && !item.isPlace);
        this.allBlockTypeList = [];

        for (let i = 0; i < this.selectTileCount; i++) {
            let blockType = Game.Instance.GetBlockType();
            this.allBlockTypeList.push({ blockType: blockType, isWarehouse: false, isPlace: false, tileColor: this.RandomTileColor() });
        }

        //前五局给的低保
        if (Game.Instance.Data.IsCanHelp()) {
            let helpData = Game.Instance.Data.GetHelpData();
            let tileColorList = Game.Instance.GetTileColorRandom();
            let blockType = 0
            if (helpData.round == 0) {
                blockType = 5;
            }
            this.allBlockTypeList[0] = { blockType: blockType, isPlace: false, isWarehouse: false, tileColor: tileColorList }
            Game.Instance.Data.AddRound();
        }

        if (fList.length > 0) {
            this.allBlockTypeList = this.allBlockTypeList.concat(fList[0])
        }

        Game.Instance.UpdateSelect(this.allBlockTypeList);
    }

    /**随机块的颜色*/
    private RandomTileColor() {
        let tileIndexList = [];
        let length = Game.Instance.TileConfig.GetNormalTileListLength();
        while (tileIndexList.length < 5) {
            let index = Utility.RandomRangeInt(0, length - 1);
            if (tileIndexList.filter((item => item == index)).length < 2) {
                tileIndexList.push(index);
            }
        }

        return tileIndexList;
    }

    /**设置默认放置方块类型 */
    private SetDefaultBlockType() {
        for (let i = 0; i < this.allBlockTypeList.length; i++) {
            if (!this.allBlockTypeList[i].isPlace) {
                Game.Instance.Cache.CurrentBlockType = this.allBlockTypeList[i].blockType;
                break;
            }
        }
    }

    /**开始 田字格提示 */
    private StartRectanglePrompt(index: number) {
        let data = this.allBlockTypeList[index];
        if (data.isWarehouse) {
            this.rectanglePromptTips.ShowPrompt(cc.v3(this.warehouseNode.position));
        } else {
            let w = this.node.width / 3;
            let p = cc.v3((index - 1) * w, 0);
            this.rectanglePromptTips.ShowPrompt(p);
        }
    }

    /**结束田字格提示 */
    private EndRectanglePrompt() {
        this.rectanglePromptTips.Hide();
    }

    /**检查方块位置 */
    private CheckBlockLocation(re: cc.Rect, blockType: number, index: number) {
        let rect = cc.rect(re.x + re.width / 2, re.y + re.height / 4, re.width / 4, re.height / 4);
        if (this.warehouseRect.intersects(rect)) {
            this.PutIntoWarehouse(blockType, index);
            //     GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionChessboard);
            cc.log("放入仓库", index);
            //     return;
        }

        if (this.myRect.intersects(re)) {
            this.TakeOutWarehouse(rect, index);
        }
        GameEventMgr.Instance.EmitEvent(Consts.Event.ENotUnionChessboard);
    }

    /**从仓库中取出 */
    private TakeOutWarehouse(re: cc.Rect, ix: number) {
        if (this.allBlockTypeList[ix].isWarehouse) {
            let wIndex = ix;
            let index = -1;
            for (let i = 0; i < this.rectList.length; i++) {
                if (this.rectList[i].intersects(re)) {
                    index = i;
                    break;
                }
            }


            index = index == -1 ? 0 : index;

            let w = this.node.width / 3;
            let x = index * w - this.node.width / 2 + w / 2;


            let old = this.allBlockTypeList[wIndex];
            let oldB = this.blockList[wIndex];

            this.allBlockTypeList[wIndex] = this.allBlockTypeList[index];
            this.allBlockTypeList[index] = old;
            this.allBlockTypeList[wIndex].isWarehouse = true;
            this.allBlockTypeList[index].isWarehouse = false;


            this.blockList[wIndex] = this.blockList[index];
            this.blockList[wIndex].Index = wIndex;
            this.blockList[wIndex].OldPos = cc.v3(this.warehouseNode.position);

            this.blockList[index] = oldB;
            this.blockList[index].Index = index;
            this.blockList[index].OldPos = cc.v3(x, 0);
            Game.Instance.UpdateSelect(this.allBlockTypeList);
        }
    }
}
