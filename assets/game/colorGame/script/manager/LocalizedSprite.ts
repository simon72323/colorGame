import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LocalizedSprite')
export class LocalizedSprite extends Component {
    @property({ tooltip: 'name' })
    public spriteName: string = '';

    updateSprite(spriteFrame: SpriteFrame) {
        if (this.spriteName === '')
            return;
        const sprite = this.getComponent(Sprite);
        if (sprite)
            sprite.spriteFrame = spriteFrame;
    }
}