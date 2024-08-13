export class IPL {
    public static CloseWinodw() {
        if (typeof parent.leaveFunction === "function") {
            parent.leaveFunction();
        } else {
            window.close();
            top.close();
        }
    }
    
}