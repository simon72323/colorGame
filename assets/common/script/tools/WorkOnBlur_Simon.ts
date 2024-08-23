import { Game, director, game } from "cc";

export class WorkOnBlur_Simon {
    private static singleton: WorkOnBlur_Simon = null;

    private workTimeOut: any;

    constructor() {
        game.on(Game.EVENT_HIDE, () => {
            this.run();
        }, this);

        game.on(Game.EVENT_SHOW, () => {
            clearTimeout(this.workTimeOut);
        }, this);
    }

    private run: () => void = () => {
        director.mainLoop(Date.now());
        this.workTimeOut = setTimeout(() => {
            this.run();
        }, game.frameTime);
    }

    public static getInstance(): WorkOnBlur_Simon {

        if (!WorkOnBlur_Simon.singleton) {
            WorkOnBlur_Simon.singleton = new WorkOnBlur_Simon();
        }
        return WorkOnBlur_Simon.singleton;
    }
}