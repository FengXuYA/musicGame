
cc.Class({
    extends: cc.Component,

    properties: {
        alterNode: cc.Node,     //将alterNode绑定为属性方便操作
    },


    /**
     * 显示设置框
     */
    onClickAlert: function () {
        //alter出现动画
        let anima = this.alterNode.getComponent(cc.Animation);
        anima.play("alterAppear");
    },


    /**
     * 返回游戏
     */
    back() {
        //alter消失动画
        let anima = this.alterNode.getComponent(cc.Animation);
        anima.play("alterDisappear");
    },

    /**
     * 关闭音乐
     */
    offMusic() {
        cc.find("music").getComponent("MusicControl").off();
    },

    /**
     * 开启音乐
     */
    onMusic() {
        cc.find("music").getComponent("MusicControl").on();
    }
});
