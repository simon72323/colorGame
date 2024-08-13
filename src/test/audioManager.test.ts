import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import { Dict } from '../../assets/game/mahjong/script/include';
import { Marquee } from '../../assets/common/script/components/Marquee';
import { Mask, UITransform, Node, AudioSource, game, Game, AudioClip } from 'cc';
import { AudioManager } from '../../assets/game/mahjong/script/components/AudioManager';
import { SoundFiles } from '../../assets/game/mahjong/script/components/SoundFiles';
import { UtilsKit } from '../../assets/game/mahjong/script/lib/UtilsKit';
describe('auido Manager testing', () => {
    beforeEach(() => {

    });
    afterEach(() => {
        AudioManager.getInstance().release();
    });
    test('should initialize', () => {
        let singleton = AudioManager.getInstance();
        const audio = new AudioManager();
        //@ts-ignore
        audio._node = new Node();
        expect(audio.isSingleton).toBeFalsy();
        //@ts-ignore
        // audio.onLoad(); // SIGNAL
        expect(audio.isSingleton).toBeFalsy();
        expect(AudioManager.getInstance()).not.toStrictEqual(audio);
        let group = [new AudioSource(), new AudioSource()];
        //@ts-ignore
        audio.node.getComponents = () => { return group }
        
        audio.initAudioSource();
        
        expect(audio.music).toStrictEqual(group[0]);
        expect(audio.sound).toStrictEqual(group[1]);
        //@ts-ignore
        audio.directory = null;
        audio.loadDirectory(SoundFiles);
        //@ts-ignore
        expect(SoundFiles).toStrictEqual(audio.directory);

    })
    test('events', () => {
        let singleton = AudioManager.getInstance();
        singleton.loadBundleFile = async (name) => { return Promise.resolve() };
        let onSoundEventStarted = jest.fn();
        let onSoundEventEnded = jest.fn();
        // @ts-ignore
        singleton.onSoundEventStarted = onSoundEventStarted;
        // @ts-ignore
        singleton.onSoundEventEnded = onSoundEventEnded;
        singleton.node.emit(AudioSource.EventType.STARTED);
        singleton.node.emit(AudioSource.EventType.ENDED);
        // expect(onSoundEventStarted).toHaveBeenCalled();
        // expect(onSoundEventEnded).toHaveBeenCalled();
    })
    test('Game.EVENT_HIDE and Game.EVENT_SHOW', () => {
        let singleton = AudioManager.getInstance();
        game.emit(Game.EVENT_HIDE);
        expect(singleton.isMuted).toBeTruthy();
        game.emit(Game.EVENT_SHOW);
        expect(singleton.isMuted).toBeFalsy();
    })
    test('STARTED and ENDED', async () => {
        
        let singleton = AudioManager.getInstance();
        await UtilsKit.Defer(10);
        // @ts-ignore
        singleton.loadFile = () => Promise.resolve(new AudioClip());
        // @ts-ignore
        singleton._node.on("completed", () => console.log('completed'))
        // @ts-ignore
        singleton._node.emit(AudioSource.EventType.STARTED);
        let test = new AudioSource();
        test.clip = new AudioClip();
        let onRemove = jest.fn();
        // @ts-ignore
        singleton.responder.set(test, onRemove);
        // @ts-ignore
        singleton._node.emit(AudioSource.EventType.ENDED, test);
        // @ts-ignore
        singleton.onSoundEventEnded(test);
        // @ts-ignore
        expect(singleton.responder.size).toBe(0);
    });
    test('playMusic', () => {
        let singleton = AudioManager.getInstance();
        let clip = singleton.getSource("music");
        singleton.playMusic("music");

    });
    test('Promise play', async () => {
        let singleton = AudioManager.getInstance();
        let clip = singleton.getSource("py");
        setTimeout(() => {
            // @ts-ignore
            let { responder } = singleton;
            for (let [key, value] of responder.entries()) {
                value();
            }            
        }, 10)
        await singleton.pplay("py");
    })
    test('clear', () => {
        let stop = jest.fn();
        let singleton = AudioManager.getInstance();
        let audio1 = new AudioSource();
        let audio2 = new AudioSource();
        // @ts-ignore
        audio1._playing = true;
        // @ts-ignore
        audio2._playing = true;
        audio1.stop = stop;
        audio2.stop = stop;

        // @ts-ignore
        singleton.audioQueue.push(audio1);
        // @ts-ignore
        singleton.audioQueue.push(audio2);

        singleton.clear();

        // @ts-ignore
        console.log(`singleton.audioQueue`, singleton.audioQueue.length);
        
        expect(stop).toHaveBeenCalledTimes(2);
        stop.mockClear();
        // 停止聲音
        let clip = singleton.getSource("abc");
        audio1.clip = clip;
        singleton.stop('abc');
        expect(stop).toHaveBeenCalledTimes(1);

    });

})