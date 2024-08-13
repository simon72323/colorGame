
//5090

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace onBeginGame {

    export interface Line {
        LineID: number;
        GridNum: number;
        Grids: string;
        Payoff: number;
        Element: string[];
        ElementID: string | number;
        DoubleTime?: number;
    }

    export interface Scatter {
        ID: number;
        GridNum: number;
        Grids: string;
        Payoff: number;
        DoubleTime?: number;
        Count?: number;
    }
}


export interface onBeginGame {
    PayTotal: number;
    Credit: number | string;
    Credit_End: number | string;
    WagersID: number | string;
    Lines: onBeginGame.Line[];
    Cards: string[];
    AxisLocation: string;
    Scatter?: onBeginGame.Scatter | onBeginGame.Scatter[];
}


