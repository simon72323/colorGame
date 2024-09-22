import { _decorator, Animation, Component, sp, Sprite, tween, Vec3, Node, UIOpacity, CCInteger, Enum} from 'cc';
import { RASymbolID } from '../enum/RAEnum';
import { RAGameResource } from './RAGameResource';
const { ccclass, property } = _decorator;

@ccclass('RASymbol')
export class RASymbol extends Component {
    @property(RAGameResource)
    public gameResource: RAGameResource = null!;

    @property({type: Vec3})
    public startPos = new Vec3() // 撲克牌起始位置

    @property({type: Vec3})
    public endPos = new Vec3(); // 撲克牌最終位置 (位置: 130 390 650 910)

    @property({type: Vec3})
    public outPos = new Vec3() // 撲克牌移出位置

    @property(CCInteger)
    public rowID: number = 0; // 撲克牌最後所在列的 index

    @property(CCInteger)
    public columnID: number = 0; // 撲克牌最後所在列的 index

    @property({type: Enum(RASymbolID)})
    public symbolID: RASymbolID = RASymbolID.GoldClubs; // symbol ID

    // main
    private main: Node = null!;
    // symbol
    private symbolNode: Node = null!;
    private symbolSpr: Sprite = null!;
    private symbolAni: Animation = null!;
    // scatter
    private scatterNode: Node = null!;
    private scatterSpine: sp.Skeleton = null!;
    // wild
    private wildNode: Node = null!;
    private wildSpine: sp.Skeleton = null!;

    // symbol 落下時間
    private moveInTime: number = 0.05;
    private moveOutTime: number = 0.4; //symbol落下時間
    private moveToTime: number = 0.1;
    // Fx
    private winFx: Node = null!;

    protected onLoad(): void {
        // main
        this.main = this.node.getChildByPath('main')!;

        // symbol
        this.symbolNode = this.node.getChildByPath('main/symbol')!;
        this.symbolSpr = this.symbolNode.getComponent(Sprite)!;
        this.symbolAni = this.node.getComponent(Animation)!;

        // scatter
        this.scatterNode = this.node.getChildByPath('main/scatter')!;
        this.scatterSpine = this.scatterNode.getComponent(sp.Skeleton)!;

        // wild
        this.wildNode = this.node.getChildByPath('main/wild')!;
        this.wildSpine = this.wildNode.getComponentInChildren(sp.Skeleton)!;

        // Fx 動畫
        this.winFx = this.node.getChildByPath('winFx')!;
    }

    protected start(): void {

    }

    /**
     * 移動 symbol 至指定位置
     */
    public moveIn(): void{
        this.symbolNode.getComponent(UIOpacity).opacity = 255;
        this.node.setPosition(this.startPos);
        tween(this.node)
            .to((this.moveInTime * (this.rowID + 1)), {position: this.endPos}) // rowID 越小，移動時間越短
            .call(() => { this.playGoldRay() })
            .start();
    }

    /**
     * 移動 symbol 至畫面外
     */
    public moveOut(): void {
        this.node.setPosition(this.endPos);
        tween(this.node).to(this.moveOutTime, { position: this.outPos })
            .start();
    }

    /**
     * symbol移到指定位置
     * @param targetpos 
     */  
    public moveTo(targetpos: Vec3, callback?: Function): void {
        tween(this.node)
        .to((this.moveToTime), {position: targetpos})
        .call(()=>{if(callback){callback()}})
        .call(()=>{this.node.destroy()})
        .start();
    }

    /**
     * 設定symbol圖片
     * @param id 傳入ID後取得symbol圖片
     */
    public setSymbol(id: RASymbolID): void {
        // 設定 id
        this.symbolID = id;

        this.symbolNode.active = false;
        this.scatterNode.active = false;
        this.wildNode.active = false;

        switch(id){
            case RASymbolID.GoldClubs:
            case RASymbolID.GoldDiamonds:
            case RASymbolID.GoldHearts:
            case RASymbolID.GoldSpades:
            case RASymbolID.GoldJ:
            case RASymbolID.GoldQ:
            case RASymbolID.GoldK:
            case RASymbolID.GoldAce:
            case RASymbolID.Clubs:
            case RASymbolID.Diamonds:
            case RASymbolID.Hearts:
            case RASymbolID.Spades:
            case RASymbolID.J:
            case RASymbolID.Q:
            case RASymbolID.K:
            case RASymbolID.Ace:
                this.symbolNode.active = true;
                break;
            case RASymbolID.WW: // wild
            case RASymbolID.GoldWW:
                this.wildNode.active = true;
                break;
            case RASymbolID.Scatter: // scatter
                this.scatterNode.active = true;
                break;
        }

        // 一般 symbol，設定 symbol 圖
        if (this.symbolNode.active) {
            this.symbolSpr.spriteFrame = this.gameResource.getSymbolImg(id);
        }

        // symbol 為 scatter 時，播放 idle 動畫
        if (this.scatterNode.active) {
            this.playScatterSpine('idle', true);
        }
    }

