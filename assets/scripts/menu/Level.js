cc.Class({
    extends: cc.Component,

    properties: {
        unlockedPic: cc.SpriteFrame,
        lockedPic: cc.SpriteFrame,
        greyStarPic: cc.SpriteFrame,
        yellowStarPic: cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 触摸监听
        this.node.on('touchstart', this.onTouchStart, this);
    },

    changePic (levelState, num) {
        // 更改图片
        if (levelState == 'UNLOCKED') {
            // 解锁关卡
            this.node.children[0].active = true;
            this.node.children[0].getComponent(cc.Label).string = num;
            this.node.getComponent(cc.Sprite).spriteFrame = this.unlockedPic;
            this.node.children[1].getComponent(cc.Sprite).spriteFrame = this.greyStarPic;
        }
        else if (levelState == 'PASSED') {
            // 通关
            this.node.children[0].active = true;
            this.node.children[0].getComponent(cc.Label).string = num;
            this.node.getComponent(cc.Sprite).spriteFrame = this.unlockedPic;
            this.node.children[1].getComponent(cc.Sprite).spriteFrame = this.yellowStarPic;

        }
        else if (levelState == 'LOCKED') {
            // 关卡未解锁
            this.node.getComponent(cc.Sprite).spriteFrame = this.lockedPic;
            this.node.children[1].getComponent(cc.Sprite).spriteFrame = this.greyStarPic;
        }     
    },

    onTouchStart () {
        if (this.node.settings['levelState'] == 'LOCKED')
            return;
        
        // 将目标关卡信息存入本地，在Game.js中取出
        cc.sys.localStorage.setItem('currentLevelInfo', JSON.stringify(this.node.settings));
        cc.director.loadScene('learnKongFuSC');
    }
});
