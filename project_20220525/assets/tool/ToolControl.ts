// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ToolControl extends cc.Component {

    public xCount: number = 0;
    public yCoun: number = 0;
    public TouchCallback: (x: number, y: number) => void;

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.OnTouchEnd.bind(this), this);
        if (cc.sys.isNative) {
            cc.debug.setDisplayStats(false);
        }
    }

    private OnTouchEnd(e: cc.Event.EventTouch) {
        let l = e.getLocation();
        l = this.node.convertToNodeSpaceAR(l);
        let sx = Math.floor((l.x + this.node.width / 2) / 100);
        let sy = Math.floor((l.y + this.node.height / 2) / 100);
        this.TouchCallback && this.TouchCallback(sx, sy);
    }

}
