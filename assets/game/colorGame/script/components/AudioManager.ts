import { _decorator, AudioSource, AudioClip, Component, Node, assetManager, AssetManager, logID, Tween, director, game, Game } from 'cc';
import { BaseSoundFilesDirectory, SoundFiles, SoundFilesDirectory } from './SoundFiles';
// import { log } from '../include';
export interface IAudioManager {
    // 建立物件
    initAudioSource(): void;
    // 讀取定義設定檔案
    // loadDirectory(directory: BaseSoundFilesDirectory);
    // 讀取boundle
    loadBundleFile(filePath: string);
    // 播放背景音樂
    playMusic(soundId: string);
    // 暫停背景音樂
    pauseMusic(soundId: string);
    // 停止背景音樂
    stopMusic();
    // 重複播放
    playOneShot(soundId: string);
    // 播放指定檔案
    play(soundId: string, loop: boolean);
    // 停止指定檔案
    stop(soundId: string);
    // 背景音樂跟音效切換
    playEffect(options:{ soundId: string, duration: number, loop: boolean });
    // 關閉切回
    stopEffect(duration: number);
    // Promise: play
    pplay(soundId: string): Promise<void>;
    // 清除所有執行狀態音效
    clear();
    // 移除
    release();
}

export class AudioManager implements IAudioManager {
    
    private static singleton: AudioManager = null;

    private _isSingleton: boolean = false;

    get isSingleton(): boolean { return this._isSingleton; };

    protected bundleName: string = "audio";

    protected bundle: AssetManager.Bundle = null;

    protected responder: Map<AudioSource, any> = new Map();

    protected _node: Node;

    get node(): Node { return this._node };

    public music: AudioSource = null;

    public sound: AudioSource = null;

    public isMuted: boolean = false;

    protected isMutedBeforeHiding: boolean = false;
    
    protected audioQueue: AudioSource[] = [];
    
    public sourcesList: AudioClip[] = new Array<AudioClip>();

    private sourcesMap: Map<string, AudioClip> = new Map();
    // 記錄檔案名稱
    protected directory: SoundFilesDirectory;

    constructor() {
        this.init();
    }

