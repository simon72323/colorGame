# mahjong

- [options]先安裝`pnpm`
    - macos(Homebrew) `brew install pnpm`
    - windows(Powershell) `iwr https://get.pnpm.io/install.ps1 -useb | iex`
    - npm `npm install -g pnpm` or `npm install -g @pnpm/exe`

- `npm install` or `pnpm i`

- 開啟Cocos Creator 

## Getting started
- GameType: 5276

- 點選 Canvas > PlayerConfig > HostName 設定伺服器

- 點選 Canvas > PlayerConfig > Session 設定使用者SID

- 執行Play on Device (CMD + P)

## Server Started
```
git clone https://https://swissknife.vip/gt/gt5/frontend/server/casino_server
```
啟動中間層服務

```shell

cd casino_server\src\www\slotGames

npm run start slot

```
## 多國語言
GT5-Frontend-Weblate[https://dms.vir999.com/projects/gt-gt5/frontend/zh_Hant/]

## 白牌設定
| 白牌名稱 | 相關參數 | 
|----|----|
| XC | urlParams?vendor=3 |

## Project folder structure
```lua
project-folder
|-- assets
|   |-- common 公版公用
|   |   |-- anim 動畫
|   |   |-- material 材質
|   |   |-- script 共用程式碼
|   |   |   |-- anim 共用動畫程式碼
|   |   |   |-- ui 共用介面程式碼
|   |   |-- texture 共用紋理(材質貼圖)
|   |   |   |-- commonUI 介面物件類別
|   |   |   |   |-- btn 按鈕類別
|   |   |   |   |-- pic 圖片類別
|   |   |   |-- lang 多國語言分類
|   |   |   |   |-- cn、en、tw
|   |-- game 遊戲主程式資料夾
|   |   |-- mahjong 碰碰胡遊戲
|   |   |   |-- anim
|   |   |   |-- scene 遊戲場景
|   |   |   |-- script 遊戲程式碼
|   |   |   |   |-- compponents 遊戲的介面元件
|   |   |   |   |   |-- settings 設定頁籤頁面元件
|   |   |   |   |   |-- BaseSettings.ts Base設定頁面
|   |   |   |   |   |-- SettingGeneral.ts 系統相關設定頁面
|   |   |   |   |   |-- SettingsWebView.ts Base設定頁面iframe
|   |   |   |   |-- AlertPanel.ts 警告元件 [singleton]
|   |   |   |   |-- AudioManager.ts 遊戲聲音: 管理系統[singleton]
|   |   |   |   |-- AutoSetPanel.ts 
|   |   |   |   |-- BetSetPanel.ts 
|   |   |   |   |-- BigWin.ts 大獎動畫
|   |   |   |   |-- CalculationCupborad.ts 算牌區
|   |   |   |   |-- Cusor.ts 滑鼠游標 
|   |   |   |   |-- ExchangePanel.ts 換分面板
|   |   |   |   |-- GameCommand.ts 遊戲CMD
|   |   |   |   |-- GameManager.ts 主遊戲邏輯
|   |   |   |   |-- Info.ts 遊戲資訊
|   |   |   |   |-- InputKeyboard.ts 鍵盤事件[singleton]
|   |   |   |   |-- MahjongCommand.ts 
|   |   |   |   |-- MahjongView.ts 碰碰胡: 介面層[Canvas]
|   |   |   |   |-- Marquee.ts 跑馬燈
|   |   |   |   |-- Multiple.ts 倍率計算
|   |   |   |   |-- PlayerConfig.ts 本地設定相關參數
|   |   |   |   |-- PlayTilesCound.ts 遊戲聲音: 胡牌大獎音效
|   |   |   |   |-- ProjectSetting.ts Cocos自訂Build Settings.json參數定義檔案
|   |   |   |   |-- Result.ts 遊戲結果
|   |   |   |   |-- SettingPanael.ts 遊戲設定頁籤選單
|   |   |   |   |-- SoundFiles.ts 遊戲聲音: 定義檔案
|   |   |   |   |-- TotalWin.ts 大獎: 結果動畫
|   |   |   |-- framework 底層架構物件
|   |   |   |-- lib mvp架構、共用
|   |   |   |   |-- analysis 分析相關資料
|   |   |   |   |   |-- Flags.ts BeginGame Flags
|   |   |   |   |   |-- gtag.d.ts GA分析的宣告檔案
|   |   |   |   |   |-- UserAnalysis.ts 分析元件
|   |   |   |   |-- BaseDataModel.ts 網路資料存儲庫
|   |   |   |   |-- BaseGame.ts GameManager定義檔案
|   |   |   |   |-- BaseModel.ts 存儲庫
|   |   |   |   |-- BasePresenter.ts UI的邏輯層
|   |   |   |   |-- BaseView.ts 介面層
|   |   |   |   |-- Localization.ts 多國語言: 文字檔案
|   |   |   |   |-- RecvMessage.ts 伺服器訊息: 接收
|   |   |   |   |-- SendMessage.ts 伺服器訊息: 發送
|   |   |   |   |-- UtilsKit.ts 公用元件
|   |   |   |-- mock 單機版: 產生下注資料
|   |   |   |-- tools 工具類
|   |   |   |   |-- ElementPoolManager.ts 物件池管理
|   |   |   |   |-- PrefabInstancePoolManager.ts Prefab物件池管理
|   |   |   |   |-- Resize.ts 介面縮放處理
|   |   |   |   |-- WorkOnBlur.ts 背景處理
|   |   |   |-- wheel 拉霸程式碼
|   |   |   |   |-- EliminationSlotWheel.ts 拉霸: 消除 
|   |   |   |   |-- MahjongCardsPool.ts 拉霸: 碰碰胡牌
|   |   |   |   |-- MahjongRoller.ts 拉霸: 碰碰胡滾輪
|   |   |   |   |-- MahjongSymbol.ts 拉霸: 碰碰胡元件
|   |   |   |   |-- MahjongWheel.ts 拉霸: 碰碰胡滾輪列
|   |   |   |   |-- Roller.ts 拉霸: Base滾輪
|   |   |   |   |-- SlotWheel.ts 拉霸: Base滾輪列
|   |   |   |   |-- SymbolItem.ts 拉霸: 元件
|   |   |   |   |-- include.ts 參考來源
|   |   |   |-- include.ts 參考來源
|   |   |   |-- index.ts 需要導出的class
|   |   |   |-- Application.ts 中間層導轉用 [singleton]
|   |   |   |-- Controller.ts 程式進入點
|   |   |   |-- LanguageFiles.ts 多國語言: 圖檔
|   |   |   |-- LanguageManager.ts 多國語言: 圖檔參數定義檔案 [singleton]
|   |   |-- spine spine動畫
|   |   |-- texture 紋理(材質貼圖)
|   |-- proto 放置ProtoBuf檔案
|   |-- resources 動態資源檔案資料夾
|   |-- techArt TA開發DEMO目錄
|-- src
|   |-- test
|   |   |-- *.test.ts BDD、TDD測試
|-- buildConfig_web-mobile.json Runner Build configuration
|-- gulpfile.js Build Script
|-- tsconfig.json ts參數設定(Cocos Creator專用)
|-- tsconfig-ci.json ts參數設定(Jest專用)
|-- package.json npm參數設定
|-- jest.config.js jest測試設定檔
```
### AlertPanel Testcase
```typesciprt

    let result;
    // 延遲5秒後關閉
    result = await this.alertPanel.alert({
        message: 'Basic Alert',
        duration: 5000
    });
    console.log(result);
    // 使用1個按鈕
    result = await this.alertPanel.alert({
        title: 'Basic Alert',
        message: 'Basic Alert',
        confirmButtonVisible: true,
        confirmButtonText: "重新連線"
    });
    console.log(result);
    // 使用2個按鈕
    result = await this.alertPanel.alert({
        title: '系統訊息',
        message: '縮短輪軸時間並加快遊戲速度\n是否開啟快速旋轉功能?',
        confirmButtonVisible: true,
        confirmButtonText: "重新連線",
        cancelButtonVisible: true,
        cancelButtonText: "取消"
    });
    console.log(result);
    // 使用ICON按鈕
    result = await this.alertPanel.alert({
        title: '系統訊息',
        message: '縮短輪軸時間並加快遊戲速度\n是否開啟快速旋轉功能?',
        iconButton: true
    });
    console.log(result);


```

## Reference
### 資料加密AES [https://github.com/entronad/crypto-es]