import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SetChipID')
export class SetChipID extends Component {
    public playerID: number = 0;//該籌碼玩家ID
    public chipID: number = 0;//該籌碼ID
}