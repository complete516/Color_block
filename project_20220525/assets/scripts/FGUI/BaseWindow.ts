import FGUIMgr from "./FGUIMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseWindow extends fgui.Window {
    protected onInit(): void {
        super.onInit();
        this.center();
        this.InitUI();
    }


    protected InitUI() {

    };

    protected closeWindow() {
        this.dispose();
    }



    public setData(...data: any[]) {

    }

    public get View() {
        return this.contentPane;
    }
}