    // 初始化
    protected async init(): Promise<void> {
        console.log("初始化")
        const node: Node = new Node("AudioManager");
        this._node = node;
        director.addPersistRootNode(node);
        this.initAudioSource();
        this.directory = SoundFiles;// 讀取定義設定檔案
        // this.loadDirectory(SoundFiles);

        game.on(Game.EVENT_HIDE, ()=>{
            this.isMutedBeforeHiding = this.isMuted;
            this.muted(true);
        }, this);

        game.on(Game.EVENT_SHOW, ()=>{
            this.muted(this.isMutedBeforeHiding);
        }, this);

        await this.loadBundleFile(this.bundleName);
        this._node.on(AudioSource.EventType.STARTED, (audioSource: AudioSource) => {
            this.onSoundEventStarted(audioSource);
        });
        this._node.on(AudioSource.EventType.ENDED, (audioSource: AudioSource) => {
            this.onSoundEventEnded(audioSource);
        });
        this._node.emit("completed");
    }
    protected onSoundEventStarted(audioSource: AudioSource): void {
        // log(`STARTED`, audioSource);
    }
    protected onSoundEventEnded(audioSource: AudioSource): void {
        // log(`ENDED`, audioSource.enabled);
        audioSource.clip = null;
        if (this.responder.has(audioSource)) {
            this.responder.get(audioSource)();
            this.responder.delete(audioSource);
        }
    }
    // 建立音效播放物件
    public initAudioSource(): void {
        let group: AudioSource[] = this._node.getComponents(AudioSource);
        group.forEach((audioSource: AudioSource, index) => {
            if (index === 0) this.music = audioSource;
            if (index === 1) this.sound = audioSource;
        });
        if (!this.music) {
            this.music = new AudioSource();
        }
        if (!this.sound) {
            this.sound = new AudioSource();
        }
    }
    // Promise:讀取Boundle設定檔案
    protected loadBundle(name: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, boundle) => {
                if (err) return reject(err);
                resolve(boundle);
            });
        });
    }
    // Promise:讀聲音檔案
    protected loadFile(filePath: string): Promise<AudioClip> {
        const { bundle } = this;
        return new Promise((resolve, reject) => {
            bundle.load(filePath, AudioClip, (err, clip) => {
                if (err) return reject(err);
                return resolve(clip);
            });
        });
    }
    // Promise:讀取檔案
    public async loadBundleFile(boundleName: string) {
        // log(`Loading AudioManager bundle`);
        let bundle = await this.loadBundle(boundleName).catch((err) => null);
        if (!bundle) return console.error(`AudioManager Bundle not found: ${boundleName}`);

        this.bundle = bundle;

        let keys = Object.keys(this.directory);
        for (let i: number = 0; i < keys.length; i++) {
            const key: string = keys[i];
            const filePath = this.directory[key];
            let clip = await this.loadFile(filePath);
            if (clip) this.addSource(filePath, clip);
        }
        // log(`Audio load completed.`);
        
    }
    // 讀取定義設定檔案
    // public loadDirectory(directory: SoundFilesDirectory) {
    //     this.directory = directory;
    // }
    // 播放音樂
    playMusic<T extends keyof SoundFilesDirectory & string>(sound: T, loop: boolean = true): void {
        const { music } = this;
        music.clip = this.getSource(sound)
        music.loop = loop;
        music.play();
    }
    // 停止音樂
    stopMusic(): void {
        const { music } = this;
        music.stop();
        music.loop = false;
        music.clip = null;
    }
    // 暫停音效
    pauseMusic() {
        const { music } = this;
        music.pause();
    }
    createAudioSource(name?: string) {
        let audio = this._node.addComponent(AudioSource);
        if (name) {
            audio.clip = this.getSource(name);
        }
        return audio;
    }
    addSource<T extends keyof SoundFilesDirectory & string>(name: T, clip: AudioClip):boolean {
        const { sourcesList, sourcesMap } = this;
        if (!sourcesMap.has(name)) {
            sourcesList.push(clip);
            sourcesMap.set(name, clip);
            return true;
        }
        return false;
    }
    hasSource(name: string): boolean {
        const { sourcesMap } = this;
        return sourcesMap.has(name);
    }
    getSource<T extends keyof SoundFilesDirectory & string>(name: T):AudioClip {
        return this.sourcesMap.get(name);
    }
    // 背景音樂跟音效切換
    playEffect<T extends keyof SoundFilesDirectory & string>(options:{ soundId: T, duration: number, loop: boolean }) {
        new Tween(this.music).to(options.duration, { volume: 0 }, { easing:'fade', onUpdate:(tar:any, ratio:number)=>{
            let weight: number = this.isMuted? 0:1;
            tar.volume = tar.volume * weight;
        } }).start();
        this.sound.clip = this.getSource(options.soundId);
        this.sound.play();
        this.sound.volume = 0;
        this.sound.loop = options.loop;
        new Tween(this.sound).to(options.duration, { volume: 1 }, { easing:'fade', onUpdate:(tar:any, ratio:number)=>{
            let weight: number = this.isMuted? 0:1;
            tar.volume = tar.volume * weight;
        } }).start();
    }
    // 關閉切回
    stopEffect<T extends keyof SoundFilesDirectory & string>(duration: number = 1) {
        new Tween(this.music).to(duration, { volume: 1 }, { easing:'fade', onUpdate:(tar:any, ratio:number)=>{
            let weight: number = this.isMuted? 0:1;
            tar.volume = tar.volume * weight;
        } }).start();
        new Tween(this.sound).to(duration, { volume: 0 }, { easing:'fade', onUpdate:(tar:any, ratio:number)=>{
            let weight: number = this.isMuted? 0:1;
            tar.volume = tar.volume * weight;
        } }).call(() => {
            this.sound.loop = false;
            this.sound.stop();
            this.sound.clip = null;
        }).start();
    }
    // 重複播放物件？效能低下
    playOneShot<T extends keyof SoundFilesDirectory & string>(soundId: T) {
        const { sound, isMuted } = this;
        if (!isMuted)
            sound.playOneShot(this.getSource(soundId), 1);
    }
    // 播放
    play<T extends keyof SoundFilesDirectory & string>(soundId: T, loop: boolean = false):AudioSource {
        const { audioQueue, isMuted } = this;
        let sound: AudioSource;
        let i: number = 0;

        if (isMuted) return null;
        // 超過最大值
        if (audioQueue.length >= AudioSource.maxAudioChannel) return null;

        for (i; i < audioQueue.length; i++) {
            let as = audioQueue[i];
            if (!as.playing && !as.clip) {
                sound = audioQueue[i];
                break;
            }
        }
        
        if (!sound) {
            sound = this.createAudioSource();
            audioQueue.push(sound);
        }
        sound.clip = this.getSource(soundId);
        sound.loop = loop;
        sound.play();
        // log(`play ${soundId} audioQueue:${audioQueue.length}`);
        
        return sound;
    }
    // 停止播放
    stop(soundId: string) {
        const { audioQueue } = this;
        let clip: AudioClip = this.getSource(soundId);
        let sound: AudioSource;

        for (let i = 0; i < audioQueue.length; i++) {
            sound = audioQueue[i];
            if (sound.clip === clip) {
                sound.stop();
                sound.loop = false;
                sound.clip = null;
            }
        }
    }
    async pplay(soundId: string): Promise<void> {
        return new Promise((resolve) => {
            let audio = this.play(soundId);
            (!audio) ? resolve() : this.responder.set(audio, resolve);
        });
    }
    public muted(bool:boolean) {
        this.music.volume = (!bool && !this.sound.clip) ? 1 : 0;
        this.sound.volume = (!bool && this.sound.clip) ? 1 : 0;
        this.isMuted = bool;

        const { audioQueue } = this;
        let sound: AudioSource;
        let i: number = 0;
        for (i; i < audioQueue.length; i++) {
            sound = audioQueue[i];
            sound.volume = bool ? 0 : 1;
        }
    }
    // 全部停止
    public clear() {
        const { audioQueue, responder } = this;
        let sound: AudioSource;
        let i: number = 0;
        for (i; i < audioQueue.length; i++) {
            sound = audioQueue[i];
            if (!sound) continue;
            if (sound.playing) {
                sound.stop();
            }
            sound.clip = null;
            sound.loop = false;
        }
        this.stopMusic();
        this.sound.loop = false;
        this.sound.stop();
        this.sound.clip = null;
    }
    async release() {
        if (this.isSingleton) {
            AudioManager.singleton = null;
        }
        this.clear();
        this.audioQueue = [];
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.singleton) {
            AudioManager.singleton = new AudioManager();
            AudioManager.singleton._isSingleton = true;
        } 
        return AudioManager.singleton;
    }
}

