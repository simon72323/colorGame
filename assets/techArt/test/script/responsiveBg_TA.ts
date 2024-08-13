//適用於3.x版

import { _decorator, Node, Component, v3, Canvas, view,ResolutionPolicy } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, menu, executeInEditMode } = _decorator;

//直橫式Node
@ccclass('responsiveBg_TA')
@menu('TA/responsiveBg_TA')
@executeInEditMode
export class responsiveBg_TA extends Component {
    private _canvas: Node | null = null;//canvas節點
    private _width = 0;//暫存目前畫面寬度
    private _height = 0;//暫存目前畫面高度
    // public _LandscapeView = size(1920, 1080);//橫式螢幕尺寸

    @property({ type: [Node], tooltip: "背景縮放物件" })
    public bgScaleNode: Node[] = [];

    onLoad() {
        //獲取Canvas層
        this._canvas = this.node;
        while (!this._canvas!.getComponent(Canvas)) {
            this._canvas = this._canvas!.parent;
        }
    }

    start() {
        console.log("開始")
        if (!EDITOR) {
            this.scheduleOnce(() => {
                this.resetUI();//第一次啟動畫面，待0.1秒後刷新UI
            }, 0.1)
        }
    }

    //更新Canvas參數(自適應螢幕比例，以1920:1080為基準)
    EditModeResetUI() {
        if ((view.getVisibleSize().width / view.getVisibleSize().height) > 16 / 9) {
            // view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_HEIGHT);//以1920:1080為基準，橫式鎖定高
            let scaleNum = (view.getVisibleSize().width / view.getVisibleSize().height) / (16 / 9);//自適應縮放值
            for (let i = 0; i < this.bgScaleNode.length; i++) {
                console.log("尺寸",scaleNum)
                this.bgScaleNode[i]!.setScale(v3(scaleNum, scaleNum, scaleNum));//設置背景自適應縮放
            }
        } else {
            // view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_WIDTH)
            for (let i = 0; i < this.bgScaleNode.length; i++) {
                console.log("尺寸1")
                this.bgScaleNode[i]!.setScale(v3(1, 1, 1));//背景回歸不縮放
            }
        }
    }

    resetUI() {
        this._width = view.getVisibleSize().width;//紀錄畫面寬度
        this._height = view.getVisibleSize().height;//紀錄畫面高度
        console.log("寬高",this._width, this._height)
    }

    update() {
        if (!EDITOR) {
            console.log("更新",view.getVisibleSize().width,view.getVisibleSize().height)
            if (view.getVisibleSize().width != this._width || view.getVisibleSize().height != this._height) {
                this.resetUI();//更新UI
                this.EditModeResetUI();//更新畫面比例設置
            }
        }
    }

}