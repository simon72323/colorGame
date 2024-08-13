import { _decorator, Animation, assetManager, Component, Label, Node, Sprite, SpriteFrame, Tween, tween } from 'cc';
import { UtilsKit } from '../lib/UtilsKit';
import { URLParameter } from '../include';
import { LanguageManager } from '../LanguageManager';
import { LanguageFiles } from '../LanguageFiles';
import { AudioManager } from './AudioManager';
import { SoundFiles } from './SoundFiles';
const { ccclass, property } = _decorator;

@ccclass('Info')
export class Info extends Component {

    @property({ type: Label, tooltip: "玩家分數" })
    private creditLabel: Label = null;

    @property({ type: Label, tooltip: "玩家下注分數" })
    private betLabel: Label = null;

    @property({ type: Label, tooltip: "玩家累積分數" })
    private accumulatedScoreLabel: Label = null;

    @property({ type: Label, tooltip: "局號" })
    private snLabel: Label = null;

    @property({ type: Label, tooltip: "下注比" })
    private betBaseLabel: Label = null;

    @property({ type: Node, tooltip: "共贏得分數資訊" })
    private winTotalScoreNode: Node = null;

    @property({ type: Label, tooltip: "遊戲編號" })
    private gameId: Label = null;

    @property({ type: Label, tooltip: "玩家編號" })
    private userId: Label = null;

    private accumulatedScore = { runningScore: 0, score: 0 }; // 玩家累積分數

    start(): void {
        this.updateCredit(0);
        this.updateBet(0);
        this.updateAccumulatedScore(0);
        LanguageManager.getInstance().setSpriteFrame(this.winTotalScoreNode.getChildByName('score').getChildByName('tx').getComponent(Sprite), LanguageFiles.WinTotal);
    }

    // 顯示共贏得分數
    async showWinTotalScore(score: number): Promise<void> {
        return new Promise(async (resolve) => {
            AudioManager.getInstance().play(SoundFiles.WinScore);

            this.winTotalScoreNode.getChildByName('score').getChildByName('label').getComponent(Label).string = UtilsKit.NumberSpecification(score); // 共贏分設置
            
            await this.playWinTotalScoreAnimation();

            resolve();
        })
    }

    private playWinTotalScoreAnimation(): Promise<void> {
        return new Promise(async (resolve) => {            
            UtilsKit.PlayAnimation(this.winTotalScoreNode); // 顯示共贏得
            const animationComponent: Animation = this.winTotalScoreNode.getComponent(Animation);
            animationComponent.getState("scoreShow").speed = 2;

            await UtilsKit.DeferByScheduleOnce(700);
            animationComponent.pause();

            resolve();
        })
    }

    endWinTotalScore() {
        const animationComponent: Animation = this.winTotalScoreNode.getComponent(Animation);
        if (animationComponent.getState("scoreShow") && animationComponent.getState("scoreShow").isPaused) {
            animationComponent.resume();
        }
    }

    updateCredit(n: number) {
        this.creditLabel.string = UtilsKit.NumberSpecification(n);
    }

    updateBet(n: number) {
        this.betLabel.string = UtilsKit.FormatNumber(n);
    }

    updateAccumulatedScore(n: number) {
        Tween.stopAllByTarget(this.accumulatedScore);

        this.accumulatedScore.score += n;
        
        tween(this.accumulatedScore).to(0.5, { runningScore: this.accumulatedScore.score }, {
            onUpdate: (tar:any, ratio:number) => {
                this.accumulatedScoreLabel.string = UtilsKit.NumberSpecification(tar.runningScore); // 更新分數
            }
        }).call(() => {
            this.accumulatedScoreLabel.string = UtilsKit.NumberSpecification(this.accumulatedScore.score); // 更新分數
        }).start();
    }

    updateSN(sn: string) {
        this.snLabel.string = sn;
    }

    updateBetBase(betBase: string) {
        this.betBaseLabel.string = betBase;
    }

    updateBottomInfo(gameId: string, userId: string) {
        if (gameId) this.gameId.string = gameId;
        if (userId) this.userId.string = userId;
    }
}

