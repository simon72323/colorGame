import { log } from "../include";

export interface IElement
{
    /**
     * clone 的物件需要做的事情全寫在這
     * @param name 物件名字
     */
    clone(name:string):IElement;

    /**
     * 第一個實例物件需要初始化的事情全寫在這
     */
    init():void;
}

/**
 * 添加物件池 ID (麻煩需要經由 ElementPoolManager 的 Class 加上此 class decorator)
 * @param poolID 物件池 ID
 * @returns class decorator
 */
export function AddPoolID(poolID: string) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {

        log("AddPoolID", constructor);
      return class extends constructor {
        static poolID = poolID;
      };
    };
}

class ElementPool<Element extends IElement>
{
    private ref:Element;
    private arr:Array<Element>;

    private _cloneID:number = 0;

    constructor()
    {
        this.arr = [];
    }

    public takeOut():Element
    {
        let element:Element;
        if (this.arr.length > 0)
        {
            element = this.arr.pop();
        }
        else
        {
            element = <Element>this.ref.clone(this.ref.constructor.name + this._cloneID.toString());
            console.log("名稱",this.ref.constructor.name + this._cloneID.toString())
            this._cloneID++;
        }
        return element;
    }

    public pushIn(element:Element):void
    {
        if (!this.ref)
        {
            this.ref = element;
        }
        this.arr.push(element);
    }
}


export class ElementPoolManager
{
    private static _instance:ElementPoolManager;

    public static get instance():ElementPoolManager
    {
        if (!ElementPoolManager._instance)
        {
            ElementPoolManager._instance = new ElementPoolManager();
        }

        return ElementPoolManager._instance;
    }

    private pool:Object = {};
    
    /**
     * 取出物件
     * @param elementClass 物件 Class
     * @returns (實體)物件
     */
    public takeOut<Element extends IElement>(elementClass:{new(...args:any[]):{}}):Element
    {
        let className:string = elementClass["poolID"];
        let element:Element;
        if(!this.pool[className])
        {
            this.pool[className] = new ElementPool<Element>();

            element = new elementClass() as Element;
            element.init();
            this.pool[className].pushIn(element);
        }
        
        return this.pool[className].takeOut();
    }

    /**
     * 存放(回收)物件
     * @param element (實體)物件
     */
    public pushIn<Element extends IElement>(element:Element):void
    {
        const className:string = element.constructor["poolID"];
        
        if (!this.pool[className])
        {
            this.pool[className] = new ElementPool<Element>();
        }
        this.pool[className].pushIn(element);
    }
}