    /**
     * 直接把這個symbol設定成wild(不用經過翻牌動畫演出，直接變)
     * @param id 
     */
    public setWildSymbolDirect(id: RASymbolID): void {
        if(id !== RASymbolID.WW && id !== RASymbolID.GoldWW){
            return;
        }

        // 設定 id
        this.symbolID = id;

        this.symbolNode.active = false;
        this.scatterNode.active = false;
        this.wildNode.active = true;
        this.wildNode.getComponent(UIOpacity).opacity = 255;

        let trackEntry : sp.spine.TrackEntry = null!;
        (id === RASymbolID.WW) ? 
        (trackEntry = this.wildSpine.setAnimation(0, 'flip_green', false)) : 
        (trackEntry = this.wildSpine.setAnimation(0, 'flip_red', false))

        let animationDuration = trackEntry.animationEnd - trackEntry.animationStart;
        trackEntry.trackTime = Math.max(0, animationDuration - 0.1); // 從最後 0.1 秒開始
    }

    /**
     * 取得symbol ID
     * @returns
     */
    public getSymbolID(): RASymbolID {
        return this.symbolID;
    }

    /**
     * 播放 scatter spine 動畫(idle, listen, win)
     * @param clipName
     */
    public playScatterSpine(clipName: string, loop: boolean): void {
        this.scatterSpine.setAnimation(0, clipName, loop);
    }

    /**
     * 播放 symbol 連線 symbol動畫
     */
    public playWin(): void{
        this.winFx.active = false;
        switch(this.symbolID){
            case RASymbolID.WW:
                this.wildSpine.setAnimation(0, 'win_green', false);
                break;
            case RASymbolID.GoldWW:
                this.wildSpine.setAnimation(0, 'win_red', false);
                break;
            default:
                this.winFx.active = true;
                this.node.getComponent(Animation)!.play('symbolWinMod'); // 動畫時間1.10秒
                break;
        }  
    }

    /**
     * 播放symbol開場動畫
     */
    public playSymbolOpening(): void {
        this.node.active = true;
        this.symbolNode.getComponent(UIOpacity).opacity = 0;
        this.symbolAni.play('symbolOpeningMod');
    }

    /**
     * 播放 symbol 連線後，symbol 消失動畫
     */
    public playDestroy(): void {
        this.winFx.active = false;
        this.wildNode.active = false;
        this.node.getComponent(Animation).play('symbolWin_destroyFxMod');
    }

    /**
     * 取得此symbol掉落後在畫面上哪個位置
     * @returns 
     */
    public getEndPos(): Vec3 {
        return this.endPos;
    }

    /**
     * 補牌
     * @param id
     */
    public playDraw(id: RASymbolID): void {
        this.setSymbol(id);
        
        if((this.symbolID !== RASymbolID.WW) && (this.symbolID !== RASymbolID.GoldWW)){
            this.moveIn();
        }
    }

    /**
     * 播放卡牌消失出現Wild牌背特效
     */
    public async playSymbolFlopFx(): Promise<void>{
        this.node.getComponent(Animation).play('symbolFlopFxMod');
        await this.waitMilliSeconds(100);
        this.wildSpine.setAnimation(0, 'back', false);
    }

    /**
     * 播放 wild 翻牌動畫
     */
    public playWildSFlipSpine(): void {
        if(this.symbolID === RASymbolID.WW){
            this.wildSpine.setAnimation(0, 'flip_green', false);
        }else if(this.symbolID === RASymbolID.GoldWW){
            this.wildSpine.setAnimation(0, 'flip_red', false);
        }
    }

    /**
     * 播放紅wild複製spine動畫
     */
    public playWildReplicateSpine(): void {
        if(this.symbolID === RASymbolID.GoldWW){
            this.wildSpine.setAnimation(0, 'replicate_red', false);
        }
    }

    /**
     * 把 symbol 變成紅色 wild
     */
    public changeSymbolToWild(id: RASymbolID): void {
        let trackEntry : sp.spine.TrackEntry = null!;
        
        (id === RASymbolID.WW) ? 
        (trackEntry = this.wildSpine.setAnimation(0, 'flip_green', false)) : 
        (trackEntry = this.wildSpine.setAnimation(0, 'flip_red', false))

        let animationDuration = trackEntry.animationEnd - trackEntry.animationStart;
        trackEntry.trackTime = Math.max(0, animationDuration - 0.1); // 從最後 0.1 秒開始
    }

    protected update(deltaTime: number): void {

    }

    /**
     * 金色 symbol 落至指定位置後撥放金色玻璃斜面閃光
     */
    private playGoldRay(): void {
        if (this.symbolID < RASymbolID.WW) {
            this.node.getComponent(Animation)!.play('goldSymbolRay');
        }
    }

    /**
     * 等待多少毫秒
     * @param ms 
     * @returns 
     */
    private waitMilliSeconds(ms: number): Promise<void> {
        return new Promise((r) => setTimeout(r, ms));
    }
}

