import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import { Dict, URLParameter } from '../../assets/game/mahjong/script/include';
import { Marquee } from '../../assets/common/script/components/Marquee';
import { Mask, SpriteFrame, UITransform } from 'cc';
import { LanguageManager } from '../../assets/game/mahjong/script/LanguageManager';
import { LanguageFiles } from '../../assets/game/mahjong/script/LanguageFiles';
import { AudioManager } from '../../assets/game/mahjong/script/components/AudioManager';
describe('Testing Implemennting Localization', () => {

    test('LanaguageManager.ts', () => {
        let singleton = LanguageManager.getInstance();
        let languageManager: LanguageManager = new LanguageManager();
        expect(singleton).not.toBe(languageManager);
        expect(languageManager.node).not.toBeFalsy();

        let group: string[] = ['tw', 'cn', 'vi', 'en'];
        group.forEach((lang) => {
                    //@ts-ignore
        URLParameter.url = new URL(`http://localhost.com?lang=${lang}`);
        languageManager.setLang();
        //@ts-ignore
        expect(languageManager.bundleName).toBe(lang);
        expect(languageManager.lang).toBe(lang);
        });

        languageManager.loadDirectory(LanguageFiles);
        //@ts-ignore
        expect(languageManager.directory).toBe(LanguageFiles);

        expect(languageManager.hasSource(LanguageFiles.FreeSpins)).toBeFalsy();
        let spriteframe = jest.fn() as any;
        let bool: boolean = languageManager.addSource(LanguageFiles.FreeSpins, spriteframe);
        expect(bool).toBeTruthy();
        bool = languageManager.addSource(LanguageFiles.FreeSpins, jest.fn() as any);
        expect(bool).toBeFalsy();
        expect(languageManager.hasSource(LanguageFiles.FreeSpins)).toBeTruthy();
        //@ts-ignore
        expect(languageManager.getSource(LanguageFiles.FreeSpins)).toBeTruthy();
        let sprite = {} as any;
        languageManager.setSpriteFrame(sprite, LanguageFiles.FreeSpins);
        expect(sprite.spriteFrame).toBe(spriteframe);

        languageManager.release();
        // @ts-ignore
        expect(LanguageManager.singleton).not.toBeNull();
        singleton.release();
        // @ts-ignore
        expect(LanguageManager.singleton).toBeFalsy();
    });

});