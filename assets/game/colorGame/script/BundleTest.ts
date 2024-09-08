import { _decorator, Component, AssetManager, assetManager, assert, Asset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BundleTest')
export class BundleTest extends Component {
    protected bundle: AssetManager.Bundle = null;
    start() {
        assetManager.loadBundle('ColorGame_tw', (err, bundle) => {
            if (err) {
                console.error('Failed to load bundle:', err);
                return;
            }
            console.log('Bundle loaded:', bundle);

            // 可以在这里加载 Asset Bundle 中的资源
            bundle.load('pic_title_win.png', Asset, (err, asset) => {
                if (err) {
                    console.error('Failed to load asset from bundle:', err);
                    return;
                }
                console.log('Asset loaded:', asset);
                // 使用加载的资源
            });
        })

    }

    update(deltaTime: number) {

    }
}


