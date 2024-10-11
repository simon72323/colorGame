import { _decorator, AudioClip, AudioSource, Component } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('LocalizedAudioSource')
@menu('i18n/LocalizedAudioSource')
export class LocalizedAudioSource extends Component {
    @property({ tooltip: 'name' })
    public audioName: string = '';

    updateAudio(audioClip: AudioClip) {
        if (this.audioName === '')
            return;
        const audioSource = this.getComponent(AudioSource);
        if (audioSource)
            audioSource.clip = audioClip;
    }
}