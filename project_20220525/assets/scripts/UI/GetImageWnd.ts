import Consts from "../Consts/Consts";
import BaseWindow from "../FGUI/BaseWindow";
import AudioMgr from "../Framework/AudioMgr";
import { GameEventMgr } from "../Framework/GameEvent";
import Game from "../Game";

export default class GetImageWnd extends BaseWindow {
    private starRoot: fgui.GComponent = null;
    private starAnim: fgui.Transition = null;
    private boxAnim: fgui.Transition = null;
    private okBtn: fgui.GButton = null;

    private image: fgui.GLoader = null;
    private frameImage: fgui.GLoader = null;

    protected InitUI(): void {
        this.starRoot = this.contentPane.getChild("n22").asCom;
        this.starAnim = this.starRoot.getTransition("spot_an");
        this.boxAnim = this.contentPane.getTransition("box_an");
        this.okBtn = this.contentPane.getChild("n36").asButton;

        this.image = this.contentPane.getChild("Image").asLoader;
        this.frameImage = this.contentPane.getChild("kuang").asLoader;

        this.starRoot.visible = false;
        this.InitEvent();
    }

    InitEvent() {
        this.okBtn.onClick(this.OnOkClick.bind(this), this);
    }

    public setData(count: number): void {
        this.boxAnim.play(() => {
            this.starRoot.visible = true;
            this.boxAnim.play(() => { }, 1, 0, 2.25, 3);
        }, 1, 0, 0, 2.25);
        let p = Game.Instance.EventTimeConfig.OpenEvent();

        let conf = Game.Instance.EventTimeConfig.GetIdConf(p.Id.toString());
        let imageName = conf[`Image${count + 1}`];
        this.image.texture = fgui.UIPackage.getByName("RepublicPackage").getItemAssetByName(imageName) as cc.SpriteFrame;
        // cc.assetManager.loadRemote(Consts.URL + imagName + ".png", (err, ass: cc.Texture2D) => {
        //     if (err) {
        //         return;
        //     }
        //     this.image.texture = new cc.SpriteFrame(ass);
        // })

        let arr = ["tong", "yin", "jing"];
        this.frameImage.texture = fgui.UIPackage.getByName("RepublicPackage").getItemAssetByName(arr[count]) as cc.SpriteFrame;
    }

    private OnOkClick() {
        this.closeWindow();
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
        let conf = Game.Instance.EventTimeConfig.OpenEvent();
        if (conf) {
            if (Game.Instance.Date.EventTime == conf.End) {
                GameEventMgr.Instance.EmitEvent(Consts.Event.EBackMainView);
            }
        }
    }

}