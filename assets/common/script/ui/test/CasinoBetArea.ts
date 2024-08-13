import { _decorator, Component, CCInteger, Button, Label, CCBoolean, Animation, CCString } from 'cc';

// import { Util } from '../../../../../core/script/util/Util';

const { ccclass, property } = _decorator;


@ccclass('CasinoBetArea')
export default class CasinoBetArea extends Component {
    @property(CCInteger)
    public useKForBet: number = 1000;
    @property([Button])
    public areas: Button[] = [];
    @property([Label])
    public playerBet: Label[] = [];
    @property([Label])
    public totalBet: Label[] = [];
    @property(CCString)
    public betLightAnimationName: string = 'HunderdBetLight';
    @property(CCString)
    public betLightLoopAnimationName: string = 'HunderdBetLightLoop';
    public totalBetAmount: number = 0;
    public onBetAreaPressedCallback: (param: string) => void = null!;
    public onBetAreaPressFailedCallback: (param: string) => void = null!;
    @property(CCBoolean)
    private hideZero: boolean = false;
    private lightAnim: Animation[] = [];
    public onLoad(): void {
        this.reset();
        this.node.on('OnPolygonButtonPressed', this.onBetAreaPressed, this);
        this.node.on('OnPolygonButtonPressFailed', this.onBetAreaPressFailed, this);

        for (const area of this.areas) {
            const anim = area.getComponentInChildren(Animation);
            if (anim) {
                this.lightAnim.push(anim);
            }
        }
    }
    public reset(): void {
        this.clearPlayerBet();
        this.clearTotalBet();
    }
    public clearPlayerBet(): void {
        for (const playerBet of this.playerBet) {
            if (playerBet.string !== '--') {
                playerBet.string = '0';
            }

            playerBet.node.parent!.active = !(playerBet.string === '0' && this.hideZero);
        }
    }
    public clearTotalBet(): void {
        for (const totalBet of this.totalBet) {
            if (totalBet.string !== '--') {
                totalBet.string = '0';
            }

            totalBet.node.parent!.active = !(totalBet.string === '0' && this.hideZero);
        }
    }
    public lightBetArea(indexList: number[]): void {
        for (const index of indexList) {
            this.lightAnim[index].node.active = true;
            this.lightAnim[index].play(this.betLightAnimationName);
        }
    }
    public lightBetAreaLoop(index: number): void {
        this.lightAnim[index].node.active = true;
        this.lightAnim[index].play(this.betLightLoopAnimationName);
    }
    public stoplightBetArea(): void {
        for (const anim of this.lightAnim) {
            anim.stop();
            anim.node.active = false;
        }
    }
    public lightAllBetArea(): void {
        if (this.betLightAnimationName !== '') {
            for (const anim of this.lightAnim) {
                anim.node.active = true;
                anim.play(this.betLightAnimationName);
            }
        }
    }
    public setBetAreaActive(val: boolean): void {
        for (const area of this.areas) {
            area.interactable = val;
        }
    }
    public setPlayerBets(bets: number[]): void {
        for (let i = 0; i < bets.length; i++) {
            const label = this.playerBet[i];

            if (label.string !== '--') {
                // label.string = bets[i] >= this.useKForBet ? Util.toNFormatter(bets[i]) : bets[i].toString();
            }

            label.node.parent!.active = !(label.string === '0' && this.hideZero);
        }
    }
    public setTotalBet(totalBets: number[]): void {
        if (totalBets.length === 0) {
            return;
        }

        this.totalBetAmount = 0;

        for (let i = 0; i < this.totalBet.length; i++) {
            this.totalBetAmount += totalBets[i];

            const label = this.totalBet[i];

            if (label.string !== '--') {
                // label.string = totalBets[i] >= this.useKForBet ? Util.toNFormatter(totalBets[i]) : totalBets[i].toString();
            }

            label.node.parent!.active = !(label.string === '0' && this.hideZero);
        }
    }
    public enableBetLabel(areas: number[]): void {
        for (const area of areas) {
            this.playerBet[area].string = '0';
            this.totalBet[area].string = '0';
        }
    }
    public disableBetLabel(areas: number[]): void {
        for (const area of areas) {
            this.playerBet[area].string = '--';
            this.totalBet[area].string = '--';
        }
    }
    private onBetAreaPressed(param: string): void {
        console.log("按下")
        if (this.onBetAreaPressedCallback) {
            console.log("按下back")
            this.onBetAreaPressedCallback(param);
        }
    }
    private onBetAreaPressFailed(param: string): void {
        console.log("按下錯誤")
        if (this.onBetAreaPressFailedCallback) {
            console.log("按下錯誤back")
            this.onBetAreaPressFailedCallback(param);
        }
    }
}