
import { GameEventMgr } from "../scripts/Framework/GameEvent";
import ToolChessBoar from "./ToolChessBoar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InfoLayout extends cc.Component {
    @property(cc.Node)
    private tool: cc.Node = null;

    @property(cc.Label)
    private typeText: cc.Label = null;

    @property(cc.Node)
    private color: cc.Node = null;

    @property(cc.Label)
    private countText: cc.Label = null;

    @property(cc.Label)
    private nameText: cc.Label = null;

    private toolBoard: ToolChessBoar = null;

    protected onLoad(): void {

    }

    protected start(): void {
        this.toolBoard = this.tool.getComponent(ToolChessBoar);
        GameEventMgr.Instance.AddEvent("ToolSelectIndex", this.OnSelectIndex.bind(this), this);
    }

    private OnSelectIndex(index: number) {
        let tileConf = this.toolBoard.TiltConf;
        let data = tileConf[index];
        this.typeText.string = `Type:${data.Type}`;
        let content = data.Count == -1 ? "不可消除" : data.Count.toString();
        this.countText.string = `消除次数:${content}`;
        this.nameText.string = `名称:${data.Name}`;
        this.color.color = data.Color;
    }
    // update (dt) {}
}
