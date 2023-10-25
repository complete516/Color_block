// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class RectanglePromptTips extends cc.Component {

    /**方块骨骼动画 */
    @property(sp.Skeleton)
    rectangle: sp.Skeleton = null;

    start() {

    }

    public ShowPrompt(pos: cc.Vec3) {
        this.node.position = pos;
        this.node.active = true;
        this.rectangle.timeScale = 1;
        this.rectangle.loop = true;
        this.rectangle.animation = "animation";
    }

    public Chessboard() {
        this.node.scale = 0.9;
    }

    public Select() {
        this.node.scale = 0.8;
    }

    public Hide() {
        this.node.active = false;
        this.rectangle.loop = false;
        this.rectangle.animation = "";
    }
}
