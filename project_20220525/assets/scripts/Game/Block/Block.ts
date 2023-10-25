
import Consts from "../../Consts/Consts";
import { GameEventMgr } from "../../Framework/GameEvent";
import ResMgr from "../../Framework/ResMgr";
import Game from "../../Game";
import Tile from "./Tile";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Block extends cc.Component {
    protected blockType: number;;
    protected martix: number[] = []
    private tileList: Tile[] = [];
    private maxX: number = 0;
    private maxY: number = 0;

    private h: number = 20;
    private v: number = 20;
    private tileIndexList: number[] = [];

    /**间隔 */
    private spacing: cc.Vec2 = cc.v2(1, 1);
    /**开始坐标 */
    private originPos: cc.Vec2 = cc.Vec2.ZERO;
    /**初始缩放 */
    private originScale: number = 0;
    /**向上的偏移 */
    private readonly upOffset: number = 250;
    /**老的坐标 */
    private oldPos: cc.Vec3 = cc.Vec3.ZERO;
    /**原始大小 */
    private originSize: cc.Vec2 = cc.Vec2.ZERO;
    /**方块的序号 */
    private index: number = 0;

    private enabledGray: boolean = false;

    /**区域大小 用点击的 */
    private areasize: { width: number, height: number } = null;
    private iskWarehouse: boolean = false;


    public Init(blockType: number, id: number, colorIndex: number[], size: { width: number, height: number }, isAction: boolean) {
        for (let item of this.tileList) {
            item.node.destroy();
        }
        this.tileList = [];
        this.index = id;
        this.maxX = 0;
        this.maxY = 0;
        this.blockType = blockType;
        this.martix = Game.Instance.BlockConfig.GetAllBlock()[blockType];
        this.tileIndexList = colorIndex;
        this.AssembleBlock();
        this.UpdateBlock(isAction);
        this.areasize = size;

        this.node.width = this.areasize.width;
        this.node.height = this.areasize.height;
        this.iskWarehouse = false;
    };

    protected start(): void {
        this.oldPos = cc.v3(this.node.position);
        this.originScale = this.node.scale;
        this.InitEvent();
    }

    /**组装方块 */
    protected AssembleBlock() {
        let data = ResMgr.Instance.GetRes<cc.Prefab>(Consts.ResName.Tile);
        let normalTileList = Game.Instance.TileConfig.GetNormalTileList();
        this.tileList = [];

        for (let i = 0; i < this.martix.length; i++) {
            if (this.martix[i] == 1) {
                let index = this.tileIndexList[this.tileList.length];
                let tileData = normalTileList[index]
                // cc.log(index,tileData)
                let x = i % 4;
                let y = Math.floor(i / 4);
                let n = cc.instantiate(data.res);
                let tile = n.getComponent(Tile);
                n.active = true;
                this.node.addChild(n);
                tile.node.position = cc.v3(0);
                tile.SetData(Consts.TilePropertyList[tileData.Type - 1]);
                tile.Location = cc.v2(x, y);
                this.tileList.push(tile);
                this.maxX = x > this.maxX ? x : this.maxX;
                this.maxY = y > this.maxY ? y : this.maxY;

            }
        }
    }

    private InitEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.OnTouchStart.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.OnTouchMove.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_END, this.OnTouchEnd.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchEnd.bind(this));

        GameEventMgr.Instance.AddEvent(Consts.Event.ENotUnionChessboard, this.ComeBack.bind(this), this);
        // GameEventMgr.Instance.AddEvent(Consts.Event.EUnionChessboard, this.PlaceBlock.bind(this), this);
    }

    /**更新 */
    private UpdateBlock(isAction: boolean) {
        this.SetBlockSize();
        this.UpdateTileLocation(isAction);
    }

    /**分离Title */
    private DisperseTile() {
        this.node.scale = 1.0;
        this.spacing = cc.v2(1, 1);
        this.SetBlockSize();
        this.UpdateTileLocation();
        for (let t of this.tileList) {
            t.node.scale = 0.85;
        }
    }

    /**设置方块大小 */
    private SetBlockSize() {
        let tw = this.tileList[0].node.width;
        let th = this.tileList[0].node.height;

        let mx = this.maxX + 1;
        let my = this.maxY + 1;

        let sx = this.maxX;
        let sy = this.maxY;

        this.node.width = (tw + this.h) * mx;
        this.node.height = (th + this.v) * my;

        let ox = (this.node.width - (tw * mx + this.spacing.x * sx)) / 2;
        let oy = (this.node.height - (th * my + this.spacing.y * sy)) / 2;
        this.originPos = new cc.Vec2(ox, oy);

        this.originSize.x = this.node.width;
        this.originSize.y = this.node.height;
        for (let t of this.tileList) {
            t.node.scale = 1;
        }
    }

    private UpdateTileLocation(isAction: boolean = true) {
        for (let i = 0; i < this.tileList.length; i++) {
            let tile = this.tileList[i];
            let x = this.originPos.x + (tile.Location.x + 0.5) * tile.node.width - this.node.width / 2 + tile.Location.x * this.spacing.x;
            let y = this.originPos.y + (tile.Location.y + 0.5) * tile.node.height - this.node.height / 2 + tile.Location.y * this.spacing.y;
            if (isAction) {
                cc.tween(tile.node).to(0.3, { position: cc.v3(x, y) }, { easing: "backOut" }).start();
            }
            tile.node.position = cc.v3(x, y);
        }
    }

    /**touchEnd*/
    private OnTouchEnd(e: cc.Event.EventTouch) {
        let l = e.getLocation();
        let rect = this.GetBlockRect(l);
        GameEventMgr.Instance.EmitEvent(Consts.Event.ETouchEndBlock, rect, this.Type, this.index, this.tileIndexList, this.iskWarehouse);
    }

    private OnTouchStart(e: cc.Event.EventTouch) {
        let l = e.getLocation();
        let pos = this.node.parent.convertToNodeSpaceAR(l);
        pos.y += this.upOffset;
        this.node.position = cc.v3(pos);
        this.node.setSiblingIndex(0xff);

        this.DisperseTile();

        Game.Instance.Cache.CurrentBlockType = this.blockType;
        GameEventMgr.Instance.EmitEvent(Consts.Event.EToucnBlock);
    }

    /**Touch Move */
    private OnTouchMove(e: cc.Event.EventTouch) {
        let l = e.getLocation();
        let pos = this.node.parent.convertToNodeSpaceAR(l);
        pos.y += this.upOffset;
        this.node.position = cc.v3(pos);

        let rect = this.GetBlockRect(l);
        GameEventMgr.Instance.EmitEvent(Consts.Event.ETouchMoveBlock, rect, this.Type, this.tileIndexList);
    }

    /**获取方块组成的矩形*/
    private GetBlockRect(location: cc.Vec2) {
        let width = this.node.width;
        let height = this.node.height;
        return cc.rect(location.x - width / 2, location.y - height / 2 + this.upOffset, width, height);
    }

    /**回原来的位置 */
    private ComeBack() {
        this.spacing = cc.v2(1, 1);
        this.SetBlockSize();
        this.UpdateTileLocation();
        this.node.position = cc.v3(this.oldPos);
        this.node.scale = this.originScale;
        this.node.width = this.areasize.width;
        this.node.height = this.areasize.height;
        this.node.setSiblingIndex(3);
    }


    /**方块类型 */
    public get Type() {
        return this.blockType;
    }

    public set Type(value: number) {
        this.blockType = value;
    }

    /**获取矩阵 */
    public GetMartix() {
        return this.martix;
    }

    /**id */
    public get Index() {
        return this.index;
    }

    public set Index(value: number) {
        this.index = value;
    }

    protected onDestroy(): void {
        this.node.off(cc.Node.EventType.TOUCH_END)
        this.node.off(cc.Node.EventType.TOUCH_MOVE);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL);
        this.node.off(cc.Node.EventType.TOUCH_START);
        GameEventMgr.Instance.RemoveEvent(Consts.Event.ENotUnionChessboard, this);
    }

    public set EnabledGray(value: boolean) {
        this.enabledGray = value;
        for (let t of this.tileList) {
            t.Gray = value;
        }
    }

    // public set IskWarehouse(value: boolean) {
    //     this.iskWarehouse = value;
    // }

    // public get IskWarehouse() {
    //     return this.iskWarehouse;
    // }

    public set OldPos(pos: cc.Vec3) {
        this.oldPos = cc.v3(pos);
    }


}
