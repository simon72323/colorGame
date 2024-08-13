import { _decorator, Animation, Color, math, Node, Prefab, sp, Sprite, SpriteFrame, UIOpacity, Vec3 } from 'cc';
import { SymbolItem } from './SymbolItem';
import { UtilsKit } from '../lib/UtilsKit';
const { ccclass, property } = _decorator;

@ccclass('MahjongSymbol')
export class MahjongSymbol extends SymbolItem {

    @property({ type: [SpriteFrame], tooltip: "symbol圖" })
    public symbolSpriteFrame: SpriteFrame[] = [];

    @property({ type: [SpriteFrame], tooltip: "symbol模糊圖" })
    public symbolBlurSpriteFrame: SpriteFrame[] = [];

    private symbol: Node;
    private scatter: Node;
    private frame: Node;
    private stayFx: Node;

    changeSymbolID(id: number) {
        if (!this.symbol) {
            this.symbol = this.node.getChildByName("symbol");
            this.stayFx = this.node.getChildByName("stayFx");
            this.scatter = this.node.getChildByName("scatter");
            this.frame = this.node.getChildByName("frame");
            this.stayFx.active = false;
            this.scatter.active = false;
            this.frame.active = false;
            // let len: number = this.node.children.length;
            // for (let i: number = 0; i < len; i++) {
            //     let child: Node = this.node.children[i];
            //     if (child.name == "symbol") {
            //         this.symbol = child;
            //     } else if (child.name == "stayFx") {
            //         this.stayFx = child;
            //         this.stayFx.active = false;
            //     } else if (child.name == "scatter") {
            //         this.scatter = child;
            //         this.scatter.active = false;
            //     } else if (child.name == "frame") {
            //         this.frame = child;
            //         this.frame.active = false;
            //     } else {
            //         child.active = false;
            //     }
            // }
        }
        
        this._symbolID = id;
        this.symbol.getComponent(Sprite).sizeMode = Sprite.SizeMode.RAW;
        this.symbol.getComponent(Sprite).spriteFrame = this.symbolSpriteFrame[this._symbolID];

        if (this._symbolID == 43 - 1) {
            this.scatter.active = true;
            
            // 初始化 scatterSpine 資料
            const scatterSpineNode: Node = this.scatter.getChildByName('scatterSpine');
            scatterSpineNode.setScale(new Vec3(1, 1, 1,));
            scatterSpineNode.getComponent(sp.Skeleton).color = new Color(255, 255, 255, 255);
            this.scatter.getChildByName('scatterHideFx').getComponent(UIOpacity).opacity = 0;
            
            scatterSpineNode.getComponent(sp.Skeleton).setAnimation(0, 'stay', true);
            this.symbol.active = false;
        } else {
            this.scatter.active = false;
            this.symbol.active = true;
        }
    }

    /**
     * 變模糊
     * @param blur 是否變模糊
     */
    gettingBlur(blur: boolean) {
        if (blur && this.symbolBlurSpriteFrame[this._symbolID]) {
            this.symbol.getComponent(Sprite).sizeMode = Sprite.SizeMode.CUSTOM;
            this.symbol.getComponent(Sprite).spriteFrame = this.symbolBlurSpriteFrame[this._symbolID];
        } else {
            this.symbol.getComponent(Sprite).sizeMode = Sprite.SizeMode.RAW;
            this.symbol.getComponent(Sprite).spriteFrame = this.symbolSpriteFrame[this._symbolID];
        }

        if (this._symbolID == 43 - 1 && !blur) {
            this.scatter.active = true;
            this.scatter.getChildByName('scatterSpine').getComponent(sp.Skeleton).setAnimation(0, 'stay', true);
            this.symbol.active = false;
        } else {
            this.scatter.active = false;
            this.symbol.active = true;
        }
    }

    win(winLayer: Node): Promise<void> {
        return new Promise(async (resolve) => {

            let m1: math.Mat4 = this.node.parent.worldMatrix;
            let m2: math.Mat4 = winLayer.worldMatrix.clone().invert();
            let m: math.Mat4 = m2.multiply(m1);
            Vec3.transformMat4(this.node.position, this.node.position, m);

            this.node.parent = winLayer;

            if (this._symbolID === 43 - 1) {
                this.scatter.active = true;

                // if (scatterReady) {
                //     stayFx.active = true;
                //     skeletonComponent.setAnimation(0, 'stay', true); // 播放scatter聽牌動態
                // } else {
                await UtilsKit.SetSkeletonAnimation(this.scatter.getChildByName('scatterSpine'), 0, 'win', false, true); // 播放scatter贏牌動態
                // }

                await UtilsKit.PlayAnimation(this.scatter, null, true); // 播放消除動態
            } else {
                this.frame.active = true;
                UtilsKit.PlayAnimation(this.node);

                const animationComponent: Animation = this.node.getComponent(Animation);
                let duration: number = animationComponent.getState(animationComponent.defaultClip.name).duration;
                await UtilsKit.DeferByScheduleOnce(1000 * 0.5 * duration);
            }
            resolve();
        })
    }

    reset() {
        this.frame.active = false;
    }
}

