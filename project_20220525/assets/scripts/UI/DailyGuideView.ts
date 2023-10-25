import Consts from "../Consts/Consts";
import BaseView from "../FGUI/BaseView";
import BaseWindow from "../FGUI/BaseWindow";
import AudioMgr from "../Framework/AudioMgr";
import Game from "../Game";
const { ccclass, property } = cc._decorator;
/**美容挑战引导 */
@ccclass
export default class DailyGuideView extends BaseWindow {
    /**手特效 */
    private handTrans: fgui.Transition = null;
    private nextBtn: fgui.GButton = null;
    private listView: fgui.GList = null;
    private step: number = 0;
    private controller: fgui.Controller;
    private btnController: fgui.Controller;

    protected InitUI(): void {
        this.handTrans = this.contentPane.getTransition("t0");
        this.nextBtn = this.contentPane.getChild("n9").asButton;

        let page = this.contentPane.getChild("n4").asCom;
        this.controller = page.getController("c1");
        this.nextBtn.onClick(this.OnClickNextBtn.bind(this), this);
        this.listView = this.contentPane.getChild("n7").asList;
        this.btnController = this.nextBtn.getController("c1");
    }

    protected InitEvent(): void {

    }

    protected onShown(): void {

    }

    /**点击下一步按钮 */
    private OnClickNextBtn() {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        if (this.step >= 2) {
            this.closeWindow();
            Game.Instance.GameGuide.DailyGuideStep = this.step;
            return;
        }

        this.step++;
        this.controller.setSelectedIndex(this.step);
        this.listView.scrollPane.setCurrentPageX(this.step);
        if (this.step >= 2) {
            this.btnController.setSelectedIndex(1);
        }
    }
}