export class MahjongCardsPool {
    
    private static singleton: MahjongCardsPool = null;

    public static lastElementID: number = 43; // 最後一個元件 id
    public static freeElementID: number = 43; // free 元件 id
    public static flowerElementIDRange: Array<number> = [35, 42];  // 花 元件 id range

    private cardsPool: Array<number>;

    /**
     * 產生牌池
     * @returns 遊戲中所有牌
     */
    private static produceCardsPool(): Array<number> {
        let scatterAmount: number = 6;
        let cardsPool: Array<number> = [];
        for (let i:number = 1; i <= MahjongCardsPool.lastElementID; i++) {
            if (i < MahjongCardsPool.flowerElementIDRange[0]) { // 萬筒條東南西北中發白(各4張)
                for (let j:number = 0; j < 4; j++) {
                    cardsPool.push(i);
                }
            } else if (i == MahjongCardsPool.freeElementID) { // free(共6張)
                for (let j:number = 0; j < scatterAmount; j++) {
                    cardsPool.push(i);
                }
            } else { // 花(各1張)
                cardsPool.push(i);
            }
        }
        return cardsPool;
    }

    /**
     * 產生牌池
     */
    public produceCardsPool() {
        this.cardsPool = MahjongCardsPool.produceCardsPool();
    }

    /**
     * 移除牌池裡特定的牌
     */
    public removeCards(cards: Array<number>) {
        let len: number = cards.length;
        for (let i:number = 0; i < len; i++) {
            let index: number = this.cardsPool.indexOf(cards[i]);
            this.cardsPool.splice(index, 1);
        }
    }

    /**
     * 新增特定的牌並放置牌池裡
     */
     public addCards(cards: Array<number>) {
        let len: number = cards.length;
        for (let i:number = 0; i < len; i++) {
            this.cardsPool.push(cards[i]);
        }
    }

    /**
     * 從牌池隨機產生牌
     * @param removeFromPool 產生的牌是否從牌池移除
     * @returns 牌
     */
    public produceCard(removeFromPool:boolean): number {
        let index: number = Math.floor(Math.random() * this.cardsPool.length);
        let card: number;
        if (removeFromPool) {
            card = this.cardsPool.splice(index, 1)[0];
        } else {
            card = this.cardsPool[index];
        }
        return card;
    }

    //生成單例
    public static getInstance(): MahjongCardsPool {
        if (!MahjongCardsPool.singleton) {
            MahjongCardsPool.singleton = new MahjongCardsPool();
            MahjongCardsPool.singleton.produceCardsPool();
        } 
        return MahjongCardsPool.singleton;
    }
}