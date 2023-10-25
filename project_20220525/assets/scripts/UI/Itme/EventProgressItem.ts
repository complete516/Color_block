export default class EventProgressItem {
    private com: fgui.GComponent = null;
    private controller: fgui.Controller = null;
    private progressBackground: fgui.GLoader = null;
    private progressLoad: fgui.GLoader = null;

    private progress: fgui.GProgressBar = null;
    private currControllIndex: number = 0;
    private name: string = ""
    private transition: fgui.Transition = null;


    constructor(com: fgui.GComponent, index: number) {
        this.com = com;
        this.controller = this.com.getController("c1");
        this.controller.setSelectedIndex(index);
        this.progressBackground = this.com.getChild("n0").asLoader;
        this.progressLoad = this.com.getChild("bar").asLoader;

        this.progressBackground.visible = false;
        this.progressLoad.visible = false;

        this.progress = this.com.asProgress;
        this.currControllIndex = index;
        this.transition = this.com.getTransition("idel_lock");
    }

    public set ProgressValue(value: number) {
        this.progress.value = value;
        this.progressBackground.visible = true;
        this.progressLoad.visible = true;
    }

    public CancelSelect() {
        this.controller.setSelectedIndex(this.currControllIndex);
        this.transition.stop();
    }

    public Select() {
        this.controller.setSelectedIndex(3);
        this.transition.play();
        this.transition.changePlayTimes(-1);
    }

    public get ItemName() {
        return this.com.name;
    }

    public set Visible(visible: boolean) {
        this.com.visible = visible;
    }
}