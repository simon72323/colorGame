import { _decorator, Component, find } from 'cc';
import { CGChipControl } from './CGChipControl';
import { CGModel } from './CGModel';
const { ccclass, property } = _decorator;

@ccclass('CGBetArea')
export class CGBetArea extends Component {
    // public onBetAreaPressedCallback: (param: string) => void = null!;
    // public onBetAreaPressFailedCallback: (param: string) => void = null!;
    @property(CGChipControl)
    private gameChipControl: CGChipControl = null;
    // @property(CGModel)
    private model: CGModel = null;

    public onLoad(): void {
        this.model = CGModel.getInstance();
        // this.gameChipControl = find('Canvas/Scripts/CGChipControl').getComponent(CGChipControl);
        // this.gameData = find('Canvas/Scripts/CGModel').getComponent(CGModel);
        this.node.on('OnButtonEventPressed', this.onBetAreaPressed, this);
        this.node.on('OnButtonEventPressFailed', this.onBetAreaPressFailed, this);
    }

    private onBetAreaPressed(param: string): void {
        this.gameChipControl.createChipToBetArea(Number(param), 0, this.model.touchChipID, false);
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