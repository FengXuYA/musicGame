
cc.Class({
    extends: cc.Component,

    properties: {
        alterNode: cc.Node,     //将alterNode绑定为属性方便操作
    },

    /**
     * 关卡重开
     */
    restart() {
        cc.audioEngine.stopAllEffects();        //关停所有音效
        cc.director.loadScene("learnKongFuSC");
    },


    /**
     * 暂停
     */
    pause() {
        if (!cc.game.isPaused()) {
            //alter出现动画
            let anima = this.alterNode.getComponent(cc.Animation);
            anima.play("alterAppear");
            ///暂停
            this.scheduleOnce(() => {
                cc.audioEngine.pauseAllEffects();        //关停所有音效
                cc.game.pause();
            }, 0.26);
        }
    },


    /**
     * 恢复
     */
    resume() {
        if (cc.game.isPaused()) {
            //alter消失动画
            let anima = this.alterNode.getComponent(cc.Animation);
            anima.play("alterDisappear");
            ///恢复游戏
            cc.game.resume();
            cc.audioEngine.resumeAllEffects();   //恢复音效
        }
    },


    /**
     * 返回选择界面
     */
    backMenu() {
        cc.director.loadScene("menuSC");
        cc.find("music").getComponent("MusicControl").tempOn();
    }
});
