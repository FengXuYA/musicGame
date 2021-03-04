
cc.Class({
    extends: cc.Component,

    properties: {

    },

    /**
     * 开始游戏，跳转到菜单界面
     */
    btn_learn_Click: function () {
        cc.director.loadScene("menuSC");
    },

});
