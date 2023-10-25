export default class ColorNodePool {
    private pool: cc.NodePool = null;

    constructor() {
        this.pool = new cc.NodePool();
    }

    public Push(node: cc.Node) {
        this.pool.put(node);
    }

    public Pop() {
        if (this.pool.size() == 0) {
            let node = new cc.Node();
            node.addComponent(cc.Sprite);
            return node;
        }

        return this.pool.get();
    }

    public Clear() {
        this.pool.clear();
    }
}