import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import { BigWin } from '../../assets/game/mahjong/script/components/BigWin';
import { Button, Label, Node } from 'cc';
import { Multiple } from '../../assets/game/mahjong/script/components/Multiple';
import { Result } from '../../assets/game/mahjong/script/components/Result';
describe('Ended Game Testing', () => {

    test('bigWin.ts', async () => {
        let bigWin = new BigWin();
        expect(bigWin.bigWinMultiple).toBeTruthy();
        bigWin.start();
        let endBigWinRun = jest.fn();
        //@ts-ignore
        bigWin.endBigWinRun = endBigWinRun;

        bigWin.node.emit(Button.EventType.CLICK);

        expect(endBigWinRun).toHaveBeenCalledTimes(1);
        bigWin.skip();
        expect(endBigWinRun).toHaveBeenCalledTimes(2);
        bigWin.running(1, 21);
        expect(endBigWinRun).toHaveBeenCalledTimes(3);
        
        let id:number = -1;
        //@ts-ignore
        bigWin.playBigWinSpin = (arrayId: number) => { id = arrayId; };
        bigWin.running(1, 10);
        expect(id).toEqual(0);
        id = -1;
        //@ts-ignore
        bigWin.playBigWinSpin = (arrayId: number) => { id = arrayId; };
        bigWin.running(1, 21);
        expect(id).toEqual(1);

        id = -1;
        //@ts-ignore
        bigWin.playBigWinSpin = (arrayId: number) => { id = arrayId; };
        bigWin.running(1, 41);
        expect(id).toEqual(1);

        id = -1;
        //@ts-ignore
        bigWin.playBigWinSpin = (arrayId: number) => { id = arrayId; };
        bigWin.running(1, 71);
        expect(id).toEqual(2);
        
        bigWin = new BigWin();
        bigWin.skip();
        //@ts-ignore
        bigWin._payoff = 21;
        id = -1;
        //@ts-ignore
        bigWin._bet = 1;
        await bigWin.skip();
        //@ts-ignore
        bigWin._payoff = 101;
        //@ts-ignore
        bigWin._bet = 1;
        await bigWin.skip();
    });
    test("Multiple.calculateMultiple", async () => {
        let n = Multiple.calculateMultiple(
            [], 
            [ { symID: 35 }, { symID: 17 }, { symID: 17 }, { symID: 39 } ] as any
        );
        expect(n).toEqual(0);
        n = Multiple.calculateMultiple(
            [ { symID: 26, tileNum: 4 } ] as any[], 
            [ { symID: 36, tileNum: 4 } ] as any
        );
        expect(n).toEqual(0.4);

        n = Multiple.calculateMultiple(
            [ { symID: 15, tileNum: 4 }, { symID: 34, tileNum: 3 }, { symID: 33, tileNum: 4 } ] as any[], 
            [ { symID: 36 }, { symID: 37 }, { symID: 39 }, { symID: 41 }, { symID: 42 }, { symID: 35 }, { symID: 40 } ] as any
        );
        expect(n).toEqual(18);

        
    });
    test("Multiple.updateMultiple", () => {
        expect(Multiple.calculateWinningMultiple(100, 10)).toBe(10)
        expect(Multiple.calculateWinningMultiple(100, 9)).toBe(11.11);
    });
    test("Multiple.updateMultiple", () => {
        let multiple = new Multiple();
        multiple.updateMultiple(1);
        //@ts-ignore
        expect(multiple.currentMultiple).toBe(1);
        
        multiple.updateMultiple(0);
        //@ts-ignore
        expect(multiple.currentMultiple).toBe(0);

    });
    test("Result.ts", async () => {
        let result = new Result();
        //@ts-ignore
        result.scheduleOnce = (cb, time) => { 
            console.log(`scheduleOnce`);
            
            if (cb) cb();
        };
        //@ts-ignore
        result.delayToEnd = () => {
            return new Promise((resolve, reject) => {
                //@ts-ignore
                result.rejectDelayingToEndResultScore = reject;
                resolve(null)
            })
        };
        result.start()
        //@ts-ignore
        result.resultWinScore = new Node();
        //@ts-ignore
        // result.skipBtn = new Button();
        result.myFlowerID = [1,6];
        result.score = 1000;
        //@ts-ignore
        expect(result.canSkip).toBe(result.skipBtn.interactable);

        result.getDefaultSpriteFrame();

        // result.setResult()

        await result.showResultScore();
        


    })


});