import { _decorator, Component, AudioSource, Node, game, Game } from 'cc';
const { ccclass, property } = _decorator;


export const AudioName = {
    //---------音樂----------
    Bgm: 'music/bgm',// MG遊戲背景音
    //---------音效----------
    AddPay: 'sound/addPay',// 加分
    BetWin: 'sound/betWin', // 本地用戶注區勝利
    BigWin: 'sound/bigWin',// 三色大獎
    //BonusWin: 'sound/bonusWin',// bonus中獎
    BtnClose: 'sound/btnClose',// 按鈕(關閉)
    BtnOpen: 'sound/btnOpen',//按鈕(打開)
    ChipBet: 'sound/chipBet',// 籌碼下注
    ChipPayLess: 'sound/chipPayLess',//籌碼賠付(1~2色)
    ChipPayMany: 'sound/chipPayMany',//籌碼賠付(3色)
    ChipSelect: 'sound/chipSelect',//籌碼選擇
    Countdown: 'sound/countdown',//時間倒數
    DiceRotate: 'sound/diceRotate',//骰子轉動
    Error: 'sound/error',//錯誤
    Result: 'sound/result',//結果
    TimeUp: 'sound/timeUp',//時間結束
    TitleStartBet: 'sound/titleStartBet',// 標題-開始下注
    TitleStopBet: 'sound/titleStopBet',// 標題-停止下注
    
};

@ccclass('CGAudioManager')
export class CGAudioManager extends Component {
    private isMuted: boolean = false;

    onLoad() {
        // 添加頁面可見性變化的監聽器
        game.on(Game.EVENT_HIDE, this.onGameHide, this);
        game.on(Game.EVENT_SHOW, this.onGameShow, this);
        // this.node.emit("completed");
    }

    onDestroy() {
        // 移除監聽器
        game.off(Game.EVENT_HIDE, this.onGameHide, this);
        game.off(Game.EVENT_SHOW, this.onGameShow, this);
        this.clear();
    }

    private onGameHide() {
        this.muted(true);//強制靜音
        this.pause();
    }

    private onGameShow() {
        this.muted(this.isMuted);//根據設定判斷是否恢復音效
    }

    //播放循環音效
    public playLoopAudio(path: string) {
        const audioSource = this.node.getChildByPath(path).getComponent(AudioSource);
        audioSource.loop = true;
        audioSource.play();
    }

    //播放單音效
    public playOnceAudio(path: string) {
        const audioSource = this.node.getChildByPath(path).getComponent(AudioSource);
        const audioClip = audioSource.clip;
        audioSource.loop = false;
        audioSource.playOneShot(audioClip);
    }

    //播放單音效
    public playAudio(path: string) {
        const audioSource = this.node.getChildByPath(path).getComponent(AudioSource);
        audioSource.loop = false;
        audioSource.play();
    }

    private pause() {
        for (const key in AudioName) {
            console.log(key)
            const path = AudioName[key] as string;
            if (path.split('/')[0] !== 'music')
                this.node.getChildByPath(path).getComponent(AudioSource).stop();
        }
    }

    // 全部停止
    public clear() {
        console.log("清除音效")
        for (const key in AudioName) {
            this.node.getChildByPath(AudioName[key]).getComponent(AudioSource).stop();
        }
    }

    //靜音
    public muted(bool: boolean) {
        for (const key in AudioName) {
            const audioSource = this.node.getChildByPath(AudioName[key]).getComponent(AudioSource);
            audioSource.volume = bool ? 0 : 1;
        }
    }
}