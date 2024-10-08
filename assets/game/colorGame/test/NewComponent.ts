// import { _decorator, Asset, assetManager, Component, JsonAsset, Node, TextAsset } from 'cc';
// import { GzipLoader } from './tools/GzipLoader';

// const { ccclass, property } = _decorator;

// @ccclass('NewComponent')
// export class NewComponent extends Component {
//     @property(GzipLoader)
//     gzipLoader: GzipLoader = null!;

//     start() {
//         // assetManager.loadBundle("path", (err: Error | null, bundle) => {
//         //     if (err) {
//         //         console.error("加載 bundle 失敗:", err);
//         //         return;
//         //     }
//         //     // 在這裡加載 bundle 中的資源
//         //     bundle.load('CGPath', JsonAsset, (err: Error | null, jsonAsset: JsonAsset) => {
//         //         if (err) {
//         //             console.error("加載路徑失敗:", err);
//         //             return;
//         //         }
//         //         GzipLoader.compressJsonToGzipBlob(jsonAsset,"simon");//壓縮
//         //         // 獲取json資料
//         //         // for (let i = 0; i < jsonAsset.json.length; i++) {
//         //         //     this.allPathData[i] = jsonAsset.json[i];
//         //         // }
//         //         // this._node.emit("completed");
//         //     });
//         // });
//         assetManager.loadBundle("path", (err: Error | null, bundle) => {
//             if (err) {
//                 console.error("加載 bundle 失敗:", err);
//                 return;
//             }
//             // 在這裡加載 bundle 中的資源
//             bundle.load('simon', (err: Error | null, asset: Asset) => {
//                 if (err) {
//                     console.error("加載路徑失敗:", err);
//                     return;
//                 }
//                 if (asset && typeof asset === 'object' && '_nativeAsset' in asset) {
//                     const nativeAsset = (asset as any)._nativeAsset;
//                     if (typeof nativeAsset === 'string') {
//                         // 將字符串轉換為 Uint8Array
//                         const compressedData = new Uint8Array(nativeAsset.split('').map(char => char.charCodeAt(0)));
//                         // console.log("壓縮數據:", compressedData);
//                         GzipLoader.decompressGzipToJson(compressedData);
//                     } else {
//                         console.error('_nativeAsset 不是預期的字符串類型');
//                     }
//                 } else {
//                     console.error('無法從 asset 中獲取 _nativeAsset');
//                 }
//                 // if (asset._nativeAsset) {
//                 //     let uint8Array: Uint8Array;
//                 //     if (asset._nativeAsset instanceof ArrayBuffer) {
//                 //         uint8Array = new Uint8Array(asset._nativeAsset);
//                 //     } else if (Array.isArray(asset._nativeAsset)) {
//                 //         uint8Array = new Uint8Array(asset._nativeAsset);
//                 //     } else if (typeof asset._nativeAsset === 'string') {
//                 //         uint8Array = new TextEncoder().encode(asset._nativeAsset);
//                 //     }

//                 //     if (uint8Array) {
//                 //         console.log("uint8Array 長度:", uint8Array.length);
//                 //         console.log("前10個字節:", Array.from(uint8Array.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));

//                 //         // 嘗試解壓
//                 //         try {
//                 //             GzipLoader.decompressGzipToJson(uint8Array);
//                 //         } catch (error) {
//                 //             console.error("解壓縮失敗:", error);
//                 //         }
//                 //     } else {
//                 //         console.error('無法將 _nativeAsset 轉換為 Uint8Array');
//                 //     }
//                 // } else {
//                 //     console.error('asset._nativeAsset 為空');
//                 // }
//             });
//         });
//         // 加载LZMA文件
//         // assetManager.loadAny('path/simon', (err, data: Asset) => {
//         //     if (err) {
//         //         console.error('path/simon:', err);
//         //         return;
//         //     }
//         //     // 检查 data 是否为 ArrayBuffer 类型
//         //     if (data instanceof ArrayBuffer) {
//         //         let compressedData = new Uint8Array(data);
//         //         console.log(compressedData);
//         //     }
//         //     // 如果 data 是 TextAsset 类型
//         //     else if (data instanceof TextAsset) {
//         //         let compressedData = new TextEncoder().encode(data.text);
//         //         console.log(compressedData);
//         //     }
//         //     // 如果以上都不是，可能需要其他处理方法
//         //     else {
//         //         console.error('无法将 data 转换为 Uint8Array');
//         //     }
//         // })
//     }
// }