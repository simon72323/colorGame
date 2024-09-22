import { _decorator, Toggle, Sprite} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('customToggle')
export class customToggle extends Toggle {
    @property([Sprite])
    private disabledGray: Sprite[] = [];

    protected _updateState(): void {
        super._updateState();
        for (const data of this.disabledGray) {
            data.grayscale = !this.interactable;
        }
    }
}