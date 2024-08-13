import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';

import { envSetup } from './envSetup';
import { Graphics } from 'cc';
import { MahjongWheel } from '../../assets/game/mahjong/script/wheel/MahjongWheel';
import { MahjongSymbol } from '../../assets/game/mahjong/script/wheel/MahjongSymbol';

describe('BaseView Instance', () => {

        let slotWheel: MahjongWheel;
        let SymbolPrefab = class {
            name: string = 'symbolWin';
            getComponent() { return new MahjongSymbol(); }
        }
        beforeEach(() => {
            // MahjongSymbol.prototype.init = jest.fn();
            MahjongSymbol.prototype.changeSymbolID = jest.fn();
            //@ts-ignore
            MahjongSymbol.height = jest.fn().mockReturnValue(100);
            slotWheel = new MahjongWheel();
            //@ts-ignore
            slotWheel.symbolPrefab = SymbolPrefab;
            //@ts-ignore
            slotWheel.node = {
                addChild: jest.fn()
            }
            // slotWheel.generateMask = jest.fn();
            slotWheel.start();
        });

        test('Is able to launch', () => {
            //@ts-ignore
            console.log(slotWheel.symbolPrefab)
            slotWheel.launch();
            expect(slotWheel.isRunnung).toEqual(true);
        });
        test('generateMask', () => {
            slotWheel.generateMask();
            let { testcase } = slotWheel as any
            // get mask
            expect(testcase.addComponent).toHaveBeenCalled();
            expect(testcase.getComponent).toHaveBeenCalled();

            let g:any = slotWheel.getComponent(Graphics as any);
            expect(g.x).toBe(slotWheel.maskRect.x);
            expect(g.y).toBe(slotWheel.maskRect.y);
            expect(g.width).toBe(slotWheel.maskRect.width);
            expect(g.height).toBe(slotWheel.maskRect.height);
        });

        // test('Is able to stop', () => {
        //     slotWheel.stop([1,2,3]);
        //     expect(slotWheel.inStoppingPhase).toEqual(true);
        // });
});