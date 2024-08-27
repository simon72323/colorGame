import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ChipID')
export class ChipID extends Component {
    public id: number = 1;
}