import ConfigMgr from "../Config/ConfigMgr";
import Game from "../Game";

export default class ShowTextureView {
    private view: fgui.GComponent = null;
    private listView: fgui.GList = null;
    private itemList: fgui.GComponent[] = [];
    private controller: fgui.Controller = null;

    constructor(com: fgui.GComponent, controller: fgui.Controller) {
        this.view = com;
        this.controller = controller;
        this.InitUI();
    }

    private InitUI() {
        this.listView = this.view.getChild("ImageList").asList;
        let obj = Game.Instance.Reward.GetTexture();
        let keys = Object.keys(obj);

        for (let i = 0; i < keys.length; i++) {
            let data = obj[keys[i]];
            let count = data.count;
            let yearList = data.year;
            for (let j = 0; j < count; j++) {
                this.AddItmeToList(keys[i], j, yearList[j]);
            }
        }
    }

    public Update() {
        let obj = Game.Instance.Reward.GetTexture();
        let keys = Object.keys(obj);
        let index: number = 0;
        for (let i = 0; i < keys.length; i++) {
            let data = obj[keys[i]];
            let count = data.count;
            let yearList = data.year;
            for (let j = 0; j < count; j++) {
                if (index >= this.itemList.length) {
                    this.AddItmeToList(keys[i], j, yearList[j]);
                }
                index++;
            }
        }
        if (keys.length == 0) {
            this.controller.setSelectedIndex(2);
        }

    }

    private AddItmeToList(id: string, count: number, year: string) {
        let item = this.listView.addItem().asCom;
        let imag = item.getChild("Image").asLoader;
        let frame = item.getChild("kuang").asLoader;
        let nameText = item.getChild("n4").asTextField;
        let yearText = item.getChild("n5").asTextField;
        let arr = ["tong", "yin", "jing"];

        yearText.text = year;
        let conf = Game.Instance.EventTimeConfig.GetIdConf(id);
        let imageName = conf[`Image${count + 1}`];
        // cc.log(conf, `Image${count}`)
        imag.texture = null;
        // let url = "https://h5xiaoyouxi.oss-cn-beijing.aliyuncs.com/html5/colormatch/" + imagName + ".png";
        // cc.assetManager.loadRemote(url, (err, ass: cc.Texture2D) => {
        //     if (err) {
        //         return;
        //     }
        //     imag.texture = new cc.SpriteFrame(ass);
        // })

        imag.texture = fgui.UIPackage.getByName("RepublicPackage").getItemAssetByName(imageName) as cc.SpriteFrame;

        nameText.text = conf.Name;
        frame.texture = fgui.UIPackage.getByName("RepublicPackage").getItemAssetByName(arr[count]) as cc.SpriteFrame;
        this.itemList.push(item);
    }

}