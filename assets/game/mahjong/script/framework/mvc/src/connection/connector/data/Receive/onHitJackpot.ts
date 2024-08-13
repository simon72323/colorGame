
export type Values<T> = T[keyof T];

export const JPType = {
    None: 0,
    Grand: 1,
    Minor: 2,
    Major: 3,
    Mini: 4
};


export type WinJPType = Values<typeof JPType>;


export interface onHitJackpot<onBeginGame = any> {
    JPType: WinJPType,
    JPAmount: number,
    beginGameResult: onBeginGame;
}