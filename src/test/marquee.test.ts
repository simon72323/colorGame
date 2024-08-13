import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import { Dict } from '../../assets/game/mahjong/script/include';
import { Marquee } from '../../assets/common/script/components/Marquee';
import { Mask, UITransform } from 'cc';
describe('Marquee testing', () => {

    test('should initialize', () => {
    
        let marquee = new Marquee();
        let tarn = marquee.node.getComponent(UITransform);
        tarn.width = 900;
        tarn.height = 80;
        marquee.node.setPosition(0, 860);
        
        marquee.start();
        //@ts-ignore
        let backgroud = marquee.backgroud;
        expect(backgroud).not.toBeNull();
        //@ts-ignore
        let textField = marquee.textField;
        expect(textField).not.toBeNull();
        
        marquee.update(0.16);
        expect(marquee.running).toBeFalsy();

        marquee.addText("Hello world 1");
        marquee.addText("Hello world 2");
        //@ts-ignore
        expect(marquee.queue.length).toBe(2);

        marquee.run();
        expect(marquee.running).toBeTruthy();
        expect(marquee.node.active).toBeTruthy();

        const { width, height } = backgroud.getComponent(UITransform);
        let origin_x1 = backgroud.position.x + width;
        expect(textField.node.position.x).toBe(origin_x1);
        expect(textField.node.position.y).toBe(0);

        marquee.update(0.16);
        expect(textField.node.position.x).toBe(origin_x1 -= marquee.speed);
        marquee.update(0.16);
        expect(textField.node.position.x).toBe(origin_x1 -= marquee.speed);
        marquee.pause();
        expect(marquee.running).toBeFalsy();
        marquee.resume();
        expect(marquee.running).toBeTruthy();
        textField.node.setPosition(-backgroud.getComponent(UITransform).width*2, 0);
        //@ts-ignore
        marquee.moveLeft();
        //@ts-ignore
        expect(marquee.queue.length).toBe(0);
        marquee.stop();
        expect(marquee.running).toBeFalsy();
        expect(marquee.node.active).toBeFalsy();
        marquee.run();
        expect(marquee.running).toBeTruthy();
        expect(marquee.node.active).toBeTruthy();
        //@ts-ignore
        marquee.checkQueue();
        expect(marquee.running).toBeFalsy();
        expect(marquee.node.active).toBeFalsy();
        //@ts-ignore
        marquee.node._components[Mask.name] = 0;
        //@ts-ignore
        marquee.createMask(100, 100);
        //@ts-ignore
        expect(marquee.node._components[Mask.name]).not.toBe(0);
        
    });

});