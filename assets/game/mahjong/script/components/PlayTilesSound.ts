import { _decorator, Animation, AnimationClip, Component, Node } from 'cc';
import { SoundFiles } from "../../../colorGame/script/components/SoundFiles";
import { AudioManager } from "../../../colorGame/script/components/AudioManager";
const { ccclass, property } = _decorator;

@ccclass('PlayTilesSound')
export class PlayTilesSound extends Component {

    private _titleSoundName: Array<string> = [
        SoundFiles.WinHandsHeavenlyHand, 
        SoundFiles.WinHandsAllHonors, 
        SoundFiles.WinHandsBigFourWinds,
        SoundFiles.WinHandsEarthlyHand, 
        SoundFiles.WinHandsAllOfOneSuit, 
        SoundFiles.WinHandsBigThreeDragons, 
        SoundFiles.WinHandsAllEightFlowers, 
        SoundFiles.WinHandsMixedOneSuit, 
        SoundFiles.WinHandsAllPongs, 
        SoundFiles.WinHandsFlowerKong]; // title Sound 名稱

    private currentType: number;
    private huType: Array<number>;

    public playAnimation(name: string, huType: Array<number>) {
        this.currentType = -1;
        this.huType = huType;

        const animation: Animation = this.node.getComponent(Animation);
        animation.play(name);
        
        this.schedule(this.run);
    }

    protected run() {
        let len: number = this.huType.length;
        for (let i: number = 0; i < len; i++) {
            if (this.currentType != this.huType[i] && this.node.children[i].active && this.node.children[i].position.x > -10) { 
                this.currentType = this.huType[i];
                AudioManager.getInstance().play(this._titleSoundName[this.currentType - 1]);
                break;
            }
        }
    }

    public stop() {
        this.unschedule(this.run);
    }
}

