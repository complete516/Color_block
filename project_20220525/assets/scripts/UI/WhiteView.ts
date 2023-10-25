import BaseView from "../FGUI/BaseView";

const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass

export default class WhiteView extends BaseView {
    private tran: fgui.Transition = null;
    protected InitUI(): void {
        this.tran = this.View.getTransition("t0");
    }


    protected OnShow(): void {
        this.View.removeFromParent();
        fgui.GRoot.inst.addChild(this.View);
    }

    public Play(): void {
        this.tran.play();
    }
}