import { Animation, Node, Button } from "cc";

export class CGUtils {
    /**
     * 彈窗顯示
     * @param node 彈窗節點
    */
    public static popupShow(node: Node) {
        node.active = true;
        node.getChildByName('BtnClose').getComponent(Button).interactable = true;
        node.getComponent(Animation).play('PopupShow');
    }

    /**
     * 彈窗隱藏
     * @param node 彈窗節點
    */
    public static popupHide(node: Node) {
        node.getChildByName('BtnClose').getComponent(Button).interactable = false;
        node.getComponent(Animation).play('PopupHide');
        setTimeout(() => {
            node.active = false;
        }, 200)
    }
}