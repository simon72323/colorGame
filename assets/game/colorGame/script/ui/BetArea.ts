import { _decorator, Component, Node } from 'cc';
import { ChipDispatcher } from './ChipDispatcher';
// import PoolHandler from '../../../common/script/tools/PoolHandler';
const { ccclass, property } = _decorator;

@ccclass('BetArea')
export class BetArea extends Component {
    // public onBetAreaPressedCallback: (param: string) => void = null!;
    // public onBetAreaPressFailedCallback: (param: string) => void = null!;
    @property({ type: ChipDispatcher, tooltip: "籌碼派發層" })
    private chipDispatcher: ChipDispatcher = null;

    public onLoad(): void {
        this.node.on('OnButtonEventPressed', this.onBetAreaPressed, this);
        this.node.on('OnButtonEventPressFailed', this.onBetAreaPressFailed, this);
    }

    private onBetAreaPressed(param: string): void {
        // console.log('注區', param + '按下')
        this.chipDispatcher.createChipToBetArea(Number(param), 0);
        // if (this.onBetAreaPressedCallback) {
        //     console.log("傳按下",param)
        //     this.onBetAreaPressedCallback(param);
        // }
    }
    private onBetAreaPressFailed(param: string): void {
        // console.log('注區', param + '禁用')
        // if (this.onBetAreaPressFailedCallback) {
        //     console.log("傳按下取消",param)
        //     this.onBetAreaPressFailedCallback(param);
        // }
    }
}