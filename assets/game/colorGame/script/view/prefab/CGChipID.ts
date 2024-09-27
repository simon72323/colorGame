import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CGChipID')
export class CGChipID extends Component {
    // public playerID: number = 0;//該籌碼歸屬的用戶
    public chipID: number = 0;//該籌碼ID
}