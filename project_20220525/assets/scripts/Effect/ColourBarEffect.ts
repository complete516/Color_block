// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Consts from "../Consts/Consts";
import Game from "../Game";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ColourBarEffect extends cc.Component {

    @property(cc.ParticleSystem)
    private particleSystemList: cc.ParticleSystem[] = [];
    private isFirst: boolean = false;
    private isNewGuid: boolean = false;

    protected onLoad(): void {

    }

    start() {
        this.Collect();
    }

    protected onEnable(): void {
        // if (this.isFirst) {
        //     this.particleSystem.resetSystem();
        //     this.scheduleOnce(this.Collect.bind(this), 3);
        // }
        // this.isFirst = true;
    }

    public Play() {
        this.ResetParticle();
        this.scheduleOnce(this.Collect.bind(this), 3);
    }

    public RepeatPlay() {
        this.ResetParticle();
    }

    private Collect() {
        this.ResetParticle();
        Game.Instance.EffectPool.Push(Consts.ResName.ColourBar, this.node);
    }

    private ResetParticle() {
        for (let item of this.particleSystemList) {
            item.resetSystem();
        }
    }
}
