import Consts from "../Consts/Consts";
import BaseView from "../FGUI/BaseView";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";

const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass

export default class NameSure extends BaseView {
    private okBtn: fgui.GButton = null;
    private cancelBtn: fgui.GButton = null;
    private text: fgui.GTextField = null;
    protected InitUI(): void {
        this.okBtn = this.View.getChild("n3").asButton;
        this.cancelBtn = this.View.getChild("n6").asButton;
        this.text = this.View.getChild("n4").asTextField;
    }

    protected InitEvent(): void {
        this.okBtn.onClick(this.OnClickOkBtn.bind(this), this);
        this.cancelBtn.onClick(this.OnClickCancelBtn.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ETextChange, this.OnTextChange.bind(this), this);
    }

    private OnTextChange(text: string) {
        this.text.text = text;
    }

    protected OnShow(): void {
        this.text.text = Game.Instance.Cache.inputStr;
    }

    private OnClickOkBtn() {
        let text = Game.Instance.Cache.inputStr
        if (text == Game.Instance.Data.User.name) {
            this.Close();
            return;
        }

        if (text != "") {
            if (text.length >= 20) {
                text = text.substring(0, 19);
            }
            Game.Instance.Net.UpdateScore(Game.Instance.Score.History, text);
            Game.Instance.Net.UpdateRectangleNum(Game.Instance.Data.Square, text);

            GameEventMgr.Instance.EmitEvent(Consts.Event.EChangeName);
        } else {
            GameEventMgr.Instance.EmitEvent(Consts.Event.ECancelChangeName);
        }
        this.Close();
    }

    private OnClickCancelBtn() {
        GameEventMgr.Instance.EmitEvent(Consts.Event.ECancelChangeName);
        this.Close();
    }
}