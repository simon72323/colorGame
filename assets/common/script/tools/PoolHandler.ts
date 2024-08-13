import { NodePool, instantiate, Node, Prefab } from 'cc';
/**
 * @api {class} PoolHandler prefab節點創建回收
 * @apiName PoolHandler
 * @apiGroup data
 * @apiDescription prefab節點創建回收
 */

export default class PoolHandler {
    private poolTable: Map<string, NodePool> = null;
    /**取得 */
    public get(pre: Prefab): Node {
        const poolName = pre.name;//pool物件都會掛上"pool_"前綴名稱
        // console.log(poolName)
        if (this.poolTable === null) {
            this.poolTable = new Map([[poolName, new NodePool()]]);
        }
        let pool = this.poolTable.get(poolName);
        if (pool === undefined) {
            this.poolTable.set(poolName, new NodePool());
            pool = this.poolTable.get(poolName);
        }
        if (pool.size() > 0) {
            return pool.get();
        } else {
            pool.put(instantiate(pre));
        }
        return pool.get();
    }

    /**退還 */
    public put(node: Node): void {
        const poolName = node.name;//pool物件都會掛上"pool_"前綴名稱
        if (this.poolTable === null) {
            return;
        }
        let pool = this.poolTable.get(poolName);
        if (pool === null) {
            return;
        }
        // console.log("正式回收",pool)
        pool.put(node);
    }

    // public destroy(): void {
    //     for (let tab in this.poolTable) {
    //         let pool = this.poolTable.get(tab);
    //         pool.clear();
    //     }
    //     this.poolTable.clear();
    //     this.poolTable = null;
    // }
}