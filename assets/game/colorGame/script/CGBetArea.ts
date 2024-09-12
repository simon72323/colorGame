import { _decorator, Component, find } from 'cc';
import { CGChipControl } from './CGChipControl';
import { CGData } from './CGData';
const { ccclass, property } = _decorator;

@ccclass('CGBetArea')
export class CGBetArea extends Component {
    // public onBetAreaPressedCallback: (param: string) => void = null!;
    // public onBetAreaPressFailedCallback: (param: string) => void = null!;
    @property(CGChipControl)
    private gameChipControl: CGChipControl = null;
    @property(CGData)
    private gameData: CGData = null;

    public onLoad(): void {
        // this.gameChipControl = find('Canvas/Scripts/CGChipControl').getComponent(CGChipControl);
        // this.gameData = find('Canvas/Scripts/CGData').getComponent(CGData);
        this.node.on('OnButtonEventPressed', this.onBetAreaPressed, this);
        this.node.on('OnButtonEventPressFailed', this.onBetAreaPressFailed, this);
    }

    private onBetAreaPressed(param: string): void {
        this.gameChipControl.createChipToBetArea(Number(param), 0, this.gameData.selectChipID, false);
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