import { game } from "cc";
/**
 * 滑鼠樣式    
 */
export const enum ECursorStyle {
    /** 需被使用的自訂游標的URL */
    url = "url",
    /** 默認游標（通常是一個箭頭）*/
    default = "default",
    /** 默認。瀏覽器設定的游標。*/
    auto = "auto",
    /** 游標呈現為十字線。*/
    crosshair = "crosshair",
    /** 游標呈現為指示連結的指針（一隻手）*/
    pointer = "pointer",
    /** 此游標指示某對象可被移動。*/
    move = "move",
    /** 此游標指示矩形框的邊緣可被向右（東）移動。*/
    e_resize = "e-resize",
    /** 此游標指示矩形框的邊緣可被向上及向右移動（北/東）。*/
    ne_resize = "ne-resize",
    /** 此游標指示矩形框的邊緣可被向上及向左移動（北/西）。*/
    nw_resize = "nw-resize",
    /** 此游標指示矩形框的邊緣可被向上（北）移動。*/
    n_resize = "n-resize",
    /** 此游標指示矩形框的邊緣可被向下及向右移動（南/東）。*/
    se_resize = "se-resize",
    /** 此游標指示矩形框的邊緣可被向下及向左移動（南/西）。*/
    sw_resize = "sw-resize",
    /** 此游標指示矩形框的邊緣可被向下移動（北/西）。*/
    s_resize = "s-resize",
    /** 此游標指示矩形框的邊緣可被向左移動（西）*/
    w_resize = "w-resize",
    /** 此游標指示文字。*/
    text = "text",
    /** 此游標指示程序正忙（通常是一隻表或沙漏）。*/
    wait = "wait",
    /** 此游標指示可用的幫助（通常是一個問號或一個氣球）。*/
    help = "help"
}

/**游標設定 */
export class Cursor {
    /** 當前游標樣式 */
    public static lastStyle: string = ECursorStyle.default;

    /** 設定游標樣式 */
    public static SetCursorStyle(style: ECursorStyle, url = "") {
        if (style == url) {
            game.canvas.style.cursor = `url(${url}),auto`;
        }
        else {
            game.canvas.style.cursor = style;
        }

        Cursor.lastStyle = game.canvas.style.cursor;
    }

    /** 顯示或隱藏游標 */
    public static set enabled(value: boolean) {
        game.canvas.style.cursor = value ? "none" : Cursor.lastStyle;
    }

    /** 游標顯示狀態 */
    public static get enabled() {
        return game.canvas.style.cursor == "none";
    }

}