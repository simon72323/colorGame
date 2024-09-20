import { Game, director, game } from "cc";

export class WorkOnBlur
{
    private static singleton: WorkOnBlur = null;

    private workTimeOut;

    constructor() {
        game.on(Game.EVENT_HIDE, ()=>{
            this.run();
        }, this);

        game.on(Game.EVENT_SHOW, ()=>{
            clearTimeout(this.workTimeOut);
        }, this);
    }

    private run: ()=> void  = ()=> {
        director.mainLoop(Date.now());
        this.workTimeOut = setTimeout(()=>{
            this.run();
        }, game.frameTime);
    }

    public static getInstance(): WorkOnBlur {
        
        if (!WorkOnBlur.singleton) {
            WorkOnBlur.singleton = new WorkOnBlur();
            console.log("生成後台運行");
        }
        return WorkOnBlur.singleton;
    }
}