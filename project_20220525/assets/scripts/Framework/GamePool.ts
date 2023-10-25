
/**对象池 */
export default class GamePool {
    private poolMap: Map<string, cc.NodePool> = new Map<string, cc.NodePool>();
    private static instance: GamePool = null;

    public static get Instance() {
        if (GamePool.instance == null) {
            GamePool.instance = new GamePool();
        }
        return GamePool.instance;
    }

    public Push(poolName: string, node: cc.Node) {
        if (!this.poolMap.has(poolName)) {
            this.poolMap.set(poolName, new cc.NodePool());
        }
        this.poolMap.get(poolName).put(node);
    }

    public Pop(poolName: string) {
        if (!this.poolMap.has(poolName)) {
            return null;
        }
        return this.poolMap.get(poolName).get();
    }

    public ClearPool(poolName: string) {
        if (!this.poolMap.has(poolName)) {
            this.poolMap.forEach((item) => item.clear());
        }
    }


    public Size() {
        return this.poolMap.size;
    }
}