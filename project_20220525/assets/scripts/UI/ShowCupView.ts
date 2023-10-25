/**
 * 奖杯界面
 */
import Consts from "../Consts/Consts";
import Game from "../Game";
export default class ShowCupView {

    private view: fgui.GComponent = null;
    private listView: fgui.GList = null;
    private cupList: fgui.GComponent[] = [];

    
    constructor(com: fgui.GComponent) {
        this.view = com
        this.InitUI();
    }

    private InitUI() {
        this.listView = this.view.getChild("CupList").asList;
        let childer = this.listView._children;

        let date = Game.Instance.Date;

        this.Update();
        for (let i = date.Month; i < 12; i++) {
            let ch = childer[i];
            ch.visible = false;
        }
    }

    public Update() {
        let conf = Game.Instance.DailyChallengesConfig;
        let childer = this.listView._children;
        let date = Game.Instance.Date;
        let reward = Game.Instance.Reward;
        let index: number = 0;
        for (let i = date.Month - 1; i >= 0; i--) {
            let ch = childer[index];
            let item = ch.asCom;
            let text = item.getChild("n2").asTextField;
            let cup = item.getChild("n1").asLoader;
            cup.texture = null;
            let imageName = conf.GetConfList(i).Image;
            // if (conf) {
            //     cc.assetManager.loadRemote(Consts.URL + conf.GetConfList(i).Image + ".png", (err, res: cc.Texture2D) => {
            //         if (err) {
            //             return;
            //         }
            //         cup.texture = new cc.SpriteFrame(res);
            //     })
            // }

            cup.texture = fgui.UIPackage.getByName("RepublicPackage").getItemAssetByName(imageName) as cc.SpriteFrame;


            text.text = Consts.Months[i];
            this.cupList.push(item);
            ch.grayed = reward.CupContain(i + 1);
            index++;
        }
    }
}