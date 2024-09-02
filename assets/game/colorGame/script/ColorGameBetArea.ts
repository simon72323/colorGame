import { _decorator, Component, find } from 'cc';
import { ColorGameChipControl } from './ColorGameChipControl';
import { ColorGameData } from './ColorGameData';
// import PoolHandler from '../../../common/script/tools/PoolHandler';
const { ccclass, property } = _decorator;

@ccclass('ColorGameBetArea')
export class ColorGameBetArea extends Component {
    // public onBetAreaPressedCallback: (param: string) => void = null!;
    // public onBetAreaPressFailedCallback: (param: string) => void = null!;
    // @property({ type: ColorGameChip, tooltip: "籌碼派發層" })
    private gameChipControl: ColorGameChipControl = null;
    private gameData: ColorGameData = null;

    public onLoad(): void {
        this.gameChipControl = find('Canvas/Scripts/ColorGameChipControl').getComponent(ColorGameChipControl);
        this.gameData = find('Canvas/Scripts/ColorGameData').getComponent(ColorGameData);
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