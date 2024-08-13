import { _decorator, Button, Sprite, CCFloat, EventTouch, Node, Vec3, tween, UITransform, UIOpacity, SpriteFrame, Color, color, Label, Tween } from 'cc';
import { log } from '../../../game/mahjong/script/include';
const { ccclass, property } = _decorator;

@ccclass('ScaleArgument')
export class ScaleArgument {
    @property(Node)
    public target: Node = null;
    @property(CCFloat)
    public zoomScale: number = 0.9;
    @property(CCFloat)
    public duration: number = 0.1;
}

@ccclass('DisableOpacity')
export class DisableOpacity {
    @property(UIOpacity)
    public uiOpacity: UIOpacity = null;
    @property(CCFloat)
    public opacity: number = 150;
}

@ccclass('SyncSpriteTransition')
export class SyncSpriteTransition {
    @property(Node)
    public target: Node = null!;
    @property(SpriteFrame)
    public normalSprite: SpriteFrame = null;
    @property(SpriteFrame)
    public pressedSprite: SpriteFrame = null;
    @property(SpriteFrame)
    public hoverSprite: SpriteFrame = null;
    @property(SpriteFrame)
    public disabledSprite: SpriteFrame = null;
}

@ccclass('SyncLabelTransitionColor')
export class SyncLabelTransitionColor {
    @property(Node)
    public target: Node = null!;
    @property(Color)
    public normalColor: Color = new Color(255, 255, 255, 255);
    @property(Color)
    public pressedColor: Color = new Color(255, 255, 255, 255);
    @property(Color)
    public hoverColor: Color = new Color(255, 255, 255, 255);
    @property(Color)
    public disabledColor: Color = new Color(255, 255, 255, 255);
}

@ccclass('CustomizedButton')
export class CustomizedButton extends Button {
    @property({ type:[SyncSpriteTransition], tooltip: "需要與按鈕狀態同步的 Sprite 物件" })
    public syncSpriteTransition: SyncSpriteTransition[] = [];
    @property({ type:[SyncLabelTransitionColor], tooltip: "需要與按鈕狀態同步的 Label 物件" })
    public syncLabelTransitionColor: SyncLabelTransitionColor[] = [];
    @property({ type:[ScaleArgument], tooltip: "按鈕按下後 Node Scale 需要改變的資訊" })
    public scaleArgument: ScaleArgument[] = [];
    @property({ type:[Sprite], tooltip: "按鈕禁用後 Sprite 物件需要啟用灰階功能" })
    public spriteDisabledGray: Sprite[] = [];
    @property({ type:[DisableOpacity], tooltip: "按鈕禁用後 Opacity 需要改變的資訊" })
    public spriteDisabledOpacity: DisableOpacity[] = [];
    @property({ type:[Node], tooltip: "按鈕 Hover 時需要啟用的按鈕" })
    public hoverNode: Node[] = [];
    @property({ type:[Node], tooltip: "按鈕按下時需要啟用的按鈕" })
    public downNode: Node[] = [];

    private disableAllDownNode: ()=>void;

    private handleScaleArgument(duration?: number, initialScale?: Vec3, destScale?: Vec3)
    {
        for (const data of this.scaleArgument) {
            Tween.stopAllByTarget(data.target);

            if (initialScale) {
                data.target.setScale(new Vec3(initialScale.x, initialScale.y, 1));
            }

            let initialScaleX: number =  data.target.getScale().x;
            let initialScaleY: number =  data.target.getScale().y;
            let destScaleX: number;
            let destScaleY: number;

            if (destScale) {
                destScaleX = destScale.x;
                destScaleY = destScale.y;

                if (destScaleX == initialScaleX && destScaleY == initialScaleY) {
                    continue;
                }
            }

            let tweenDuration: number;
            if (duration) {
                tweenDuration = duration;
            }

            let dummyValue: { value: number } = { value: 0 };
            tween(dummyValue)
                .to(tweenDuration? tweenDuration:data.duration, { value:1 }, {
                onUpdate: (target:  { value: number }, ratio: number) => { 
                    if (!destScaleX) {
                        destScaleX = data.zoomScale;
                        destScaleY = data.zoomScale;
                    }
                    let currentScaleX: number = initialScaleX + target.value * (destScaleX - initialScaleX);
                    let currentScaleY: number = initialScaleY + target.value * (destScaleY - initialScaleY);
                    data.target.setScale(new Vec3(currentScaleX, currentScaleY, 1));
                }, 
                easing: 'sineOut'})
                .start();
            
        }
    }

    protected _onTouchBegan(event?: EventTouch): void {
        super._onTouchBegan(event);

        if (!this._interactable) return;

        if (this.downNode.length > 0) {
            if (!this.disableAllDownNode) {
                this.disableAllDownNode = ()=>{
                    for (const data of this.downNode) {
                        data.active = false;
                    }
                }
            }

            this.unschedule(this.disableAllDownNode);
            for (const data of this.downNode) {
                data.active = true;
            }
            this.scheduleOnce(this.disableAllDownNode, 1);
        }

        this.handleScaleArgument(0.05, new Vec3(1, 1, 1));

        // log("Button Begin");
    }
    protected _onTouchEnded(event?: EventTouch): void {
        super._onTouchEnded(event);

        for (const data of this.hoverNode) {
            data.active = false;
        }

        this.handleScaleArgument(null, null, new Vec3(1, 1, 1));

        // log("Button End");
    }

    protected _onTouchCancel(event?: EventTouch): void {
        super._onTouchCancel(event);

        this.handleScaleArgument(null, null, new Vec3(1, 1, 1));

        // log("Button Cancel");
    }
    protected _onMouseMoveIn(): void {
        super._onMouseMoveIn();

        if (!this._interactable) return;

        for (const data of this.hoverNode) {
            data.active = true;
        }

        // log("Button Move In");
    }

    protected _onMouseMoveOut(): void {
        super._onMouseMoveOut();

        for (const data of this.hoverNode) {
            data.active = false;
        }

        // log("Button Move Out");
    }


    protected _onTouchMove(event?: EventTouch): void {
        super._onTouchMove(event);
        if (!this._interactable) return;
        // mobile phone will not emit _onMouseMoveOut,
        // so we have to do hit test when touch moving
        if (!event)
            return;

        const touch = (event).touch;
        if (!touch)
            return;

        const hit = this.node.getComponent(UITransform)!.hitTest(touch.getLocation());
        if (hit) {
            this.handleScaleArgument(0.05);
            // log("Button Move hit");
        } else {
            this.handleScaleArgument(null, null, new Vec3(1, 1, 1));
            // log("Button Move doesn't hit");
        }
        
        event.propagationStopped = true;
    }

    protected _updateState(): void {
        super._updateState();

        //同步更新sprite圖片四態
        for (const data of this.syncSpriteTransition) {
            data.target.getComponent(Sprite).spriteFrame = data[`${this._getButtonState()}Sprite`];
        }

        //同步更新label顏色四態
        for (const data of this.syncLabelTransitionColor) {
            data.target.getComponent(Label).color = data[`${this._getButtonState()}Color`];
        }

        //禁用時的灰階變化
        for (const data of this.spriteDisabledGray) {
            data.grayscale = !this.interactable;
        }

        //禁用時的透明度變化
        for (const data of this.spriteDisabledOpacity) {
            if (this.interactable) {
                data.uiOpacity.opacity = 255;
            } else {
                data.uiOpacity.opacity = data.opacity;
            }
        }
    }
}