type FlagNameArray<T extends string> = readonly T[];

export class Flags<T extends string> {
    get value(): number { return this._value; }
    private _value: number = 0;
    private flagMap: { [K in T]: number } = {} as { [K in T]: number };

    constructor(flagNames: FlagNameArray<T>) {
        flagNames.forEach((flag, index) => {
            this.flagMap[flag] = 1 << index;
        });
    }

    setFlag(flag: T): void {
        const flagValue = this.flagMap[flag];
        if (flagValue !== undefined) {
            this._value |= flagValue;
        }
    }

    clearFlag(flag: T): void {
        const flagValue = this.flagMap[flag];
        if (flagValue !== undefined) {
            this._value &= ~flagValue;
        }
    }

    hasFlag(flag: T): boolean {
        const flagValue = this.flagMap[flag];
        if (flagValue !== undefined) {
            return (this._value & flagValue) !== 0;
        }
        return false;
    }
}

/*
// 用法範例

// 定義標誌陣列
const FLAG_NAMES = ["FLAG_A", "FLAG_B", "FLAG_C"] as const;

// 建立 Flags 實例
const flags = new Flags(FLAG_NAMES);

// 設定標誌
flags.setFlag("FLAG_A");
flags.setFlag("FLAG_C");


// 檢查標誌是否存在
console.log(flags.hasFlag("FLAG_A")); // 輸出: true
console.log(flags.hasFlag("FLAG_B")); // 輸出: false

// 清除標誌
flags.clearFlag("FLAG_A");

console.log(flags.hasFlag("FLAG_A")); // 輸出: false
*/