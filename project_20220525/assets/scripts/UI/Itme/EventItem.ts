import Consts from "../../Consts/Consts";
import AudioMgr from "../../Framework/AudioMgr";
import Game from "../../Game";
import EventProgressItem from "./EventProgressItem";

export default class EventItem {
    private com: fgui.GComponent = null;
    private image: fgui.GLoader = null;
    private index: number = 0;
    private controller: fgui.Controller = null;
    private numItem: { x: number, y: number } = null;
    private progressItme: EventProgressItem[] = [];
    private selectItem: EventProgressItem = null;

    constructor(item: fgui.GObject, index: number, imageName: string) {
        this.index = index;
        this.com = item.asCom;
        this.image = this.com.getChild("Image").asLoader;
        this.controller = this.com.getController("c1");
        this.numItem = Consts.EventItemNum[index].num;

        let arr = Consts.EventItemList[this.index];
        let itemNameList = ["Item1", "Item2", "Item3"]
        for (let i = 0; i < arr.length; i++) {
            let key = arr[i]
            let child = this.com.getChild(key);
            let controllIndex = itemNameList.indexOf(key.split("_")[0]);


            let progressItem = new EventProgressItem(child.asCom, controllIndex);
            this.progressItme.push(progressItem);
            let ix = this.progressItme.length - 1;
            child.onClick(() => {
                this.OnClickItme(ix, key);
            }, this);
        }

        this.image.texture = fgui.UIPackage.getByName("RepublicPackage").getItemAssetByName(imageName) as cc.SpriteFrame;;
        // let url = Consts.URL + imageName + ".png";
        // cc.assetManager.loadRemote(url, (err, ass: cc.Texture2D) => {
        //     if (err) {
        //         return;
        //     }
        //     this.image.texture = new cc.SpriteFrame(ass);
        // });
    }

    private OnClickItme(index: number, key: string) {
        for (let item of this.progressItme) {
            item.CancelSelect();
        }

        this.progressItme[index].Select();
        Game.Instance.Cache.SelectEvent.eventName = key;
        AudioMgr.Instance.PlayEffect(Consts.ResName.Button);
    }

    /**刷新 */
    public UpdateSelect(eventList: string[]) {

        let arr = Consts.EventItemList[this.index];
        let isSelect: boolean = false;
        for (let i = 0; i < arr.length; i++) {
            let key = arr[i];
            let data = Game.Instance.Score.GetEventData(this.index, key);
            this.progressItme[i].CancelSelect();
            if (isSelect == false && eventList.indexOf(key) != -1) {
                isSelect = true;
                this.progressItme[i].Select();
                this.selectItem = this.progressItme[i];
            }
            let conf = Game.Instance.EventDataConfig.GetEventConf(this.index, key);

            if (data.h > 0 && data.h >= conf.score) {
                this.progressItme[i].Visible = false;
            } else {
                if (data.s > 0) {
                    let maxScore = Game.Instance.EventDataConfig.GetEventConf(this.index, key).score;
                    this.progressItme[i].Visible = true;
                    this.progressItme[i].ProgressValue = Math.floor(data.s / maxScore * 100);
                }
            }
        }
    }

    public GetSelectItme() {
        return this.selectItem;
    }

    /**设置控制状态*/
    public SetControlStatus(index: number) {
        if (this.index <= index) {
            this.controller.setSelectedIndex(0);
        } else {
            this.controller.setSelectedIndex(1);
        }
    }
}