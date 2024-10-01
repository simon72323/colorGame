import { _decorator, Component } from 'cc';
import pako from 'pako';
const { ccclass } = _decorator;

@ccclass('GzipLoader')
export class GzipLoader extends Component {

    /**
     * 將 JSON 數據壓縮為 gzip 格式
     * @param jsonData JSON 數據
     * @returns 壓縮後的 Uint8Array
     */
    public static compressJsonToGzip(jsonData: any): Uint8Array {
        try {
            const jsonString = JSON.stringify(jsonData);
            return pako.gzip(jsonString);
        } catch (error) {
            console.error('壓縮 JSON 數據時發生錯誤:', error);
        }
    }

    /**
     * 將 JSON 數據壓縮為 gzip 格式並創建可下載的 Blob
     * @param jsonData JSON 數據
     * @param fileName 要保存的檔案名稱
     * @returns 包含壓縮數據的 Blob URL
     */
    public static compressJsonToGzipBlob(jsonData: any, fileName: string): string {
        try {
            const compressedData = this.compressJsonToGzip(jsonData);
            const blob = new Blob([compressedData], { type: 'application/gzip' });
            const url = URL.createObjectURL(blob);
            
            // 創建一個隱藏的下載鏈接
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName + '.gz';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // 釋放 Blob URL
            URL.revokeObjectURL(url);
            
            return url;
        } catch (error) {
            console.error('創建 gzip Blob 時發生錯誤:', error);
            return null;
        }
    }

    /**
     * 解壓縮 gzip 數據為 JSON
     * @param compressedData 壓縮的 Uint8Array 數據
     * @returns 解壓縮後的 JSON 數據，如果失敗則返回 null
     */
    public static decompressGzipToJson(inputData: Uint8Array): any | null {
        try {
            let data: Uint8Array;
        
            // 如果輸入是字符串，嘗試將其轉換為 Uint8Array
            if (typeof inputData === 'string') {
                data = new TextEncoder().encode(inputData);
            } else {
                data = inputData;
            }
    
            console.log('輸入數據的前 10 個字節:', Array.from(data.slice(0, 10)));
    
            let jsonString: string;
    
            // 嘗試直接將數據解析為 JSON
            try {
                jsonString = new TextDecoder().decode(data);
                return JSON.parse(jsonString);
            } catch (directParseError) {
                console.warn('直接解析失敗，嘗試解壓縮');
            }
    
            // 嘗試 gzip 解壓
            try {
                const decompressedData = pako.inflate(data);
                jsonString = new TextDecoder().decode(decompressedData);
                return JSON.parse(jsonString);
            } catch (gzipError) {
                console.warn('gzip 解壓失敗，嘗試 deflate 解壓');
            }
    
            // 嘗試 deflate 解壓
            try {
                const decompressedData = pako.inflateRaw(data);
                jsonString = new TextDecoder().decode(decompressedData);
                return JSON.parse(jsonString);
            } catch (deflateError) {
                console.error('deflate 解壓也失敗');
            }
    
            // 如果所有嘗試都失敗，檢查是否為 Base64 編碼
            if (typeof inputData === 'string' && /^[A-Za-z0-9+/=]+$/.test(inputData)) {
                try {
                    const decodedData = atob(inputData);
                    return JSON.parse(decodedData);
                } catch (base64Error) {
                    console.error('Base64 解碼失敗');
                }
            }
    
            throw new Error('無法解析數據');
        } catch (error) {
            console.error('解壓縮或解析 JSON 時發生錯誤:', error);
            return null;
        }
        
        // try {
        //     const decompressedData = pako.inflate(compressedData);
        //     // const decompressedData = pako.inflate(compressedData, { to: 'string' });
        //     console.log(decompressedData)
        //     console.log(JSON.parse(decompressedData))
        //     // return JSON.parse(decompressedData);
        // } catch (error) {
        //     console.error('解壓縮 gzip 數據時發生錯誤:', error);
        //     return null;
        // }
    }
}