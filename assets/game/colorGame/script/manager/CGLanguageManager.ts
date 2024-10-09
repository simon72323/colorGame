import { _decorator, Component, SpriteFrame, assetManager, error, AssetManager, log, Sprite, Button, AudioSource, AudioClip, JsonAsset } from 'cc';
const { ccclass, property } = _decorator;

//紀錄按鈕四態語系貼圖名稱
const buttonSpriteName = [
    // ['tx_info_1', 'tx_info_2', 'tx_info_3', 'tx_info_4',]
];

const languages = [
    { key: '_tw', lang: '_tw' },
    { key: '_cn', lang: '_cn' },
    { key: '_en', lang: '_en' },
    { key: '_vi', lang: '_vi' },
    { key: '_th', lang: '_th' },
    { key: 'tw', lang: 'tw' },
    { key: 'cn', lang: 'cn' },
    { key: 'en', lang: 'en' },
    { key: 'us', lang: 'en' },
    { key: 'vi', lang: 'vi' },
    { key: 'th', lang: 'th' },
];

@ccclass('CGLanguageManager')
export default class CGLanguageManager extends Component {
    @property([Sprite])
    private spriteUIs: Sprite[] = [];
    @property([AudioSource])
    private audios: AudioSource[] = [];
    @property([Button])
    private buttonUIs: Button[] = [];
    private isDestroy: boolean = false;

    public onDestroy(): void {
        this.isDestroy = true;
    }

    /**
     * 設置sprite
     * @returns 
     */
    public setSprite(h5Lang: string): void {
        // console.log("加載語系貼圖")
        for (const { key, lang } of languages) {
            if (h5Lang.indexOf(key) > -1) {
                const bundleName = 'ColorGame_' + lang;
                assetManager.loadBundle(bundleName, async (err, bundle) => {
                    if (err) {
                        error(`No bundle loaded : ${bundleName}, ${this.name}, ${this.node.parent?.name}`);
                        return;
                    }
                    try {
                        await Promise.all([
                            this.setSpriteUIs(bundle),
                            this.setButtonUIs(bundle),
                            this.setAudios(bundle),
                            this.getLangData(bundle, lang)
                        ]);
                    } catch (error) {
                        console.error('set ui error:', error);
                    }
                });
            }
        }
    }

    /**
     * 設置Sprite貼圖
     * @param bundle 
     */
    private async setSpriteUIs(bundle: AssetManager.Bundle) {
        for (let i = 0; i < this.spriteUIs.length; i++) {
            const sprite = this.spriteUIs[i];
            const spriteName = `${sprite.node.name}/spriteFrame`;
            sprite.spriteFrame = await this.getSpriteFrame(bundle, spriteName);
        }
    }

    /**
     * 設置Button貼圖
     * @param bundle 
     */
    private async setButtonUIs(bundle: AssetManager.Bundle) {
        for (let i = 0; i < this.buttonUIs.length; i++) {
            const spriteNames = [
                { name: buttonSpriteName[i][0], property: 'normalSprite' },
                { name: buttonSpriteName[i][1], property: 'hoverSprite' },
                { name: buttonSpriteName[i][2], property: 'pressedSprite' },
                { name: buttonSpriteName[i][3], property: 'disabledSprite' },
            ];
            for (const { name, property } of spriteNames) {
                if (name !== '') {
                    const spriteName = name + '/spriteFrame';
                    this.buttonUIs[i][property] = await this.getSpriteFrame(bundle, spriteName);
                }
            }
        }
    }

    /**
     * 設置audio音效
     * @param bundle 
     */
    private async setAudios(bundle: AssetManager.Bundle) {
        for (let i = 0; i < this.audios.length; i++) {
            const audioSource = this.audios[i];
            const audioClipName = audioSource.node.name;
            audioSource.clip = await this.getAudioClip(bundle, audioClipName);
        }
    }

    /**
     * 設置語系檔
     * @param bundle 
     * @param setSpriteFrame 
     */
    private getLangData(bundle: AssetManager.Bundle, lang: string): Promise<JsonAsset> {
        return new Promise((resolve, reject) => {
            if (this.isDestroy) {
                reject(new Error("LocalizedUI has been destroyed"));
                return;
            }
            bundle.load(lang, JsonAsset, (err, json: JsonAsset) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!this.node) {
                    reject(new Error("Node is null"));
                    return;
                }
                resolve(json);
            });
        });
    }

    /**
     * 設置語系貼圖
     * @param bundle 
     * @param setSpriteFrame 
     */
    private getSpriteFrame(bundle: AssetManager.Bundle, spriteName: string): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            if (this.isDestroy) {
                reject(new Error("LocalizedUI has been destroyed"));
                return;
            }
            bundle.load(spriteName, SpriteFrame, (err, spriteFrame: SpriteFrame) => {
                if (err) {
                    error(`${err} in ${this.name} ${spriteName}`);
                    reject(err);
                    return;
                }
                if (!this.node) {
                    reject(new Error("Node is null"));
                    return;
                }
                resolve(spriteFrame);
            });
        });
    }

    /**
     * 設置audio
     * @param bundle 
     * @param audioClipName 
     */
    private getAudioClip(bundle: AssetManager.Bundle, audioClipName: string): Promise<AudioClip> {
        return new Promise((resolve, reject) => {
            if (this.isDestroy) {
                reject(new Error("LocalizedUI has been destroyed"));
                return;
            }
            bundle.load(audioClipName, AudioClip, (err, audioClip: AudioClip) => {
                if (err) {
                    error(`${err} in ${this.name} ${audioClipName}`);
                    reject(err);
                    return;
                }
                if (!this.node) {
                    reject(new Error("Node is null"));
                    return;
                }
                resolve(audioClip);
            });
        });
    }
}