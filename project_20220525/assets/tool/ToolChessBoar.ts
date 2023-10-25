import { GameEventMgr } from "../scripts/Framework/GameEvent";
import AddTileView from "./AddTileView";
import ToolControl from "./ToolControl";
// import ToolTileProperty from "./ToolTileProperty";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToolChessBoar extends cc.Component {

    //#region 属性

    @property(cc.String)
    public jsonFilePath = "";

    @property(cc.Node)
    private controller: cc.Node = null;
    @property(cc.Button)
    private btns: cc.Button[] = [];

    @property(cc.Button)
    prevOperatorBtn: cc.Button = null;


    /**网格数 */
    @property(cc.Label)
    private garidText: cc.Label = null;

    @property(cc.Button)
    private PrevBtn: cc.Button = null;

    @property(cc.Button)
    private NextBtn: cc.Button = null;

    @property(cc.Label)
    private MapText: cc.Label = null;

    // @property(cc.String)
    // private jsonFileName = ""



    @property(cc.Label)
    private editNameText: cc.Label = null;

    /**保存数据 */
    @property(cc.Button)
    private createBtn: cc.Button = null;

    @property(cc.Prefab)
    private AddView: cc.Prefab = null;

    @property(cc.EditBox)
    private goEditBox: cc.EditBox = null;

    @property(cc.ScrollView)
    tileListView: cc.ScrollView = null;

    //#endregion

    graphics: cc.Graphics = null;
    private xCount: number = 4;
    private yCount: number = 4;

    private tileSize: number = 100;
    private currentTileIndex: number = 0;

    /**当前地图编号 */
    private currentMapIndex: number = 0;
    /**地图 */
    private mapList: Map<string, number[][]> = new Map<string, number[][]>();

    /**编辑模式 0 地图 1块形状，2特殊编辑 */
    private editModel: number = 0;

    private currOperation: { x: number, y: number, selectTile: number }[] = [];

    private isClearSign: boolean = false;
    private clearSiginBtn: cc.Button = null;

    private addView: AddTileView = null;

    public TiltConf: { Id: number, Type: number, Color: cc.Color, Count: number, Name: string }[] = [];

    private countTextList: cc.Node[] = [];

    private stateKeyList: string[] = ["Map", "Block", "Terrain", "ColorBlock"]

    private colorBlock: { arr: number[], type: number }[] = [];

    /**块的序号 */
    private blockIndex: number = 0;

    protected onLoad(): void {

        for (let i = 0; i < this.stateKeyList.length; i++) {
            this.mapList.set(this.stateKeyList[i], []);
        }

        this.graphics = this.node.getComponent(cc.Graphics);
        this.goEditBox.node.on("editing-did-ended", this.GoEditDidEnded.bind(this));
        this.UpdateEditMode();



        cc.resources.load("Config/MapConfig", cc.JsonAsset, (err, res: cc.JsonAsset) => {
            if (err) {
                return;
            }
            let json = res.json;
            let matrix = json["matrix"]
            let keys = Object.keys(matrix);
            for (let i = 0; i < keys.length; i++) {
                this.GetMapList()[i] = matrix[keys[i]];
            }
            if (this.TiltConf.length > 0) {
                this.FillRect(this.currentMapIndex);
            }
            this.RefreshMapIndex();
        });


        cc.resources.load("Config/TileConfig", cc.JsonAsset, (err, res: cc.JsonAsset) => {
            if (err) {
                // cc.log(err.message);
                return;
            }
            let json = res.json;
            let keys = Object.keys(json);
            for (let i = 0; i < keys.length; i++) {
                let data = json[keys[i]];
                let c = cc.color()
                let tileData = {
                    Id: data.Id,
                    Type: data.Type,
                    Color: cc.Color.fromHEX(c, data.Color),
                    Count: data.Count,
                    Name: data.Name || "",
                }
                this.TiltConf.push(tileData);
            }
            GameEventMgr.Instance.EmitEvent("ShowDefault");
            if (this.TiltConf.length > 0) {
                this.FillRect(this.currentMapIndex);
            }
        });


        cc.resources.load("Config/BlockConfig", cc.JsonAsset, (err, res: cc.JsonAsset) => {
            if (err) {
                // cc.log(err)
                return;
            }
            let json = res.json;
            let matrix = json["matrix"]
            let keys = Object.keys(matrix);
            for (let i = 0; i < keys.length; i++) {
                this.mapList.get("Block")[i] = matrix[keys[i]];
            }
        });


        cc.resources.load("Config/TerrainConfig", cc.JsonAsset, (err, res: cc.JsonAsset) => {
            if (err) {
                // cc.log(err)
                return;
            }
            let json = res.json;
            let matrix = json["matrix"]
            let keys = Object.keys(matrix);
            for (let i = 0; i < keys.length; i++) {
                this.mapList.get("Terrain")[i] = matrix[keys[i]];
            }
        });


        cc.resources.load("Config/ColorBlock", cc.JsonAsset, (err, res: cc.JsonAsset) => {
            if (err) {
                // cc.log(err)
                return;
            }
            let json = res.json;
            let matrix = json["matrix"]
            let keys = Object.keys(matrix);
            for (let i = 0; i < keys.length; i++) {
                this.mapList.get("ColorBlock")[i] = matrix[keys[i]];
            }

        })


        this.clearSiginBtn = this.node.parent.getChildByName("ClearBtn").getComponent(cc.Button);
        this.clearSiginBtn.node.on("click", this.OnClearSiginTile.bind(this));

        let clearAllBtn = this.node.parent.getChildByName("ClearAllBtn").getComponent(cc.Button);
        clearAllBtn.node.on("click", this.OnClickClearAllTile.bind(this));

        let addTileBtn = this.node.parent.getChildByName("ToolMenu").getChildByName("AddTile").getComponent(cc.Button);
        addTileBtn.node.on("click", () => {
            if (this.addView == null) {
                let pb = cc.instantiate(this.AddView);
                this.addView = pb.getComponent(AddTileView);
                this.addView.toolRoot = this;
                this.node.parent.addChild(pb);
                pb.position = cc.v3();
            }
            this.addView.node.active = true;
            this.tileListView.node.active = false;
        });
    }

    start() {
        this.controller.getComponent(ToolControl).TouchCallback = this.OnTouchTile.bind(this);
        GameEventMgr.Instance.AddEvent("ToolSelectIndex", this.OnSelectTile.bind(this), this);
        this.DrawChessBoar();

        this.PrevBtn.node.on("click", () => {
            this.currentMapIndex--;
            if (this.currentMapIndex <= 0) {
                this.currentMapIndex = 0;
            }
            // this.currOperation = [];
            // this.RefreshMapIndex();
            // this.SwitchMap(this.currentMapIndex);
            this.GoNewMap();
        });

        this.NextBtn.node.on("click", () => {
            this.currentMapIndex++;
            // this.currOperation = [];
            this.ClearTileMartix(this.currentMapIndex);
            // this.RefreshMapIndex();
            // this.SwitchMap(this.currentMapIndex);
            this.GoNewMap()
        });


        this.RefreshMapIndex();
        this.createBtn.node.on("click", this.CreateJson.bind(this));


        cc.log(this.btns);
        for (let i = 0; i < this.btns.length; i++) {
            let btn = this.btns[i];
            btn.node.on("click", () => {
                this.OnClickEditBtn(i);
            });
        }
        this.prevOperatorBtn.node.on("click", this.OnClickOperatorBtn.bind(this));
    }

    /**画棋盘*/
    private DrawChessBoar() {

        this.node.width = this.xCount * this.tileSize;
        this.node.height = this.yCount * this.tileSize;

        let width = this.node.width;
        let height = this.node.height;


        this.DrawLine();

        this.controller.width = width;
        this.controller.height = height;
        let control = this.controller.getComponent(ToolControl);
        control.xCount = this.xCount;
        control.yCoun = this.yCount;
    }

    private DrawLine() {
        this.graphics.clear();
        this.graphics.strokeColor = cc.Color.RED;
        let lineWidth = 10;
        this.graphics.lineWidth = lineWidth;
        let width = this.node.width;
        let height = this.node.height;

        for (let i = 0; i < this.xCount + 1; i++) {
            this.graphics.moveTo(-width / 2, i * this.tileSize - height / 2);
            this.graphics.lineTo(this.xCount * this.tileSize - width / 2, i * this.tileSize - height / 2);
        }

        for (let i = 0; i < this.yCount + 1; i++) {
            this.graphics.moveTo(i * this.tileSize - width / 2, - height / 2);
            this.graphics.lineTo(i * this.tileSize - width / 2, this.yCount * this.tileSize - height / 2);
        }


        this.graphics.stroke();

    }

    /**点击单元格 */
    private OnTouchTile(x: number, y: number) {
        //单格清理开启
        if (this.isClearSign) {
            this.ClearSiginTile(x, y);
            return;
        }
        if (this.TiltConf.length < 1) {
            return;
        }

        // let data = ToolTileProperty.TileList[this.currentTileIndex];
        let data = this.TiltConf[this.currentTileIndex];
        this.Fill(x, y, data.Color, data.Type, data.Count, data.Id);
        this.currOperation.push({ x: x, y: y, selectTile: this.currentTileIndex });
    }

    private FillRect(index: number) {
        this.DrawLine();
        let tileList = this.TiltConf
        let arr = this.GetMapList()[index];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] != 0) {
                let tileData: { Id: number, Type: number, Color: cc.Color, Count: number, Name: string } = null;
                for (let data of tileList) {
                    if (data.Id == arr[i]) {
                        tileData = data;
                        break;
                    }
                }
                let x = i % this.xCount;
                let y = Math.floor(i / this.yCount);
                this.Fill(x, y, tileData.Color, tileData.Type, tileData.Count, tileData.Id);
            }
        }
    }

    private Fill(x: number, y: number, color: cc.Color, type: number, count: number, Id: number) {
        this.graphics.fillColor = color;
        this.graphics.fillRect(x * 100 - this.node.width / 2 + 5, y * 100 - this.node.height / 2 + 5, 100 - 10, 100 - 10);

        let arr = this.GetMapList()[this.currentMapIndex];
        arr[y * this.xCount + x] = Id;

        if (count > 0) {
            let node = new cc.Node();
            let tx = node.addComponent(cc.Label);
            this.node.addChild(node);
            tx.string = count.toString();
            tx.node.color = cc.Color.BLACK;
            tx.enableBold = true;
            tx.fontSize = 30;
            node.position = cc.v3((x + 0.5) * 100 - this.node.width / 2, (y + 0.5) * 100 - this.node.height / 2);
            this.countTextList.push(node);
        }


    }

    private SwitchMap(index: number) {
        for (let item of this.countTextList) {
            item.destroy();
        }
        this.FillRect(index);
    }

    private OnSelectTile(index: number) {
        this.currentTileIndex = index;
    }

    private ClearTileMartix(index: number) {

        this.GetMapList()[index] = this.GetMapList()[index];
        if (!this.GetMapList()[index]) {
            this.GetMapList()[index] = [];
            for (let i = 0; i < this.xCount; i++) {
                for (let j = 0; j < this.yCount; j++) {
                    this.GetMapList()[index].push(0);
                }
            }
        }

    }

    private RefreshMapIndex() {
        let arr = this.GetMapList();
        this.MapText.string = `${this.currentMapIndex + 1}/${arr.length}`;
    }

    /**保存数据*/
    private CreateJson() {
        if (cc.sys.isNative) {
            let content: string = `{\n\t"matrix":{\n\t`;
            let mapList = this.GetMapList();

            if (this.editModel != 3) {
                for (let i = 0; i < mapList.length; i++) {
                    content += `"${i + 1}":[\n\t\t`;
                    let arr = mapList[i];
                    for (let ix = 0; ix < arr.length; ix++) {
                        if (ix > 0 && ix % this.xCount == 0) {
                            content += "\n\t\t";
                        }
                        content += arr[ix].toString() + (ix < arr.length - 1 ? "," : "");
                    }

                    content += "\n\t]" + (i < mapList.length - 1 ? ",\n\t" : "");
                }
                content += "\n\t}\n";
            } else {

                let blockList = this.mapList.get("Block");

                let typeList: { [key: string]: number } = {};

                for (let i = 0; i < mapList.length; i++) {
                    content += `"${i + 1}":[\n\t\t`;
                    let arr = mapList[i];
                    for (let ix = 0; ix < arr.length; ix++) {
                        if (ix > 0 && ix % this.xCount == 0) {
                            content += "\n\t\t";
                        }
                        content += arr[ix].toString() + (ix < arr.length - 1 ? "," : "");
                    }

                    let testList: number[] = [];
                    for (let ix = 0; ix < arr.length; ix++) {
                        if (arr[ix] != 0) {
                            testList.push(1);
                        } else {
                            testList.push(0);
                        }
                    }

                    for (let j = 0; j < blockList.length; j++) {
                        let index = (i + 1).toString();
                        if (blockList[j].toString() == testList.toString()) {
                            typeList[index] = j + 1;
                            break;
                        }
                    }

                    content += "\n\t]" + (i < mapList.length - 1 ? ",\n\t" : "");
                }
                content += "\n\t},\n";
                content += `\t"blockType":` + JSON.stringify(typeList);
            }


            content += "\n}"

            let path = this.jsonFilePath + "\\" + this.GetJsonFileName() + ".json"
            jsb.fileUtils.writeStringToFile(content, path);
        }
    }

    /**点击编辑模式按钮 */
    private OnClickEditBtn(model: number) {
        /**颜色编辑的时候才显示 */
        // this.nextBlockBtn.node.active = model == 3;
        // this.blockTileGraphics.node.active = model == 3;
        this.graphics.clear();
        this.editModel = model;
        this.UpdateEditMode();
        cc.log(model);
    }

    public UpdateEditMode() {
        if (this.editModel == 0) {
            this.xCount = 9;
            this.yCount = 9;
        } else if (this.editModel == 1) {
            this.xCount = 4;
            this.yCount = 4;
        } else if (this.editModel == 2) {
            this.xCount = 9;
            this.yCount = 9;
        } else if (this.editModel == 3) {
            this.xCount = 4;
            this.yCount = 4;
        }

        this.currentMapIndex = 0;
        for (let i = 0; i <= this.currentMapIndex; i++) {
            this.ClearTileMartix(i);
        }

        this.garidText.string = `网格数:${this.xCount}x${this.yCount}`;
        this.DrawChessBoar();
        this.RefreshMapIndex();

        this.editNameText.string = "(" + this.btns[this.editModel].node.children[0].children[0].getComponent(cc.Label).string + ")";
        this.FillRect(this.currentMapIndex);
    }

    private GetJsonFileName() {
        if (this.editModel == 0) {
            return "MapConfig";
        } else if (this.editModel == 1) {
            return "BlockConfig";
        } else if (this.editModel == 2) {
            return "TerrainConfig";
        }
        return "ColorBlock";
    }

    private OnClickOperatorBtn() {
        if (this.currOperation.length > 0) {
            let item = this.currOperation.pop();
            this.ClearSiginTile(item.x, item.y);
        }
    }

    private OnClearSiginTile() {
        this.isClearSign = !this.isClearSign;
        let text = this.clearSiginBtn.node.getChildByName("New Label").getComponent(cc.Label);
        if (this.isClearSign) {
            text.string = "关闭清空单格";
        } else {
            text.string = "开启清空单格";
        }
    }

    /**清理单个块 */
    private ClearSiginTile(x: number, y: number) {
        let arr = this.GetMapList()[this.currentMapIndex];
        arr[y * this.xCount + x] = 0;
        this.FillRect(this.currentMapIndex);
    }

    /**清除全部 */
    private OnClickClearAllTile() {
        let arr = this.GetMapList()[this.currentMapIndex];
        for (let i = 0; i < arr.length; i++) {
            arr[i] = 0;
        }
        this.FillRect(this.currentMapIndex);
        this.currOperation = [];
    }

    private GetMapList() {
        let key = this.stateKeyList[this.editModel];
        return this.mapList.get(key);
    }

    /**跳到第几个地图 */
    private GoEditDidEnded(edit: cc.EditBox) {
        let str = edit.string;
        if (!Number.isNaN(str)) {
            let num = Number.parseInt(str);
            let arr = this.GetMapList();
            if (num > arr.length) {
                num = arr.length;
            }
            this.currentMapIndex = num - 1;
            this.GoNewMap();
        }
    }

    private GoNewMap() {
        this.currOperation = [];
        this.RefreshMapIndex();
        this.SwitchMap(this.currentMapIndex);
    }

}
