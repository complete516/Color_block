import { GameEventMgr } from "../scripts/Framework/GameEvent";
import ToolChessBoar from "./ToolChessBoar";
import ToolTileProperty from "./ToolTileProperty";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectTile extends cc.Component {

    private listView: cc.ScrollView = null;
    private tipsText: cc.Label = null;

    @property(cc.Prefab)
    private tilePb: cc.Prefab = null;

    public tool: ToolChessBoar = null;

    protected onLoad(): void {
        this.listView = this.node.parent.getChildByName("LsitView").getComponent(cc.ScrollView);
        this.tipsText = this.node.getChildByName("Tips").getComponent(cc.Label);
    }

    start() {
        this.tool = this.node.parent.parent.getChildByName("Chessboar").getComponent(ToolChessBoar);
        // let tileList = ToolTileProperty.TileList
        // this.tipsText.string = tileList[0].text;
        // let tileCount: number = tileList.length;

        this.node.on("click", this.OnClickSelctTile.bind(this), this);
        // for (let i = 0; i < tileList.length; i++) {
        //     let p = cc.instantiate(this.tilePb);
        //     let data = tileList[i];
        //     this.listView.content.addChild(p);
        //     p.position = cc.v3(0, -(i + 0.5) * p.height);
        //     let text = p.getChildByName("Text").getComponent(cc.Label);
        //     text.string = data.text;
        //     p.on("click", () => {
        //         this.OnClickItem(i);
        //     }, this);
        // }
        // this.listView.content.height = this.tilePb.data.height * (tileCount + 1);
        this.listView.node.active = false;
        GameEventMgr.Instance.AddEvent("ShowDefault", this.ShowDefault.bind(this), this);
    }

    private OnClickItem(index: number) {
        this.ShowTipsText(index);
        this.listView.node.active = false;
        GameEventMgr.Instance.EmitEvent("ToolSelectIndex", index);
    }

    private OnClickSelctTile() {


        this.listView.node.active = !this.listView.node.active;
        if (this.listView.node.active) {
            this.ShowListView();
        }
    }

    public ShowDefault() {
        this.ShowTipsText(0);
        GameEventMgr.Instance.EmitEvent("ToolSelectIndex", 0);
        cc.log("ShowDefault")
    }

    private ShowListView() {
        if (this.tool.TiltConf.length > 0) {
            this.listView.content.removeAllChildren();
            let arr = this.tool.TiltConf;

            for (let i = 0; i < arr.length; i++) {
                let p = cc.instantiate(this.tilePb);
                let data = arr[i];
                this.listView.content.addChild(p);
                p.position = cc.v3(0, -(i + 0.5) * p.height);
                let text = p.getChildByName("Text").getComponent(cc.Label);
                text.string = "id" + data.Id + " " + data.Name + " 次数" + data.Count;
                p.on("click", () => {
                    this.OnClickItem(i);
                }, this);
            }

            let w = (arr.length + 2) * (this.tilePb.data.height);
            this.listView.content.height = w > this.listView.node.height ? w : this.listView.node.height;
        }
    }

    private ShowTipsText(index: number) {
        let data = this.tool.TiltConf[index];
        this.tipsText.string = "id" + data.Id + " " + data.Name + "次数" + data.Count;
    }
}

