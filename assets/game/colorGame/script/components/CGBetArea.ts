import { _decorator, Component, find } from 'cc';
import { CGMainInit } from './CGMainInit';
const { ccclass, property } = _decorator;

@ccclass('CGBetArea')
export class CGBetArea extends Component {
    // public onBetAreaPressedCallback: (param: string) => void = null!;
    // public onBetAreaPressFailedCallback: (param: string) => void = null!;
    private Main: CGMainInit = null;//初始化資源腳本

    public onLoad(): void {
        this.Main = find('Canvas/MainScripts').getComponent(CGMainInit);
        this.node.on('OnButtonEventPressed', this.onBetAreaPressed, this);
        this.node.on('OnButtonEventPressFailed', this.onBetAreaPressFailed, this);
    }

    private onBetAreaPressed(param: string): void {
        this.Main.ChipController.createChipToBetArea(Number(param), 0, this.Main.ChipSet.touchChipID, false);
        // if (this.onBetAreaPressedCallback) {
        //     this.onBetAreaPressedCallback(param);
        // }
    }
    private onBetAreaPressFailed(param: string): void {
        // if (this.onBetAreaPressFailedCallback) {
        //     this.onBetAreaPressFailedCallback(param);
        // }
    }
}