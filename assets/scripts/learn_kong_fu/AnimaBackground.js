
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    
    /**
     * 播放npc动作动画
     */
    playAnima() {
        //播放动画
        let anima = this.getComponent(cc.Animation);    //获取动画组件
        anima.play("musicBackground");  //播放动画
    }
});
