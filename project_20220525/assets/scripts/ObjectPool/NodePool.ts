export default class NodePool {
    private pool: cc.NodePool = null;
    constructor() {
        this.pool = new cc.NodePool();
    }

    public Push(node:cc.Node){
        this.pool.put(node);
    }

}