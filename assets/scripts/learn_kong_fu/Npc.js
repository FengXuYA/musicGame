cc.Class({
    extends: cc.Component,

    properties: {

    },


    /**
     * 播放npc动作动画
     * @param {number} speed 动作类型
     * @param {activeType} type 动作类型
     * @param {int} num 动作序号，默认为0
     */
    playAnima(speed, type, num = 0) {
        //判断触发的动画名
        let animaName;  //动画名
        switch (type) {
            //提示切换动作
            case activeType.CHANGE:
                animaName = "toChange";
                break;
            //第num个架势动作
            case activeType.POSTURE:
                animaName = "to" + num;
        }

        //播放动画
        let anima = this.getComponent(cc.Animation);    //获取动画组件
        let animaState = anima.getAnimationState(animaName);    //获取动画clip状态
        animaState.speed = speed;   //速度设置
        anima.play(animaName);  //播放动画
    },
});
