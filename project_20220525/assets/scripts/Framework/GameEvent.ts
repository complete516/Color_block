

/**游戏事件 */
export class GameEventMgr {

    private static instance: GameEventMgr = null;
    public static get Instance() {
        if (GameEventMgr.instance == null) {
            GameEventMgr.instance = new GameEventMgr();
        }
        return GameEventMgr.instance;
    }
    /**事件 */
    private event: Map<string, Array<{ target: object, func: Function }>> = new Map<string, Array<{ target: object, func: Function }>>();

    public AddEvent(et: string, func: Function, target: object) {

        if (!this.event.has(et)) {
            this.event.set(et, new Array<{ target: object, func: Function }>());
        }

        let arr = this.event.get(et);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].target == target) {
                cc.log("已经注册过了", et);
                return;
            }
        }

        let obj = { target: target, func: func };
        arr.push(obj);
    }

    /**发送事件 */
    public EmitEvent(et: string, ...data: any[]) {
        if (!this.event.has(et)) {
            cc.log("没有注册事件", et);
            return;
        }

        let arr = this.event.get(et);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].target) {
                arr[i].func(...data);
            }
        }

    }

    /**删除事件 */
    public RemoveEvent(et: string, target: object) {
        if (this.event.has(et)) {
            let arr = this.event.get(et);
            for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i].target == target) {
                    arr.splice(i, 1);
                }
            }
        }
    }

    public Reset() {
        this.event.clear();
    }

}