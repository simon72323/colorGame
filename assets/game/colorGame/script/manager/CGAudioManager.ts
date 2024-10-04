import { _decorator, Component, AudioClip, AudioSource, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CGAudioManager')
export class CGAudioManager extends Component {

    private static _instance: CGAudioManager = null;

    @property({type: AudioSource})
    private bgmSource: AudioSource = null;

    @property({type: AudioSource})
    private sfxSource: AudioSource = null;

    @property({type: [AudioClip]})
    private bgmClips: AudioClip[] = [];

    @property({type: [AudioClip]})
    private sfxClips: AudioClip[] = [];

    private bgmVolume: number = 1;
    private sfxVolume: number = 1;
    private isMuted: boolean = false;

    public static getInstance(): AudioManager {
        return AudioManager._instance;
    }

    onLoad() {
        if (AudioManager._instance === null) {
            AudioManager._instance = this;
        }
        else {
            this.destroy();
            return;
        }
    }

    playBGM(clipIndex: number) {
        if (clipIndex >= 0 && clipIndex < this.bgmClips.length) {
            this.bgmSource.clip = this.bgmClips[clipIndex];
            this.bgmSource.loop = true;
            this.bgmSource.play();
        }
    }

    playSFX(clipIndex: number) {
        if (clipIndex >= 0 && clipIndex < this.sfxClips.length) {
            this.sfxSource.playOneShot(this.sfxClips[clipIndex]);
        }
    }

    setBGMVolume(volume: number) {
        this.bgmVolume = volume;
        if (!this.isMuted) {
            this.bgmSource.volume = volume;
        }
    }

    setSFXVolume(volume: number) {
        this.sfxVolume = volume;
        if (!this.isMuted) {
            this.sfxSource.volume = volume;
        }
    }

    mute() {
        this.isMuted = true;
        this.bgmSource.volume = 0;
        this.sfxSource.volume = 0;
    }

    unmute() {
        this.isMuted = false;
        this.bgmSource.volume = this.bgmVolume;
        this.sfxSource.volume = this.sfxVolume;
    }

    stopBGM() {
        this.bgmSource.stop();
    }

    pauseBGM() {
        this.bgmSource.pause();
    }

    resumeBGM() {
        this.bgmSource.play();
    }
}