import { Node, Prefab, instantiate } from "cc";

class PrefabInstancePool
{
    private prefab:Prefab;
    private arr:Array<Node>;

    constructor(prefab:Prefab) {
        this.prefab = prefab;
        this.arr = [];
    }

    public takeOut():Node {
        let instance:Node;
        if (this.arr.length > 0) {
            instance = this.arr.pop();
        } else {
            instance = instantiate(this.prefab);
        }
        instance["prefabName"] = this.prefab.name;
        return instance;
    }

    public pushIn(instance:Node):void {
        this.arr.push(instance);
    }
}


export class PrefabInstancePoolManager
{
    private static _instance:PrefabInstancePoolManager;

    public static get instance():PrefabInstancePoolManager {
        if (!PrefabInstancePoolManager._instance) {
            PrefabInstancePoolManager._instance = new PrefabInstancePoolManager();
        }
        return PrefabInstancePoolManager._instance;
    }

    private poolTable:Object = {};
    
    /**
     * 取出物件
     * @param prefab Prefab
     * @returns (實體)物件
     */
    public takeOut(prefab:Prefab):Node
    {
        const name: string = prefab.name;
        if(!this.poolTable[name]) {
            this.poolTable[name] = new PrefabInstancePool(prefab);
        }
        return this.poolTable[name].takeOut();
    }

    /**
     * 存放(回收)物件
     * @param node (實體)物件
     */
    public pushIn(node:Node):void {
        //如果有"prefabName"參數，代表是物件池生成的物件
        if (node["prefabName"]) {
            this.poolTable[node["prefabName"]].pushIn(node);
        }
    }
}