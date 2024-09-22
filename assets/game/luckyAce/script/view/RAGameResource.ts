import { _decorator, Component, Node, resources, SpriteFrame } from 'cc';
import { RASymbolID } from '../enum/RAEnum';
const { ccclass, property } = _decorator;

@ccclass('RAGameResource')
export class RAGameResource extends Component {
    @property({ type: [SpriteFrame], tooltip: "金色symbol圖" })
    public goldSymbolSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "白色symbol圖" })
    public nomarlSymbolSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "wild圖" })
    public wildSymbolSpriteFrame: SpriteFrame[] = [];
    @property({ type: [SpriteFrame], tooltip: "scatter圖" })
    public scatterSymbolSpriteFrame: SpriteFrame[] = [];


    start() {

    }

    update(deltaTime: number) {

    }

    public getSymbolImg(symbolID: RASymbolID): SpriteFrame {
        let symbolImg: SpriteFrame | undefined;

        // 普通牌
        if(symbolID > RASymbolID.Scatter && symbolID < RASymbolID.GoldWW){
            let normalID = symbolID - 2;
            return this.nomarlSymbolSpriteFrame[normalID];
        }

        // 金色牌
        if (symbolID > RASymbolID.GoldWW) {
            let goldID = symbolID - 11;
            return this.goldSymbolSpriteFrame[goldID];
        }
            
        if(symbolID === RASymbolID.WW){
            return this.wildSymbolSpriteFrame[0];
        }

        if(symbolID === RASymbolID.GoldWW){
            return this.wildSymbolSpriteFrame[1];
        }

        if(symbolID === RASymbolID.Scatter){
            return this.scatterSymbolSpriteFrame[0];
        }

        // if (symbolID >= 28 && symbolID <= 35) {
        //     // 金色symbol ID = 28 ~ 35 = goldSymbolSpriteFrame 0 ~ 7
        //     symbolImg = this.goldSymbolSpriteFrame[symbolID - 28]
        // } else if (symbolID >= 20 && symbolID <= 27) {
        //     // 普通symbol ID = 20 ~ 27 = nomarlSymbolSpriteFrame 0 ~ 7
        //     symbolImg = this.nomarlSymbolSpriteFrame[symbolID - 20]
        // } else if (symbolID <= 2) {
        //     // wild symbol ID = 1 ~ 2 = wildSymbolSpriteFrame 0 ~ 1
        //     symbolImg = this.wildSymbolSpriteFrame[symbolID - 2]
        // } else {
        //     // scatter symbol ID = 10 = scatterSymbolSpriteFrame 0
        //     symbolImg = this.scatterSymbolSpriteFrame[symbolID - symbolID]
        // }
        return symbolImg;
    }
}
