import { _decorator, Component, UITransform } from 'cc';
import { PrefabInstancePoolManager } from '../tools/PrefabInstancePoolManager';
const { ccclass, property } = _decorator;
@ccclass('SymbolItem')
export class SymbolItem extends Component {

    protected _symbolID: number;

    protected _width: number;
    protected _height: number;

    get width(): number {
        return this.node.getComponent(UITransform).contentSize.width;
    };

    get height(): number {
        return this.node.getComponent(UITransform).contentSize.height;
    };

    get symbolID(): number {
        return this._symbolID;
    }

    changeSymbolID(id: number) {
        this._symbolID = id;
    }

    gettingBlur(b:boolean) {
        
    }

    recycle() {
        PrefabInstancePoolManager.instance.pushIn(this.node);
    }
}

