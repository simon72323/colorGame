// import { _decorator, resources, Component, sys } from 'cc';
// const { ccclass, property } = _decorator;


// @ccclass('LZMAWrapper')
// export class LZMAWrapper extends Component {
//     // start() {
//     //     // 加载LZMA压缩的JSON文件
//     //     resources.load('data/compressed.json.lzma', ArrayBuffer, (err, data: ArrayBuffer) => {
//     //         if (err) {
//     //             console.error(err);
//     //             return;
//     //         }

//     //         // 解压数据
//     //         const decompressed = this.decompressLZMA(data);

//     //         // 解析JSON
//     //         const jsonData = JSON.parse(decompressed);

//     //         console.log('Decompressed JSON:', jsonData);
//     //     });
//     // }

//     decompressLZMA(compressedData: ArrayBuffer): string {
//         // 创建输入流
//         const inStream = new LZMA.iStream(compressedData);
//         // 创建输出流
//         const outStream = new LZMA.oStream();
//         // 解压
//         LZMA.decompressFile(inStream, outStream);
//         // 获取解压后的字符串
//         return outStream.toString();
//     }
// }