// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Utility from "../scripts/Utility";
import ToolChessBoar from "./ToolChessBoar";
import ToolTileProperty from "./ToolTileProperty";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddTileView extends cc.Component {

    private idText: cc.Label = null;

    @property(cc.EditBox)
    private countEdit: cc.EditBox = null;

    @property(cc.Toggle)
    private toggle: cc.Toggle = null;

    @property(cc.Node)
    private countNode: cc.Node = null;

    @property(cc.Node)
    private colorCanvas: cc.Node = null;

    @property(cc.ScrollView)
    private listView: cc.ScrollView = null;

    @property(cc.Prefab)
    private item: cc.Prefab = null;

    @property(cc.Button)
    private typeBtn: cc.Button = null;

    @property(cc.Label)
    private typeText: cc.Label = null;

    @property(cc.Label)
    private nameText: cc.Label = null;

    public toolRoot: ToolChessBoar = null;

    private currentId: number = 0;
    private tileData: { Id: number, Type: number, Color: cc.Color, Count: number, Name: string } = null;

    private count: number = 0;

    private isSave: boolean = false;

    protected onLoad(): void {
        this.idText = this.node.getChildByName("ID").getComponent(cc.Label);
    }

    start() {
        let closeBtn = this.node.getChildByName("CloseBtn").getComponent(cc.Button);
        closeBtn.node.on("click", this.CloseView.bind(this));

        // this.typeEdit.node.on("editing-did-ended", this.OnTypeEditEnded.bind(this));
        // this.colorEdit.node.on("editing-did-ended", this.OnColorEditEnded.bind(this));
        this.countEdit.node.on("editing-did-ended", this.OnCountEditEnded.bind(this));
        // this.nameEdit.node.on("editing-did-ended", this.OnNameEditEnded.bind(this));
        this.countNode.active = this.toggle.isChecked;
        let saveBtn = this.node.getChildByName("SaveBtn").getComponent(cc.Button);
        saveBtn.node.on("click", this.OnClickSaveBtn.bind(this));

        this.typeBtn.node.on("click", this.OnClickTypeBtn.bind(this));

        let tileList = ToolTileProperty.TileList;
        for (let i = 0; i < tileList.length; i++) {
            let pItem = cc.instantiate(this.item);
            pItem.position = cc.v3(0, -(i + 0.5) * pItem.height);
            let btn = pItem.getChildByName("Btn").getComponent(cc.Button);
            btn.node.on("click", () => {
                this.OnClickItem(i);
            });
            let text = pItem.children[0].children[0].children[0].getComponent(cc.Label);
            text.string = tileList[i].text;
            this.listView.content.addChild(pItem);
        }

        this.listView.content.height = (tileList.length + 2) * this.item.data.height;
        this.listView.node.active = false;
    }

    protected onEnable(): void {
        this.count = 0;
        this.isSave = false
        this.toggle.enabled = true;
        let index = this.toolRoot.TiltConf.length;
        this.currentId = index + 1;

        this.idText.string = `Id:${this.currentId}`;
        this.tileData = null;

        this.typeText.string = "";
        // this.nameEdit.string = this.tileData.Name;
        this.countEdit.string = this.count.toString();
        this.nameText.string = "";
        this.colorCanvas.color = cc.Color.WHITE;
    }


    private OnCountEditEnded(editBox: cc.EditBox) {
        let str = editBox.string;
        this.count = Number.parseInt(str);
        this.tileData.Count = this.count;
    }

    private OnNameEditEnded(editBox: cc.EditBox) {
        let str = editBox.string;
        this.tileData.Name = str;
    }

    private OnToggle(toggle: cc.Toggle) {
        let ischeck = toggle.isChecked;
        this.countNode.active = ischeck;
    }


    private CloseView() {
        this.node.active = false;

    }

    private OnClickSaveBtn() {
        if (cc.sys.isNative && !this.isSave && this.tileData) {
            this.isSave = true;
            let content: string = "{\n";
            this.toolRoot.TiltConf.push(this.tileData);
            let arr = this.toolRoot.TiltConf;
            for (let i = 0; i < arr.length; i++) {
                let data = arr[i];
                data.Color.toHEX();
                content += "\t" + `"${data.Id}":{\n\t\t`;
                content += `"Id":${data.Id},\n\t\t`;
                content += `"Type":${data.Type},\n\t\t`;
                content += `"Count":${data.Count},\n\t\t`;
                content += `"Name":"${data.Name}",\n\t\t`;
                content += `"Color":"${data.Color.toHEX()}"\n\t`;
                content += "}" + (i < arr.length - 1 ? ",\n" : "");
            }
            content += "\n}";

            let path = this.toolRoot.jsonFilePath + "\\" + "TileConfig.json";
            jsb.fileUtils.writeStringToFile(content, path);
        }
    }

    private OnClickTypeBtn() {
        this.listView.node.active = true;
    }


    private OnClickItem(index: number) {
        let data = ToolTileProperty.TileList[index];
        let color = cc.color();
        cc.Color.fromHEX(color, data.color);
        this.colorCanvas.color = color;
        this.nameText.string = data.text + "_Id" + this.currentId.toString();

        if (data.type == -1) {
            this.countNode.active = false;
            this.toggle.enabled = false;
        } else {
            this.countNode.active = true;
            this.toggle.enabled = true;
            this.toggle.check();
        }

        this.tileData = {
            Type: data.type,
            Name: data.text,
            Id: this.currentId,
            Color: color,
            Count: this.count,
        }

        this.typeText.string = data.type.toString();
        this.listView.node.active = false;
    }
}
