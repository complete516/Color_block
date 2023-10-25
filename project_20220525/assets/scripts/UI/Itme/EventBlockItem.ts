import Utility from "../../Utility";

export default class EventBlockItem {
    private nameText: fgui.GTextField = null;
    private com: fgui.GComponent = null;
    private dayNumText: fgui.GTextField = null;
    private icon: fgui.GLoader = null;


    constructor(object: fgui.GObject) {
        this.com = object.asCom;
        this.nameText = this.com.getChild("EventName").asTextField;
        this.dayNumText = this.com.getChild("n18").asCom.getChild("EventTime").asTextField;
        this.icon = this.com.getChild("n12").asLoader;
    }

    public SetEventName(name: string) {
        this.nameText.text = name;
    }

    public SetEventTime(day: number, hour: number) {
        this.dayNumText.text = `${day}d${Utility.FormatZeroPad(hour)}h`
    }

    public SetIcon(icon: string) {
        this.icon.texture = fgui.UIPackage.getByName("RepublicPackage").getItemAssetByName(icon) as cc.SpriteFrame
    }
}