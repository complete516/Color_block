import Consts from "../Consts/Consts";
import BaseView from "../FGUI/BaseView";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";
import SDKMgr from "../SDK/SDKMgr";
import Utility from "../Utility";

const { ccclass, property } = cc._decorator;
/**游戏主界面 */
@ccclass

export default class SettView extends BaseView {

    private soundBtn: fgui.GButton = null;
    private vibrateBtn: fgui.GButton = null;

    private soundController: fgui.Controller = null;
    private vibrateController: fgui.Controller = null;
    private versionText: fgui.GTextField = null;
    private closeBtn: fgui.GButton = null;
    private siginControl: fgui.Controller = null;

    private signBtn: fgui.GButton = null
    private outBtn: fgui.GButton = null;
    private accountText: fgui.GTextField = null;
    protected zIndex: number = 0xff;


    protected InitUI(): void {

        this.soundBtn = this.View.getChild("n9").asButton;
        this.vibrateBtn = this.View.getChild("n8").asButton;

        this.soundController = this.soundBtn.getController("button");
        this.vibrateController = this.vibrateBtn.getController("button");
        this.versionText = this.View.getChild("n10").asTextField;
        this.versionText.text = `Version:${Consts.Version}`;
        this.closeBtn = this.View.getChild("CloseBtn").asButton;
        this.siginControl = this.View.getController("c1");

        this.signBtn = this.View.getChild("Sign_Btn").asButton;
        this.outBtn = this.View.getChild("Out_Btn").asButton;
        this.accountText = this.View.getChild("SignOutName_Text").asTextField;
    }

    protected InitEvent(): void {
        this.soundBtn.onClick(this.OnClickSoundBtn.bind(this), this);
        this.vibrateBtn.onClick(this.OnClickVibrateBtn.bind(this), this);
        this.closeBtn.onClick(this.OnClickClose.bind(this), this);

        this.signBtn.onClick(this.OnClickSignBtn.bind(this), this);
        this.outBtn.onClick(this.OnClickOutBtn.bind(this), this);

        GameEventMgr.Instance.AddEvent(Consts.Event.ESignGoogle, this.LoginSuccess.bind(this), this);
        GameEventMgr.Instance.AddEvent(Consts.Event.ESignOutGoogle, this.LoginOutSuccess.bind(this), this);
    }

    protected OnShow(): void {
        this.soundController.setSelectedIndex(Game.Instance.Data.SoundOff);
        this.vibrateController.setSelectedIndex(Game.Instance.Data.VibrateOff);
        this.UpdateLogin();
    }

    //登录
    private LoginSuccess() {
        this.UpdateLogin();
    }

    //登出
    private LoginOutSuccess() {
        this.UpdateLogin();
    }

    private OnClickSignBtn() {
        Utility.DebugLog("OnClickSignBtn " + Game.Instance.Cache.IsLogin)
        if (Game.Instance.Cache.IsLogin) {
            return;
        }
        Utility.SignInGoogle();
    }

    private OnClickOutBtn() {
        if (Game.Instance.Cache.IsLogin) {
            Utility.SignOutGoogle();
        }
    }

    /**音乐按钮 */
    private OnClickSoundBtn() {
        let num = 1 - Game.Instance.Data.SoundOff;
        this.soundController.setSelectedIndex(num);
        this.SendEvent(num, Game.Instance.Data.VibrateOff);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        // cc.log("OnClickSoundBtn");
    }

    /**震动开关 */
    private OnClickVibrateBtn() {
        let num = 1 - Game.Instance.Data.VibrateOff
        this.vibrateController.setSelectedIndex(num);
        this.SendEvent(Game.Instance.Data.SoundOff, num);
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        // cc.log("OnClickVibrateBtn");
    }

    private SendEvent(sound: number, vibrate: number) {
        GameEventMgr.Instance.EmitEvent(Consts.Event.ESettingChangeState, sound, vibrate);
    }

    private OnClickClose() {
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        GameEventMgr.Instance.EmitEvent(Consts.Event.ECloseSetting);
        this.Close();
    }

    private UpdateLogin() {
        if (Game.Instance.Cache.IsLogin) {
            this.siginControl.setSelectedIndex(1);
            this.accountText.text = Game.Instance.Cache.Account.name;
        } else {
            this.siginControl.setSelectedIndex(0);
            this.accountText.text = Utility.NameFormat(Game.Instance.Data.User.name);
        }
    }
}