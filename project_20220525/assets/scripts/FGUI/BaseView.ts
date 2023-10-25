import Consts from "../Consts/Consts";
import FangkuaixiaochuEffect from "../Effect/FangkuaixiaochuEffect";
import GamePool from "../Framework/GamePool";
import Game from "../Game";
import WhiteView from "../UI/WhiteView";
import FGUIMgr from "./FGUIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseView extends cc.Component {

    private view: fgui.GComponent = null;
    private root: cc.Node = null;
    private isShow: boolean = false;
    protected zIndex: number = 0;

    private squareAn: fgui.GComponent = null;
    private squareTrs: fgui.Transition = null;
    /**过渡动画 */
    protected transitionList: { packName: string, resName: string, tranName: string }[] = [
        { packName: "RepublicPackage", resName: "WhiteView", tranName: "t0" }
    ];

    onLoad(): void {
        // fgui.UIPackage.loadPackage(this.pkgPath, this.UILoad.bind(this));
    }

    protected start(): void {
        this.InitEvent();
    }

    public Init(view: fgui.GComponent): void {
        this.view = view;
        this.view.makeFullScreen();
        this.root = this.view.node;
        this.view.sortingOrder = this.zIndex;
        fgui.GRoot.inst.addChild(this.view);

        let obj = this.View.getChild("SquareAn");
        if (obj) {
            this.squareAn = obj.asCom;
            this.squareTrs = this.squareAn.getTransition("SquareAn");

            this.squareTrs
        }

        this.InitUI();
        this.Hide();
    }

    /**初始化UI */
    protected InitUI() {

    }

    /**初始化事件*/
    protected InitEvent() {

    }

    public Close() {
        this.Hide();
        this.ViewClose();
    }

    public ViewClose() {

    }


    public get View() {
        return this.view;
    }

    public set View(view: fgui.GComponent) {
        this.view = view
    }


    protected get Root() {
        return this.root;
    }

    protected OnShow() {

    }

    protected OnHide() {

    }

    public Show() {
        this.view.visible = true;
        this.OnShow();
        this.PlayRectEffect();
    }


    public PlayWhiteAnim() {
        FGUIMgr.Instance.ShowUI(Consts.ResName.WhiteView);
        let wv = FGUIMgr.Instance.GetView(Consts.ResName.WhiteView) as WhiteView;
        wv.Play();
    }


    public Hide() {
        this.isShow = false;
        this.view.visible = false;
        this.OnHide();
    }

    public ShowTransition() {
        this.isShow = true;
        if (this.transitionList.length > 0) {
            let index = 0;
            this.PlayTrans(index, () => {
                // this.Show();
            })
        } else {
        }
        this.Show();
    }

    private PlayTrans(index: number, callback: Function) {
        let data = this.transitionList[index];
        let com = fgui.UIPackage.createObject(data.packName, data.resName).asCom;
        let t = com.getTransition(data.tranName);
        t.play(() => {
            index++;
            if (index >= this.transitionList.length) {
                callback();
            } else {
                this.PlayTrans(index, callback);
            }
            com.dispose();
        });

        // com.setPosition(cc.winSize.width / 2 - com.width / 2, cc.winSize.height / 2 - com.height / 2);
        this.view._parent.addChild(com);
    }

    public IsShow() {
        return this.isShow
    }


    protected PlayRectEffect() {
        if (this.squareTrs) {
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node).call(() => {
                this.squareTrs.play(() => {
                });
            }).delay(4).union().repeatForever().start();

        }
    }
}