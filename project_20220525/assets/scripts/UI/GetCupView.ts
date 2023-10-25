import Consts from "../Consts/Consts";
import BaseView from "../FGUI/BaseView";
import AudioMgr from "../Framework/AudioMgr";
import Game from "../Game";

const { ccclass, property } = cc._decorator;
/**游戏界面 */
@ccclass
export default class GetCupView extends BaseView {
    private text: fgui.GTextField = null;
    private collectBtn: fgui.GButton = null;

    protected InitUI(): void {
        this.text = this.View.getChild("n3").asTextField;
        this.collectBtn = this.View.getChild("n4").asButton;
    }

    protected InitEvent(): void {
        this.collectBtn.onClick(this.OnClickCollectBtn.bind(this), this);
    }

    protected OnShow(): void {
        let date = Game.Instance.Cache.SelectDate;
        let year = Game.Instance.Date.Year;
        let str = `You have completed all daily challenges for\n${Consts.Months[date.month - 1]} ${year} and earned thus reward`;
        this.text.text = str;

        this.PlayWhiteAnim();
    }

    private OnClickCollectBtn() {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        this.Close();
        this.PlayWhiteAnim();
    }
}