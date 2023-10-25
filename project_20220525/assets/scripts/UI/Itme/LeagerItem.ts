import Utility from "../../Utility";

export default class LeagerItem {
    private com: fgui.GComponent = null;
    private index: number = 0;
    private idText: fgui.GTextField = null;
    private pointsText: fgui.GTextField = null;
    private squareText: fgui.GTextField = null;
    private controller: fgui.Controller = null;
    private background: fgui.GComponent = null;

    private isSelf: boolean = false;

    constructor(com: fgui.GComponent, index: number) {
        this.com = com;
        this.Init();
    }

    private Init() {
        this.idText = this.com.getChild("ID_Text").asTextField;
        this.pointsText = this.com.getChild("Points_Text").asTextField;
        this.squareText = this.com.getChild("Square_Text").asTextField;
        this.controller = this.com.getController("c1");
        this.background = this.com.getChild("your_bg").asCom;
        this.background.visible = false;
    }

    public set UserName(name: string) {
        if (this.isSelf) {
            this.idText.text = "Yours";
        } else {
            this.idText.text = Utility.NameFormat(name);
        }
    }

    public set Point(name: string) {
        this.pointsText.text = name + " Points";
    }

    public set Square(name: string) {
        this.squareText.text = name + " Times";
    }

    public get Index() {
        return this.index;
    }

    public SetStatus(index: number) {
        this.controller.setSelectedIndex(index);
    }

    public set Visible(vis: boolean) {
        this.com.visible = vis;
    }

    public Self(visible: boolean) {
        this.background.visible = visible;
        this.isSelf = visible;
    }

}