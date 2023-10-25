import Consts from "../Consts/Consts";
import Game from "../Game";

/**消除特效 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class EliminateEffect extends cc.Component {
    private particleSystem: cc.ParticleSystem = null;

    protected onLoad(): void {
        this.particleSystem = this.node.getChildByName("xiaochu").getComponent(cc.ParticleSystem);
    }

    protected onEnable(): void {
        this.particleSystem.resetSystem();
    }

    /** */
    public Play() {
        this.particleSystem.resetSystem();
        this.scheduleOnce(this.Collect.bind(this), 1);
    }

    private Collect() {
        this.particleSystem.resetSystem();
        Game.Instance.EffectPool.Push(Consts.ResName.EliminateEffect, this.node);
    }



    // update (dt) {}
}
