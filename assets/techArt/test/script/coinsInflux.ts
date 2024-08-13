import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('coinsLFin')
export class coinsLFin extends Component {
    @property({ type: SpriteFrame, tooltip: "coin貼圖" })
    private coinSF: SpriteFrame = null;
    @property({ type: Node, tooltip: "coin節點" })
    private coin: Node = null;

    start() {
        for (let i = 0; i < 100; i++) {
            
        }


    }

    update(deltaTime: number) {

    }
}


