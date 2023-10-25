import Consts from "../Consts/Consts";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import Block from "../Game/Block/Block";

const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass
export class BlockWarehouse extends cc.Component {
    @property(cc.Prefab)
    blockPb: cc.Prefab = null;
    private myRect: cc.Rect = null;

    @property(cc.Node)
    private root: cc.Node = null;

    private currBlock: Block = null;


    protected start(): void {
        this.InitEvent();
        let pos = this.node.position;
        let wp = this.node.parent.convertToWorldSpaceAR(pos);

        this.myRect = new cc.Rect(wp.x - this.node.width / 2, wp.y - this.node.height / 2, this.node.width, this.node.height);
    }

    private InitEvent() {
        GameEventMgr.Instance.AddEvent(Consts.Event.ECheckBlockLocation, this.CheckBlockLocationWarehouse.bind(this), this);
    }

    /**检查方块是否在仓库*/
    private CheckBlockLocationWarehouse(re: cc.Rect, blockType: number, index: number) {
        let rect = cc.rect(re.x + re.width / 2, re.y + re.height / 2, re.width / 4, re.height / 4);
        if (Game.Instance.Data.BlockWarehouse.length == 0) {
            if (this.myRect.containsRect(rect)) {
                let isSave: boolean = false;
                for (let i = 0; Game.Instance.Cache.TileTypeList.length; i++) {
                    let data = Game.Instance.Cache.TileTypeList[i];
                    if (data.blockType == blockType && !data.isPlace && index == i) {
                        let value = { blockType: data.blockType, tileColor: data.tileColor };
                        Game.Instance.Data.BlockWarehouse = [value];
                        isSave = true;
                        break;
                    }
                }
                if (isSave) {
                    this.CreateBlock();
                    GameEventMgr.Instance.EmitEvent(Consts.Event.EPutIntoWarehouse, blockType, index);
                    cc.log("可以放仓库里");
                    return;
                }
            }
        }
        GameEventMgr.Instance.EmitEvent(Consts.Event.ECheckBlockLocation, re, blockType, index);
    }

    /**创建方块*/
    private CreateBlock() {

        let tileTypeList = Game.Instance.Data.BlockWarehouse;
        let p = cc.instantiate(this.blockPb);
        let block = p.getComponent(Block);
        this.root.addChild(p);
        block.Init(tileTypeList[0].blockType, 0, tileTypeList[0].tileColor, { width: this.node.width * 1.8, height: this.node.height });
        this.currBlock = block;
        block.EnabledGray = false;
        p.position = cc.v3(this.node.position.x, this.node.position.y);
        p.scale = 0.6;

    }

}