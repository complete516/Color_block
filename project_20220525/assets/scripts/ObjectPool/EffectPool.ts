import Consts from "../Consts/Consts";
import ResMgr from "../Framework/ResMgr";

export default class EffectPool {
    private pool: Map<string, cc.NodePool> = new Map<string, cc.NodePool>();

    constructor() {

    }

    public Push(name: string, obj: cc.Node) {
        if (!this.pool.has(name)) {
            this.pool.set(name, new cc.NodePool());
        }
        obj.active = false;
        this.pool.get(name).put(obj);
    }

    public Pop(name: string) {
        // cc.log(this.pool.has(name), name)
        if (!this.pool.has(name)) {
            this.pool.set(name, new cc.NodePool());
        }
        // cc.log(this.pool.get(name).size(), name);

        if (this.pool.get(name).size() == 0) {
            let res = ResMgr.Instance.GetRes<cc.Prefab>(name);
            let node = cc.instantiate(res.res);
            node.active = true;
            return node;
        }

        let node = this.pool.get(name).get();
        node.active = true;
        return node;
    }

    public Clear() {
        this.pool.clear();
    }
}