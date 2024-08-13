import { _decorator, Animation, AnimationClip, BlockInputEvents, Button, Component, Label, math, Node, Prefab, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { symbolResource_TA } from '../../../../techArt/game/mahjong/script/symbolResource_TA';
import { PayTypeData } from '../mock/MockData';
import { CalculationCupboard } from './CalculationCupboard';
import { symbolSet_TA } from '../../../../techArt/game/mahjong/script/symbolSet_TA';
import { LanguageFiles } from '../LanguageFiles';
import { LanguageManager } from '../LanguageManager';
import { AudioManager } from './AudioManager';
import { SoundFiles } from './SoundFiles';
import { PlayTilesSound } from './PlayTilesSound';
import { UtilsKit } from '../lib/UtilsKit';
import { PrefabInstancePoolManager } from '../tools/PrefabInstancePoolManager';
import { log } from '../include';
const { ccclass, property } = _decorator;

@ccclass('Result')
export class Result extends Component {

    @property({ type: symbolResource_TA, tooltip: "symbol資源" })
    private symbolResourceTA: symbolResource_TA = null;

    @property({ type: Node, tooltip: "胡牌結算得分顯示" })
    private resultWinScore: Node = null;

    @property({ type: Prefab, tooltip: "本花掃光特效 prefab" })
    private symbolLightPrefab: Prefab = null;

    private skipBtn: Button; // 胡牌結算分數出現時，可以透過點擊畫面快速退出胡牌結算畫面
    private rejectDelayingToEndResultScore: any;
    private resolveShowingResultScore: any;

    private arrLightNode: Array<Node> = [];

    private _myFlowerID: Array<number> = []; // 本花 ID

    set myFlowerID(a: Array<number>) { this._myFlowerID = a }

    // 設置結算得分
    set score(n: number) {
        this.resultWinScore.getChildByName('label').getComponent(Label).string = UtilsKit.NumberSpecification(n);
    }

    get canSkip(): boolean {
        return this.skipBtn.interactable;
    }

    start() {
        this.node.getComponent(UITransform).setContentSize(1080, 1920);

        this.skipBtn = this.node.addComponent(Button);
        this.skipBtn.target = this.node;
        this.skipBtn.interactable = false;
        this.skipBtn.transition = Button.Transition.NONE;

        this.node.addComponent(BlockInputEvents);

        this.node.on(Button.EventType.CLICK, () => { this.endResultScore() });
    }

    public getDefaultSpriteFrame() {
        if (!this.resultWinScore.getChildByName('txWinTotal').getComponent(Sprite).spriteFrame) {

            const allPointsNode: Node = this.node.getChildByName('points').getChildByName('allPoints');
            LanguageManager.getInstance().setSpriteFrame(allPointsNode.getChildByName('tx_all').getComponent(Sprite), LanguageFiles.ResultAll);
            LanguageManager.getInstance().setSpriteFrame(allPointsNode.getChildByName('tx_point').getComponent(Sprite), LanguageFiles.ResultPoint);


            const winPointsNode: Node = this.node.getChildByName('points').getChildByName('winPoints');
            for (let i:number = 0; i <= 7; i++) {
                LanguageManager.getInstance().setSpriteFrame(winPointsNode.getChildByName(`winPoints${i}`).getChildByName('points').getChildByName('tx').getComponent(Sprite), LanguageFiles.ResultPointSmall);
            }

            const titlesNode: Node = this.node.getChildByName('titles');
            for (let i:number = 0; i <= 4; i++) {
                LanguageManager.getInstance().setSpriteFrame(titlesNode.getChildByName(`title${i}`).getComponent(Sprite), LanguageFiles[`ResultTitle${i}`]);
            }

            LanguageManager.getInstance().setSpriteFrame(this.resultWinScore.getChildByName('txWinTotal').getComponent(Sprite), LanguageFiles.ResultWin);
        }
    }

    /**
     * 設置胡牌結算畫面
     * @param huAward 該回合胡牌資料
     * @param calculationCupboard 算牌區域
     */
    public setResult(huAward: PayTypeData, calculationCupboard: CalculationCupboard) {

        this.getDefaultSpriteFrame();

        AudioManager.getInstance().play(SoundFiles.Huwin);

        this.resultWinScore.active = false; // 先隱藏結算總得分

        // 設置牌型標題
        const titlesNode: Node = this.node.getChildByName('titles');
        const animation: Animation = titlesNode.getComponent(Animation);
        let huType: Array<number> = []; // 胡牌牌型(牌型編號10以內的)
        let len: number = huAward.Type.length;
        
        let i:number;
        for (i = 0; i < len; i++) {
            let type: number = huAward.Type[i];
            if (type <= 10) {
                let title: Node = titlesNode.getChildByName(`title${i}`);
                LanguageManager.getInstance().setSpriteFrame(title.getComponent(Sprite), LanguageFiles[`ResultTitle${type - 1}`]);
                title.active = true;
                huType.push(type);
            }

            // 超過美術設定牌型標題動畫數量上限就 break!
            if (huType.length == titlesNode.getComponent(Animation).clips.length) {
                break;
            }
        }

        while (i < titlesNode.getComponent(Animation).clips.length) {
            titlesNode.getChildByName(`title${i}`).active = false;
            i++;
        }

        const animationClip: AnimationClip = animation.clips[huType.length - 1];
        titlesNode.getComponent(PlayTilesSound).playAnimation(animationClip.name, huType);

        let arrSet: Array<number> = Array.from(huAward.WinCard);
        // let arrFlower: Array<number> = [];
        let tilesNode: Node = this.node.getChildByName('tiles');
        let onlyAllEightFlowers: boolean = (huAward.Type.length == 1 && huAward.Type[0] == 7); // 僅中八仙過海

        // 設置碰、槓、眼睛牌
        const winTile: Node = tilesNode.getChildByName('winTile');
        if (onlyAllEightFlowers) { // 僅中“八仙過海”時，僅顯示花牌
            len = winTile.children.length;
            for (let i:number = 0; i < len; i++) {
                const winTileSet: Node = winTile.children[i];
                const winTileSetChildLen: number = winTileSet.children.length;
                for (let j:number = 0; j < winTileSetChildLen; j++) {
                    winTileSet.children[j].active = false; // 隱藏麻將牌
                }
            }
            // arrFlower = arrSet;
        } else { 
            let winTileChildIndex: number = 0;
            arrSet.push(huAward.EyeCard, huAward.EyeCard);
            len = arrSet.length;
            for (let i:number = 0; i < len; i++) {
                const winTileSet: Node = winTile.children[winTileChildIndex];
                const winTileSetChildLen: number = winTileSet.children.length;

                let symID: number = arrSet[i];
                let tileNum: number = 1;
                while (i+1 < len && arrSet[i+1] == symID) {
                    i++;
                    tileNum++;
                }

                if (tileNum >= 2) {
                    for (let j:number = 0; j < winTileSetChildLen; j++) {
                        if (j < tileNum) {
                            const symbolSpriteFrame: SpriteFrame = this.symbolResourceTA.symbolSF[symID - 1];
                            winTileSet.children[j].children[0].getComponent(Sprite).spriteFrame = symbolSpriteFrame;
                            winTileSet.children[j].active = true; // 顯示麻將牌
                        } else {
                            winTileSet.children[j].active = false; // 隱藏麻將牌
                        }
                    }
                    winTileChildIndex++;
                } else {
                    // arrFlower.push(symID);
                }
            }
        }

        // 設置花牌
        let arrFlower:Array<symbolSet_TA> = calculationCupboard.getComponent(CalculationCupboard).getFlowerInfo();
        let flowerTile: Node = tilesNode.getChildByName('flowerTile');
        let flowerLen: number = arrFlower.length;
        let flowerScale: number;

        if (onlyAllEightFlowers) {
            flowerTile.position.set(0, -54);
            flowerScale = 0.34 / 0.28;
        } else {
            flowerTile.position.set(210, 54);
            flowerScale = 1;
        }
        flowerTile.setScale(flowerScale, flowerScale);

        for (let i:number = 0; i < 8; i++) {
            if (i < flowerLen) {
                const flowerSpriteFrame: SpriteFrame = this.symbolResourceTA.symbolSF[arrFlower[i].symID - 1];
                flowerTile.children[i].active = true; // 顯示花牌
                flowerTile.children[i].children[0].getComponent(Sprite).spriteFrame = flowerSpriteFrame;

                let myFlowerLen: number = this._myFlowerID.length;
                for (let k:number = 0; k < myFlowerLen; k++) {
                    if (this._myFlowerID[k] == arrFlower[i].symID) {
                        let symbolLight: Node = PrefabInstancePoolManager.instance.takeOut(this.symbolLightPrefab);
                        symbolLight.parent = flowerTile.children[i];
                        symbolLight.active = true;
                        this.arrLightNode.push(symbolLight);
                        break;
                    }
                }
            } else {
                flowerTile.children[i].active = false; // 隱藏花牌
            }
        }

        // 設置牌型台數
        const pointsNode: Node = this.node.getChildByName('points');
        let typeLen: number = huAward.Type.length;
        for (let i:number = 0; i < 8; i++) {
            const winPoints: Node = pointsNode.getChildByName('winPoints');
            if (i < typeLen) {
                winPoints.children[i].active = true; // 顯示牌型台數
                LanguageManager.getInstance().setSpriteFrame(winPoints.children[i].getChildByName('tx').getComponent(Sprite), LanguageFiles[`Type${huAward.Type[i] - 1}`]); // 設置牌型語系貼圖
                winPoints.children[i].getChildByName('points').children[0].getComponent(Label).string = huAward.TaiNum[i].toString(); // 設置台數
            } else {
                winPoints.children[i].active = false; // 隱藏牌型台數
            }
        }
        pointsNode.getChildByName('allPoints').getChildByName('label').getComponent(Label).string = huAward.TotalTai.toString(); // 設置總台數
    }

    /**
     * 顯示結算得分
     */
    public showResultScore(): Promise<void> {
        return new Promise(async (resolve, reject)=> {
            this.resolveShowingResultScore = resolve;
            //this.rejectDelayingToEndResultScore = reject;

            AudioManager.getInstance().play(SoundFiles.Huwin);

            this.resultWinScore.active = true; // 顯示結算總得分
            this.skipBtn.interactable = true;

            this.delayToEnd().then(()=>{
                this.endResultScore();
            }).catch((reason: any)=>{
                log(reason);
            });
        })
    }

    protected delayToEnd() {
        return new Promise(async (resolve, reject)=>{
            this.rejectDelayingToEndResultScore = reject;
            await UtilsKit.DeferByScheduleOnce(5000); // 等待5秒關閉結算
            resolve(null);
        })
    }

    public endResultScore() {
        if (this.skipBtn.interactable) {

            this.rejectDelayingToEndResultScore("reject delaying to end resulting score");
            this.rejectDelayingToEndResultScore = null;

            this.skipBtn.interactable = false;

            const anim = this.node.getComponent(Animation);
            anim.play(anim.clips[1].name);

            const titlesNode: Node = this.node.getChildByName('titles');
            titlesNode.getComponent(PlayTilesSound).stop();

            //等待動畫播放結束
            this.scheduleOnce(() => {
                this.node.active = false;
                this.resolveShowingResultScore();
                this.resolveShowingResultScore = null;

                while (this.arrLightNode.length > 0) {
                    let symbolLight: Node = this.arrLightNode.pop();
                    symbolLight.active = false;
                    symbolLight.parent.removeChild(symbolLight);
                    PrefabInstancePoolManager.instance.pushIn(symbolLight);
                }
            }, anim.clips[1].duration)
        }
    }
}

