import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import {Device} from '../../assets/game/mahjong/script/include'
import { AlertPanel } from '../../assets/game/mahjong/script/components/AlertPanel';
import { UtilsKit } from '../../assets/game/mahjong/script/lib/UtilsKit';
import { playAnimOnEnable } from '../../assets/common/script/anim/playAnimOnEnable';
import { Node, Animation, sp } from 'cc';

describe('UtilsKit', () => {
    test('test', async () => {
        let t: number = Date.now();
        await UtilsKit.Defer(1000);
        expect(Date.now() - t).toBeGreaterThan(1000);
        await UtilsKit.Defer();

        expect(UtilsKit.NumberSpecification(1.123456)).toEqual(`1.12`);

    });
    test('PlayAnimation', async () => {
        let animNode = new Node('animNode');
        let anim:any = animNode.getComponent(Animation);
        let enabled:any = animNode.getComponent(playAnimOnEnable);
        const { play, stop } = anim.mockGroupFn;
        animNode.components[playAnimOnEnable.name] = 0;
        await UtilsKit.PlayAnimation(animNode, 'animation_test', false);
        expect(play).toHaveBeenCalledTimes(1);
        animNode.components[playAnimOnEnable.name] = enabled;
        play.mockClear();

        animNode.active = true;
        await UtilsKit.PlayAnimation(animNode, 'animation_test', false);
        expect(play).not.toHaveBeenCalled();

        animNode.active = false;
        setTimeout(() => anim.emit(Animation.EventType.FINISHED), 0);
        await UtilsKit.PlayAnimation(animNode, 'animation_test', true);
        
        expect(play).toHaveBeenCalledTimes(0);
        expect(stop).toHaveBeenCalledTimes(1);
        
        play.mockClear();
        stop.mockClear();

    });
    test('SetSkeletonAnimation', async () => {
        let animNode = new Node('animNode');
        let skeleton:any = animNode.getComponent(sp.Skeleton);
        const { setCompleteListener } = skeleton.mockGroupFn;

        await UtilsKit.SetSkeletonAnimation(animNode, 0, 'animation_test', false, false);
        expect(setCompleteListener).not.toHaveBeenCalled();

        await UtilsKit.SetSkeletonAnimation(animNode, 0, 'animation_test', false, true);
        expect(setCompleteListener).toHaveBeenCalled();
    });
    test('DeferByScheduleOnce', async () => {
        await UtilsKit.DeferByScheduleOnce(1000);
        await UtilsKit.DeferByScheduleOnce();
    })
    test('FormatNumber', () => {
        expect(UtilsKit.FormatNumber(100)).toBe("100");
        expect(UtilsKit.FormatNumber(1000)).toBe("1,000");
        expect(UtilsKit.FormatNumber(10000)).toBe("10,000");
        expect(UtilsKit.FormatNumber(50000)).toBe("50,000");
        expect(UtilsKit.FormatNumber(100000)).toBe("100K");
        expect(UtilsKit.FormatNumber(1000000)).toBe("1,000K");
        expect(UtilsKit.FormatNumber(3000000)).toBe("3,000K");
    })
});