

/**
 * 透過web worker tigger setTimeout fn , 在背景作業下 run 的速度不會降低
 */
export class WorkerTimeout_Simon {

    private static singleton: WorkerTimeout_Simon = null;

    private timeoutId = 0;

    private timeouts = {};

    private workerContent = `var a={};this.addEventListener("message",function(e){var t=e.data;switch(t.command){case"setTimeout":var i=parseInt(t.timeout||0,10),i=setTimeout(function(e){this.postMessage({id:e}),delete a[e]}.bind(null,t.id),i);a[t.id]=i;break;case"clearTimeout":(i=a[t.id])&&clearTimeout(i),delete a[t.id]}});`;


    private worker: Worker | null;


    public enable() {
        if (this.worker == null) this.worker = this.init();
    }

    private init() {

        if (!!(window.URL && window.Blob && window.Worker) && this.worker == null) {

            let url = URL.createObjectURL(new Blob([this.workerContent], { type: "text/javascript" }));

            let w = new Worker(url);


            w.addEventListener("message", (evt) => {
                let data = evt.data,
                    id = data.id,
                    fn = this.timeouts[id]?.fn,
                    args = this.timeouts[id]?.args;

                fn?.apply(null, args);
                delete this.timeouts[id];
            });

            //@ts-ignore
            window.setTimeout = this._setTimeout;

            window.clearTimeout = this._clearTimeout;

            return w
        }
        else {
            return null;
        }
    }


    private _setTimeout: (handler: TimerHandler, timeout?: number, ...arg: any[])=>void = (handler, timeout, ...arg)=> {

        let args = arg;

        this.timeoutId += 1;

        timeout = timeout || 0;

        let id = this.timeoutId;

        this.timeouts[id] = { fn: handler, args };

        this.worker?.postMessage({ command: "setTimeout", id: id, timeout: timeout });

        return id;
    }

    private _clearTimeout: (id)=>void = (id) => {
        this.worker?.postMessage({ command: "clearTimeout", id: id });
        delete this.timeouts[id];
    }

    public static getInstance(): WorkerTimeout_Simon {
        if (!WorkerTimeout_Simon.singleton) {
            WorkerTimeout_Simon.singleton = new WorkerTimeout_Simon();
        }
        return WorkerTimeout_Simon.singleton;
    }

}