import { _decorator, assetManager, Component, Node, profiler, Scene } from 'cc'
import { MahjongView } from './components/MahjongView'
import { BaseModel } from './lib/BaseModel'
import { BasePresenter } from './lib/BasePresenter'
import { BaseView } from './lib/BaseView'
import { Resize } from './tools/Resize'
const { ccclass, property } = _decorator;
export interface IAppliction {
    relese();
}

@ccclass('Application')
export class Application implements IAppliction {
    
    private static singleton: Application = null;

    private _isSingleton: boolean = false;

    get isSingleton(): boolean { return this._isSingleton; };

    public _currentScene: Scene;

    public _canvas: Node = null;
 
    // 玩家手動關閉遊戲後將不觸發重新連線視窗
    private _invalidToReconnect: boolean = false;

    public set invalidToReconnect(b: boolean) {
        this._invalidToReconnect = b;
    }

    public get invalidToReconnect(): boolean {
        return this._invalidToReconnect;
    }

    public get currentScene(): Scene {
        return this._currentScene;
    }
    public set currentScene(value: Scene) {
        this._canvas = value.getChildByName('Canvas');
        this._currentScene = value;
    }
    public get canvas(): Node {
        return this._canvas;
    }
    processSocketNum: number = 0
    // 給Loader取連線數值
    SetProcessNum: (num: number) => void = () => {};
    // 控制Loader關閉
    CloseLoader: () => void = () => {};

    Reconnect: () => void = () => {};

    onLoad() {
        this.resize();
    }
    resize() {
        Resize.getInstance();
        assetManager.loadBundle("bg", (err, boundle) => {
            if (boundle) {
                boundle.load("bg_stretch1_land", (err, data)=>{
                    if (data) {
                        var leftBG:HTMLImageElement = document.createElement("img");
                        leftBG.style.position = "absolute";
                        leftBG.style.width = "100%";
                        leftBG.style.height = "100%";
                        leftBG.style.zIndex = "-1";
                        leftBG.src = data.toString();
                        leftBG.onload = ()=> {
                            Resize.getInstance().leftBG = leftBG;
                        }
                    }
                })
                boundle.load("bg_stretch2_land", (err, data)=>{
                    if (data) {
                        var rightBG:HTMLImageElement = document.createElement("img");
                        rightBG.style.position = "absolute";
                        rightBG.style.width = "100%";
                        rightBG.style.height = "100%";
                        rightBG.style.zIndex = "-1";
                        rightBG.src = data.toString();
                        rightBG.onload = ()=> {
                            Resize.getInstance().rightBG = rightBG;
                        }
                    }
                })
            }
        });
    }
    public relese() {
        if (this.isSingleton) Application.singleton = null;
    }
    public static getInstance(): Application {
        if (!Application.singleton) {
            Application.singleton = new Application();
            Application.singleton._isSingleton = true;
            
            profiler.hideStats(); // 關閉相關測試面板
        }
        return Application.singleton;
    }
}