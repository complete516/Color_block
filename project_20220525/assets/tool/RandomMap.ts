// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GameEventMgr } from "../scripts/Framework/GameEvent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RandomMap extends cc.Component {
    /**生成地图的数量 */
    @property(cc.Integer)
    private mapCount: number = 0;


    start() {
        GameEventMgr.Instance.AddEvent("StartRandomMap", this.OnCreateMap.bind(this), this);
    }

    /**生成地图 */
    private OnCreateMap() {
        if (cc.sys.isNative) {
            let fileName = "GameMapConf";
            for (let i = 0; i < this.mapCount; i++) {
                
            }
        }
    }
}
