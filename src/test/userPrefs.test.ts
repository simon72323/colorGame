import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import { UserPrefs } from '../../assets/game/mahjong/script/lib/UserPrefs';
import { Mask, UITransform } from 'cc';


describe('UserPrefs testing', () => {
    let counter = {
        init: jest.fn()
    }
    class mockDB {
        isReady = false;
        store = {};
        init() {
            this.isReady = true;
            counter.init();
            return Promise.resolve();
        }
        setItem(key, value) {
            this.store[key] = value;
            return Promise.resolve();
        }
        getItem(key) {
            return Promise.resolve(this.store[key]);
        }
        deleteItem(key) {
            delete this.store[key];
            return Promise.resolve(this.store[key]);
        }
        clear() {
            this.store = {};
            return Promise.resolve();
        }

    }
    let userPrefs: UserPrefs;
    beforeEach(() => {
        userPrefs = UserPrefs.getInstance();
        //@ts-ignore
        userPrefs.db = new mockDB();
    })
    test('should initialize', async () => {
        const uuid = `user_UUID`
        await userPrefs.init();
        expect(userPrefs.isReady).toBeTruthy();
        await userPrefs.init();
        expect(counter.init).toBeCalledTimes(1);
        await userPrefs.load(uuid);

        userPrefs.gameSettings.doSpeedUp = true;
        userPrefs.gameSettings.isMuted = true;
        userPrefs.gameSettings.points = 10;
        let data: any = await userPrefs.get(uuid)
        expect(data).toStrictEqual({ isMuted: true, doSpeedUp: true, points: 10 });
        // test data reload
        await userPrefs.load(uuid);
        
        expect(userPrefs.gameSettings.doSpeedUp).toBe(data.doSpeedUp);
        expect(userPrefs.gameSettings.isMuted).toBe(data.isMuted);
        expect(userPrefs.gameSettings.points).toBe(data.points);


        let key = 'customize';
        let value = {
            test: 1
        }
        await userPrefs.set(key, value);

        expect(await userPrefs.get(key)).toStrictEqual(value);

        await userPrefs.delete(key);

        expect(await userPrefs.get(key)).toBeFalsy();

        await userPrefs.clear();

        expect(await userPrefs.get(uuid)).toBeFalsy();

        userPrefs.release();
        //@ts-ignore
        expect(UserPrefs.singleton).toBeFalsy();
        // NOT CALL init
        expect(UserPrefs.getInstance().isReady).toBeTruthy();




    });
    test('start call load() should be call init()', async () => {
        let uuid = 'uuid'
        // NOT INIT TO CALL
        counter.init.mockClear();
        await UserPrefs.getInstance().load(uuid);
        expect(counter.init).toBeCalledTimes(1);
    })

});