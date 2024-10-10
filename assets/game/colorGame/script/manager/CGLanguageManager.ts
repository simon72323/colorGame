import { _decorator, SpriteFrame, assetManager, error, AssetManager, AudioClip, JsonAsset, director, Asset, Constructor } from 'cc';
import { LocalizedLabel } from './LocalizedLabel';
import { LocalizedSprite } from './LocalizedSprite';
import { LocalizedAudioSource } from './LocalizedAudioSource';
const { ccclass } = _decorator;

//紀錄按鈕四態語系貼圖名稱
// const buttonSpriteName = [
//     // ['tx_info_1', 'tx_info_2', 'tx_info_3', 'tx_info_4',]
// ];

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
export default class CGLanguageManager {
    /**
     * 設置sprite
     * @returns 
     */
    public static setLanguage(h5Lang: string): void {
        for (const { key, lang } of languages) {
            if (h5Lang.indexOf(key) > -1) {
                const bundleName = 'ColorGame_' + lang;
                assetManager.loadBundle(bundleName, async (err, bundle) => {
                    if (err) {
                        error(`No bundle loaded : ${bundleName}`);
                        return;
                    }
                    try {
                        await this.updateLocalizedComponents(bundle, lang);
                    } catch (error) {
                        console.error('set ui error:', error);
                    }
                });
            }
        }
    }

    /**
     * 設置所有掛在多語系組件腳本的節點內容
     * @param bundle 
     * @param lang 
     * @returns 
     */
    private static async updateLocalizedComponents(bundle: AssetManager.Bundle, lang: string) {
        const scene = director.getScene();
        if (!scene) return;

        const components = [
            ...scene.getComponentsInChildren(LocalizedSprite),
            ...scene.getComponentsInChildren(LocalizedLabel),
            ...scene.getComponentsInChildren(LocalizedAudioSource)
        ];

        await Promise.all(components.map(async (component) => {
            if (component instanceof LocalizedSprite) {
                const spriteName = `${component.spriteName}/spriteFrame`;
                const spriteFrame = await this.getAsset(bundle, spriteName, SpriteFrame);
                component.updateSprite(spriteFrame);
            } else if (component instanceof LocalizedLabel) {
                const languageData = (await this.getAsset(bundle, lang, JsonAsset)).json;
                component.updateLabel(languageData);
            } else if (component instanceof LocalizedAudioSource) {
                const audioName = component.audioName;
                const audioClip = await this.getAsset(bundle, audioName, AudioClip);
                component.updateAudio(audioClip);
            }
        }));
    }

    // /**
    //  * 設置Button貼圖
    //  * @param bundle 
    //  */
    // private async setButtons(bundle: AssetManager.Bundle) {
    //     for (let i = 0; i < this.buttonUIs.length; i++) {
    //         const spriteNames = [
    //             { name: buttonSpriteName[i][0], property: 'normalSprite' },
    //             { name: buttonSpriteName[i][1], property: 'hoverSprite' },
    //             { name: buttonSpriteName[i][2], property: 'pressedSprite' },
    //             { name: buttonSpriteName[i][3], property: 'disabledSprite' },
    //         ];
    //         for (const { name, property } of spriteNames) {
    //             if (name !== '') {
    //                 const spriteName = name + '/spriteFrame';
    //                 this.buttonUIs[i][property] = await this.getSpriteFrame(bundle, spriteName);
    //             }
    //         }
    //     }
    // }

    private static getAsset<T extends Asset>(bundle: AssetManager.Bundle, name: string, type: Constructor<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            bundle.load(name, type, (err, asset: T) => {
                if (err) {
                    reject(new Error(`Failed to load ${name}: ${err}`));
                } else {
                    resolve(asset);
                }
            });
        });
    }
}