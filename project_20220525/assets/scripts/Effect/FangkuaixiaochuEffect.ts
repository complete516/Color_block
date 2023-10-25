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
export default class FangkuaixiaochuEffect extends cc.Component {

    @property(cc.ParticleSystem)
    private pList: cc.ParticleSystem[] = [];

    protected onLoad(): void {

    }

    start() {

    }


    public Play() {
        this.ResetParticle();
        this.scheduleOnce(this.Collect.bind(this), 1);
    }

    private Collect() {
        this.ResetParticle();
        Game.Instance.EffectPool.Push(Consts.ResName.FangkuaixiaochuEffect, this.node);
    }

    private ResetParticle() {
        for (let i = 0; i < this.pList.length; i++) {
            this.pList[i].resetSystem();
        }
    }
}
