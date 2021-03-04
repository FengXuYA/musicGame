import { settings } from './Settings.js';

cc.Class({
    extends: cc.Component,

    properties: {
        levelPrefab: cc.Prefab,
        levelsLayout: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initLevels();
    },

    initLevels() {
        if (!cc.sys.localStorage.getItem('settings')) {
            for (let i = 0; i < settings.length; i++) {
                let level = cc.instantiate(this.levelPrefab);
                level.settings = settings[i];
                level.getComponent('Level').changePic(settings[i]['levelState'], (i + 1).toString());
                this.levelsLayout.addChild(level);
            }
            // 将所有关卡信息存入本地(针对首次游戏)
            cc.sys.localStorage.setItem('settings', JSON.stringify(settings));
        }
        else {
            // 如果玩家已经玩过，则从本地存储中获取关卡配置信息
            let newSettings = JSON.parse(cc.sys.localStorage.getItem('settings'));
            for (let i = 0; i < newSettings.length; i++) {
                let level = cc.instantiate(this.levelPrefab);
                level.settings = newSettings[i];
                level.getComponent('Level').changePic(newSettings[i]['levelState'], (i + 1).toString());
                this.levelsLayout.addChild(level);
            }
        }
    }
});
