import 'jest';
import {afterEach, beforeEach, describe, expect, jest, test} from '@jest/globals';
import { envSetup } from './envSetup';
import { Dict } from '../../assets/game/mahjong/script/include';
import { Mask, UITransform } from 'cc';
import CrypotoES from "crypto-es";

describe('CrypotoES testing', () => {

    test('CrypotoES', () => {
        const key = 'encrypt'; // Game_type + year/month/day + 
        const value = 'Hello World';
        console.log(CrypotoES);
        
        // let encoder = CrypotoES.AES.encrypt(key, value).toString();
        // console.log(`加密：${encoder}`);
        // let decoder = CrypotoES.AES.decrypt(encoder, value).toString(CrypotoES.enc.Utf8);
        // console.log(`解密：${decoder}`)

    });

});