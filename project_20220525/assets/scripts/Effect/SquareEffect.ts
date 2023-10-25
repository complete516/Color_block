// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class SquareEffect extends cc.Component {

    @property(sp.Skeleton)
    private ske: sp.Skeleton = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    private animList: { [key: number]: string } = { 3: "red", 4: "blue", 6: "yellow" };

    start() {
        this.ske.setCompleteListener(this.OnCompleteList.bind(this));
    }

    public PlayAnim(index: number) {
        this.ske.animation = this.animList[index]
        this.ske.loop = false;
    }

    private OnCompleteList() {
        cc.log("删除")
        this.node.destroy();
    }

    // update (dt) {}
}
