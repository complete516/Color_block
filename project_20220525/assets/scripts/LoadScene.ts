

import Consts from "./Consts/Consts";
import ResMgr from "./Framework/ResMgr";

import SDKMgr from "./SDK/SDKMgr";
import Utility from "./Utility";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Load extends cc.Component {

    @property({ type: cc.ProgressBar, tooltip: "进度条" })
    private progressBar: cc.ProgressBar = null;
    /**当前进度 */
    private currentProgress: number = 0;
    /**进度 */
    private tempProgress: number = 0;

    private isComplete: boolean = false;

    protected onLoad(): void {
        this.currentProgress = 0;
        this.progressBar.progress = 0;
        ResMgr.Instance.LoadAllRes(this.OnLoadProgress.bind(this), this.OnLoadComplete.bind(this));
    }

    start() {
        cc.director.preloadScene("Main");
    }

    protected update(dt: number): void {
        if (this.tempProgress >= this.currentProgress) {
            return;
        }
        this.tempProgress += dt * 1;
        if (this.tempProgress >= 1) {
            this.tempProgress = 1;
        }
        this.UpdateProgress();
        if (this.tempProgress == 1 && this.isComplete) {
            this.ReplaceScene();
        }
    }

    /**更新进度 */
    private UpdateProgress() {
        this.progressBar.progress = this.tempProgress;
    }

    /**加载进度 */
    private OnLoadProgress(progress: number) {
        this.currentProgress = progress;
    }

    /**加载完成 */
    private OnLoadComplete() {
        this.isComplete = true;
        if (this.tempProgress >= 1) {
            this.ReplaceScene();
        }
    }

    /**切换场景*/
    private ReplaceScene() {
        this.isComplete = false;
        let res = ResMgr.Instance.GetRes<cc.Font>(Consts.ResName.Font);
        fgui.registerFont("PingFang Bold", res.res);
        cc.director.loadScene("Main");
        SDKMgr.Instance.Init();
        /**设置Gaid*/
        let gaid = cc.sys.localStorage.getItem(Consts.GameName + "gaid");
        if (gaid = "" || gaid == null) {
            Utility.GetGaid();
        }
    }
}
