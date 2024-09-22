import { _decorator, Component, find, Label, math, Node, Size, Sprite, SpriteFrame, UITransform, Vec2 } from 'cc';
import { RASymbolID } from '../enum/RAEnum';
import { RAGameResource } from './RAGameResource';
const { ccclass, property } = _decorator;

@ccclass('RASymbolTip')
export class RASymbolTip extends Component {

    @property(Node)
    public infoBG: Node = null!;//底圖

    @property(Sprite)
    public symbolSpr: Sprite = null!; //symbol圖

    @property(Node)
    public symAmountRoot: Node = null!; //倍數根節點

    @property(Node)
    public oddsNumberRoot: Node = null!; //賠率根節點

    @property(RAGameResource)
    public gameResource: RAGameResource = null!;

    @property([Label])
    public oddsNumber: Label[] = [];//賠率 Label

    @property(Node)
    public wildTx: Node = null!; // wild提示文字節點

    @property(Node)
    public scatterTx: Node = null!; // scatter提示文字節點

    // symbol bg size
    private readonly symbol_w: number = 454;
    private readonly wiid_w: number = 560;
    private readonly scatter_w: number = 610;
    private readonly normal_h: number = 310;

    protected onLoad(): void {
    }

    protected start(): void {
    }

    protected update(deltaTime: number) {
    }

    /**
     * 設定 symbol hint
     * @param sp 
     * @param amount 
     */
    public setSymbolHint(id: RASymbolID, amount?: number[]): void {

        this.setSymbolSprite(this.gameResource.getSymbolImg(id));

        switch(id){
            case RASymbolID.WW: // wild
            case RASymbolID.GoldWW:
                this.symAmountRoot.active = false;
                this.oddsNumberRoot.active = false;
                this.wildTx.active = true;
                this.scatterTx.active = false;
                this.setBGSize(this.wiid_w, this.normal_h);
                break;
            case RASymbolID.Scatter:
                this.symAmountRoot.active = false;
                this.oddsNumberRoot.active = false;
                this.wildTx.active = false;
                this.scatterTx.active = true; 
                this.setBGSize(this.scatter_w, this.normal_h);
                break;
            default:
                this.symAmountRoot.active = true;
                this.oddsNumberRoot.active = true;
                this.wildTx.active = false;
                this.scatterTx.active = false;
                this.setSymbolOdds(amount);
                this.setBGSize(this.symbol_w, this.normal_h);
                break;
        }
    }

    /**
     * 設定 symbol 圖
     * @param sp  symbol 圖
     */
    private setSymbolSprite(sp: SpriteFrame): void {
        this.symbolSpr.spriteFrame = sp;
    }

    /**
     * 設定賠率
     * @param amount 
     */
    private setSymbolOdds(amount: number[]): void {
        for(let i = 3; i < amount.length; ++i){
            this.oddsNumber[i - 3].string = amount[i].toString();
        }
    }

    /**
     * 設定底圖 size
     * @param size 
     */
    private setBGSize(w:number, h: number): void{
        this.infoBG.getComponent(UITransform).setContentSize(new Size(w, h));
    }
}

