import Consts from "../Consts/Consts";
import Game from "../Game";
import EffectPool from "../ObjectPool/EffectPool";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordBreaking extends cc.Component {
    private starParticle: cc.ParticleSystem = null;
    private colouredParticle: cc.ParticleSystem = null;

    protected onLoad(): void {
        this.starParticle = this.node.getChildByName("star_yuan").getComponent(cc.ParticleSystem)
        this.colouredParticle = this.node.getChildByName("caidai_yuan").getComponent(cc.ParticleSystem)
    }


    protected onEnable(): void {
        this.starParticle.resetSystem();
        this.colouredParticle.resetSystem();
        this.scheduleOnce(this.Collect.bind(this), 2)
    }

    private Collect() {
        this.starParticle.resetSystem();
        this.colouredParticle.resetSystem();
        Game.Instance.EffectPool.Push(Consts.ResName.RecordBreaking, this.node);
    }
}