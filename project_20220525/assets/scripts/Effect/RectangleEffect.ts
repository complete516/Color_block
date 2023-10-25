import Consts from "../Consts/Consts";
import Game from "../Game";

/**消除特效 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class RectangleEffect extends cc.Component {
    private ske: sp.Skeleton = null;
    /**能回收 */
    private isCanCollect: boolean = false;
    /**当前时间 */
    private currentTime: number = 0;

    public Callback: Function = null;
    private repeatPlay: boolean = false;

    protected onLoad(): void {
        this.ske = this.node.getChildByName("Spine").getComponent(sp.Skeleton);
    }

    /** */
    public Play(index: number, isLoop: boolean = false) {
        // this.ske.setBonesToSetupPose();
        this.currentTime = 0;
        this.isCanCollect = !isLoop;

        this.node.opacity = 255;
        if (isLoop && this.repeatPlay) {
            return;
        }

        this.ske.loop = isLoop;
        let timeScale = isLoop ? 1 : 2.5;

        this.ske.timeScale = timeScale;
        this.ske.animation = 'xiaochu';
        let fList = Consts.TilePropertyList.filter((item) => item.tileColor == index);

        let data = fList[0];
        this.ske.node.color = data.color;
        this.repeatPlay = isLoop;
        // cc.log("Play",isLoop,this.isCanCollect);
    }

    protected update(dt: number): void {
        if (this.isCanCollect) {
            this.currentTime += dt;
            if (this.currentTime >= 1) {
                this.isCanCollect = false;
                this.currentTime = 0;
                this.Collect();
            }
        }
    }

    public StopAnim() {
        this.currentTime = 0;
        this.isCanCollect = true;
        this.node.opacity = 0;
    }

    private Collect() {
        cc.log("回收")
        this.node.opacity = 255;
        Game.Instance.EffectPool.Push(Consts.ResName.RectangleEffect, this.node);
        this.Callback && this.Callback();
        this.Callback = null;
        this.repeatPlay = false;
    }
}
