//遊戲方向定義在字典檔中 direction
//HFLoader 會將字典檔 direction 寫進cookie

import { GameSetOrientation, OrientationType } from "../device/Orientation";
import { URLParameter } from "./URLParameter";

/**
 *  取得loading圖片url
 */
export function GetLoadingPicURL() {

    let path: string = "";

    if (parent['LogoUrlPC'] && parent['LogoUrlMobile']) {
        //go+ 設定 windows 變數 , 需判斷遊戲路徑給圖
        path = (GameSetOrientation == OrientationType.portrait) ? parent['LogoUrlMobile'] : parent['LogoUrlPC'];
    }
    else if (URLParameter.demo == '1') {
        //demo站
        path = '../ShareFile/Demo/loading.jpg';
    }
    else if (URLParameter.special != null) {
        //特殊站台
        path = '../ShareFile/Special/loading.jpg?' + Math.ceil(Date.now() / 86400);
    }
    else {
        path = '../ShareFile/PC/Picture/loading.png';
    }

    return URLParameter.getResourceURL(path);
}