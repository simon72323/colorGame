
import CryptoES from "crypto-es";
import { WordArray } from "crypto-es/lib/core";
export interface IGameEncryption {
    encrypt(text: string, key: string);
    decrypt(text: string, key: string);
}


export class GameEncryption implements IGameEncryption {
    private secret: {key: WordArray, iv: WordArray};

    constructor(secret:string) {
        if (secret) this.registry(secret);
        this.test()
    }
    // 註冊金鑰
    protected registry(secret: string) {
        this.secret = this.secretWords(secret);
    }
    // 密鑰跟iv
    private secretWords(secret: string) {
        let parsedWordArray = CryptoES.enc.Base64url.parse(secret);
        const args = parsedWordArray.toString(CryptoES.enc.Utf8).split(".");
        const iv = CryptoES.enc.Utf8.parse(args[1]);
        const key = CryptoES.enc.Utf8.parse(args[0]);
        return {key, iv };
    }
    // 加密
    public decrypt(data: string): string {
        const plaintext = CryptoES.AES.decrypt(data, 
            this.secret.key, 
            {
                mode: CryptoES.mode.CBC,
                iv: this.secret.iv,
                padding: CryptoES.pad.Pkcs7
            });
        return plaintext.toString(CryptoES.enc.Utf8);
    }
    // 解密
    public encrypt(data: any):string {

        if (typeof data !== "string") data = JSON.stringify(data);

        const ciphertext = CryptoES.AES.encrypt(data,
            this.secret.key,
            {
                iv: this.secret.iv,
                mode: CryptoES.mode.CBC,
                padding: CryptoES.pad.Pkcs7
            });
        return ciphertext.toString();
    }
    test() {    
        const ciphertext = this.encrypt(JSON.stringify({"action":"ready","data":{"ts":1716432476388,"version":"1.2.66"}}));    
    }
}