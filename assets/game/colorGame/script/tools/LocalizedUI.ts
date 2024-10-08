import { _decorator, Component, Asset, Sprite, Button, SpriteFrame, assetManager, error, SpriteAtlas, AssetManager, UIOpacity, log } from 'cc';
const { ccclass, menu, property } = _decorator;

@ccclass('LocalizedUI')
@menu('i18n/LocalizedUI')
export default class LocalizedUI extends Component {

    public static language: string = '';

    @property({ tooltip: 'ProjectName/spritePath' })
    private spritePath: string = '';

    @property
    // private isSpriteOnly: boolean = false;

    private resource: Asset = null!;
    private isDestroy: boolean = false;
    private haveUpdated: boolean = false;
    private defOpacity: number = 255;

    // public onLoad(): void {
    //     const opacity = this.node.getComponent(UIOpacity);
    //     this.defOpacity = opacity ? opacity.opacity : this.defOpacity;

    //     if (!this.haveUpdated && opacity) {
    //         opacity.opacity = 0;
    //     }
    //     this.fetchRender();
    // }

    public start(): void {
        this.fetchRender();
    }

    public onEnable(): void {
        const opacity = this.node.getComponent(UIOpacity);
        if (!this.haveUpdated && opacity) {
            opacity.opacity = 0;
        }
    }

    public onDestroy(): void {
        this.isDestroy = true;
    }

    public decRef(): void {
        if (this.resource) {
            this.resource.decRef();
            this.resource = null!;
        }
    }

    public updateUI(): void {
        this.fetchRender();
    }

    private fetchRender(): void {
        const lang = 'CGLang_' + LocalizedUI.language;
        const spriteName = this.node.getComponent(Sprite).spriteFrame.name;
        console.log("語系", lang);
        if (LocalizedUI.language === '') {
            error(`LocalizedUI language not initialized`);
            return;
        }
        // const sprite = this.getComponent(Sprite)!;
        // const button = this.getComponent(Button);
        // const spriteFrame = sprite ? sprite.spriteFrame : (button ? button.normalSprite : undefined);
        assetManager.loadBundle(lang, (err, boundle) => {
            if (err) return;
            boundle.load(spriteName + '/spriteFrame', SpriteFrame, (err, spriteFrame) => {
                if (err) return;
                console.log(spriteFrame);
                this.node.getComponent(Sprite).spriteFrame = spriteFrame;
                // return resolve(spriteFrame);
            });
            // resolve(boundle);
        });
        const bundleName = this.spritePath.split('/')[0];
        const bundle = assetManager.getBundle(bundleName);

        if (!bundle) {
            error(`No bundle loaded : ${bundleName}, ${this.name}, ${this.node.parent?.name}`);
            return;
        }

        // if (this.isSpriteOnly) {
        //     this.checkSpriteWithoutAtlas(bundle);
        // } else if (this.spritePath !== '') {
        //     this.checkSpriteWithAtlas(bundle);
        // }
        if (this.spritePath !== '') {
            this.checkSpriteWithAtlas(bundle);
        }
    }

    // private checkSpriteWithoutAtlas(bundle: AssetManager.Bundle): void {
    //     const sprite = this.getComponent(Sprite);
    //     if (sprite) {
    //         const bundleName = this.spritePath.split('/')[0];
    //         const path = this.useCurrentLangKey(this.spritePath.replace(bundleName, ''));
    //         this.updateSpriteOnly(bundle, sprite, `${path}/spriteFrame`);
    //     }
    // }

    private checkSpriteWithAtlas(bundle: AssetManager.Bundle): void {
        const sprite = this.getComponent(Sprite);
        const button = this.getComponent(Button);
        const newSpritePath = this.useCurrentLangKey(this.spritePath);

        if (sprite) {
            this.updateSprite(bundle, sprite, newSpritePath);
        }
        if (button) {
            this.updateButton(bundle, button, newSpritePath);
        }
    }

    private updateSpriteOnly(bundle: AssetManager.Bundle, sprite: Sprite, newSpritePath: string): void {
        const path = newSpritePath.slice(newSpritePath.indexOf('/'));

        bundle.load(path, SpriteFrame, (err, spriteFrame: SpriteFrame) => {
            if (this.isDestroy) {
                return;
            }
            if (err) {
                error(`${err} in ${this.name} ${newSpritePath}`);
            } else {
                this.resource = spriteFrame;
                this.resource.addRef();
                sprite.spriteFrame = spriteFrame;
                this.setDefOpacity();
            }
        });
    }

    private updateSprite(bundle: AssetManager.Bundle, sprite: Sprite, newSpritePath: string): void {
        const path = newSpritePath.slice(newSpritePath.indexOf('/'));

        bundle.load(path, SpriteAtlas, (err, atlas: SpriteAtlas) => {
            if (this.isDestroy) {
                return;
            }
            if (err) {
                log(bundle.name);
                log(`${this.name}, ${this.node.parent?.name}`);
                error(`${err} in ${this.name} ${newSpritePath}`);
            } else {
                if (this.node === null) {
                    error(this);
                }
                this.resource = atlas;
                this.resource.addRef();
                sprite.spriteFrame = atlas.getSpriteFrame(sprite.spriteFrame!.name);
                this.setDefOpacity();
            }
        });
    }

    private updateButton(bundle: AssetManager.Bundle, button: Button, newSpritePath: string): void {
        const path = newSpritePath.substr(newSpritePath.indexOf('/'));

        bundle.load(path, SpriteAtlas, (err, atlas: SpriteAtlas) => {
            if (this.isDestroy) {
                return;
            }
            if (err) {
                error(`${err} in ${this.name} ${newSpritePath}`);
            } else {
                this.resource = atlas;
                this.resource.addRef();

                button.normalSprite = atlas.getSpriteFrame(button.normalSprite!.name);
                button.hoverSprite = atlas.getSpriteFrame(button.hoverSprite!.name);
                button.pressedSprite = atlas.getSpriteFrame(button.pressedSprite!.name);
                button.disabledSprite = atlas.getSpriteFrame(button.disabledSprite!.name);
                this.setDefOpacity();
            }
        });
    }

    private useCurrentLangKey(path: string): string {
        const langKey = this.getLangKey(path);
        // if (this.isSpriteOnly) {
        //     return path.replace(langKey, `${LocalizedUI.language}`);
        // } else {
        return path.replace(langKey, `_${LocalizedUI.language}`);
        // }
    }

    private getLangKey(path: string): string {
        if (path.indexOf('_tw') > -1) {
            return '_tw';
        } else if (path.indexOf('_cn') > -1) {
            return '_cn';
        } else if (path.indexOf('_en') > -1) {
            return '_en';
        } else if (path.indexOf('_vi') > -1) {
            return '_vi';
        } else if (path.indexOf('_th') > -1) {
            return '_th';
        } else if (path.indexOf('tw') > -1) {
            return 'tw';
        } else if (path.indexOf('cn') > -1) {
            return 'cn';
        } else if (path.indexOf('en') > -1) {
            return 'en';
        } else if (path.indexOf('us') > -1) {
            return 'en';
        } else if (path.indexOf('vi') > -1) {
            return 'vi';
        } else if (path.indexOf('th') > -1) {
            return 'th';
        }
        return '';
    }

    private setDefOpacity(): void {
        const opacity = this.node.getComponent(UIOpacity);
        this.haveUpdated = true;
        if (opacity) {
            opacity.opacity = this.defOpacity;
        }
    }

    private waitMilliSeconds(ms: number): Promise<void> {
        return new Promise((r) => setTimeout(r, ms));
    }
}
