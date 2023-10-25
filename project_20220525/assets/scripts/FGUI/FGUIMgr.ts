
import Consts from "../Consts/Consts";
import BaseView from "../FGUI/BaseView";
import ResMgr from "../Framework/ResMgr";
import { ResMap } from "../ResConfig";
import BaseWindow from "./BaseWindow";


const { ccclass, property } = cc._decorator;

@ccclass
export default class FGUIMgr extends cc.Component {
    private static instance: FGUIMgr = null;
    /**uiMap*/
    private uiMap: Map<string, BaseView> = new Map<string, BaseView>();
    /**window */
    private winMap: Map<string, BaseWindow> = new Map<string, BaseWindow>();
    /**在显示的UI */
    public showUIStack: string[] = [];

    public winStack: any[] = [];
    private root: fgui.GRoot = null;


    public static get Instance() {
        return FGUIMgr.instance;
    }

    protected onLoad(): void {
        this.root = fgui.GRoot.create();
        FGUIMgr.instance = this;

    }

    protected start(): void {

    }

    /**显示UI*/
    public ShowUI(resName: string) {
        if (this.uiMap.has(resName)) {
            let view = this.uiMap.get(resName);
            // view.ShowTransition();
            view.Show();
        } else {
            let view = this.node.addComponent(resName) as BaseView;
            this.uiMap.set(resName, view);
            let resData = ResMap.ResConfigMap.get(resName);
            let zOrder: number = 0;
            ResMgr.Instance.LoadFGUIPackage(resName, () => {
                view.Init(fgui.UIPackage.createObject(resData.fGUIPackName, resData.fGUIResName).asCom);
                // view.ShowTransition();
                view.Show();

            });
        }
        this.showUIStack.push(resName);
    }


    public ShowWindow(windowName: string, window: new () => BaseWindow, ...params: any[]) {
        let win: BaseWindow = null;
        // if (this.winMap.has(windowName)) {
        //     win = this.winMap.get(windowName);
        // } else {
        let resData = ResMap.ResConfigMap.get(windowName);
        win = new window();
        let view = fgui.UIPackage.createObject(resData.fGUIPackName, resData.fGUIResName).asCom;
        win.contentPane = view;
        view.makeFullScreen();
        this.winMap.set(windowName, win);
        // }

        win.show();
        win.setData(...params);
    }

    public CloseUI(resName: string) {
        if (this.uiMap.has(resName)) {
            this.uiMap.get(resName).Hide();
        }
    }

    public Close() {

    }

    /**获取还在显示的view数量*/
    public GetShowViewCount() {

        let count = this.uiMap.size;
        return count;
    }

    //获取显示的窗口数量
    public GetShowWindowCount() {
        let count = 0;
        this.showUIStack.length;
        return count;
    }

    public CloseView() {
        cc.log(this.showUIStack)
        if (this.showUIStack.length > 0) {
            let uiName = this.showUIStack.shift();
            if (this.uiMap.has(uiName)) {
                this.uiMap.get(uiName).Hide();
            }
        }
    }

    public CloseWindow() {

        this.ShowStackUI();
    }

    /**显示堆栈UI */
    private ShowStackUI() {
        if (this.showUIStack.length > 0) {
            let ui = this.showUIStack[0];
            this.showUIStack.splice(0, 1);
            this.ShowUI(ui);
        }
    }

    public GetView(ui: string) {
        return this.uiMap.get(ui);
    }



}