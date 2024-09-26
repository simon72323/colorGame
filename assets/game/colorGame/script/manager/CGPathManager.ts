import { Node, assetManager, director, JsonAsset } from "cc";
import { PathInfo } from "../enum/CGInterface";



export class CGPathManager {

    private static singleton: CGPathManager = null;

    protected _isSingleton: boolean = false;
    get isSingleton(): boolean { return this._isSingleton; }

    protected _node: Node;
    get node(): Node { return this._node };

    public allPathData: PathInfo[] = [];//所有路徑資料

    constructor() {
        this.init();
    }

    // 初始化
    protected init() {
        const node: Node = new Node("CGPathManager");
        this._node = node;
        director.addPersistRootNode(node);
        CGPathManager.singleton = this;

        assetManager.loadBundle("path", (err: Error | null, bundle) => {
            if (err) {
                console.error("加載 bundle 失敗:", err);
                return;
            }
            // 在這裡加載 bundle 中的資源
            bundle.load('CGPath', JsonAsset, (err: Error | null, jsonAsset: JsonAsset) => {
                if (err) {
                    console.error("加載路徑失敗:", err);
                    return;
                }
                // 獲取json資料
                for (let i = 0; i < jsonAsset.json.length; i++) {
                    this.allPathData[i] = jsonAsset.json[i];
                }
                this._node.emit("completed");
            });
        });
    }
    public static getInstance(): CGPathManager {
        if (!CGPathManager.singleton) {
            CGPathManager.singleton = new CGPathManager();
            CGPathManager.singleton._isSingleton = true;
        }
        return CGPathManager.singleton;
    }
}