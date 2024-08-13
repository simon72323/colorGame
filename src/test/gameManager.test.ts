import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import { Label, Mask, UITransform, Node } from 'cc';
import { Info } from '../../assets/game/mahjong/script/components/Info';
import { UtilsKit } from '../../assets/game/mahjong/script/lib/UtilsKit';
describe('GameManager', () => {

    test('info.ts', async () => {
        let info = new Info();
        // @ts-ignore
        let creditLabel = info.creditLabel = new Label();
        // @ts-ignore
        let betLabel = info.betLabel = new Label();
        // @ts-ignore
        let snLabel = info.snLabel = new Label();
        // @ts-ignore
        let gameId = info.gameId = new Label();
        // @ts-ignore
        let userId = info.userId = new Label();
        // @ts-ignore
        let betBaseLabel = info.betBaseLabel = new Label();
        // @ts-ignore
        let accumulatedScoreLabel = info.accumulatedScoreLabel = new Label();
        // @ts-ignore
        let winTotalScoreNode = info.winTotalScoreNode = new Node();
        // @ts-ignore
        info.playWinTotalScoreAnimation = jest.fn(() => Promise.resolve());

        info.start();

        expect(creditLabel.string).toBe('0.00');
        
        await info.showWinTotalScore(1000.14567);
        // @ts-ignore
        expect(winTotalScoreNode._children.length).not.toBeFalsy();

        info.updateSN('sn_string');
        expect(snLabel.string).toBe('sn_string');

        info.updateBetBase('1:1');
        expect(betBaseLabel.string).toBe('1:1');;

        info.updateBottomInfo('5276', 'user-1');
        expect(gameId.string).toBe('5276');
        expect(userId.string).toBe('user-1');

    });

});