
cc.Class({
    extends: cc.Component,

    properties: {
        alterNode: cc.Node,     //将alterNode绑定为属性方便操作
    },

    /**
     * 关卡结算
     * @param {int} score 分数
     * @param {int} level 关卡序号
     */
    settlement(score, level) {
        this.score = score;
        this.data(level);    //数据处理
        this.appearAnima();     //结束界面
    },


    /**
     * 数据处理
     */
    data(level) {
        let settings = JSON.parse(cc.sys.localStorage.getItem('settings'));
        let oldScore = settings[level]['score'];
        //分数比原来高才更新
        if (oldScore < this.score) {
            settings[level]['score'] = this.score; //分数更新
        }

        //合格时令当前关卡完成并解锁下一关
        if (this.score >= 60) {
            settings[level]['levelState'] = 'PASSED';        // 当前关卡状态变为通过
            if (level < settings.length && oldScore < 60)                       //当还有下一关，且旧分数低于60
                settings[level + 1]['levelState'] = 'UNLOCKED';    // 下一关卡状态变为解锁
            cc.sys.localStorage.setItem('settings', JSON.stringify(settings));
        }

        cc.sys.localStorage.setItem('settings', JSON.stringify(settings));  //存储数据
    },


    /**
     * 结束界面动画
     */
    appearAnima() {
        //出现动画，结束界面
        let anima = this.alterNode.getComponent(cc.Animation);
        anima.play("alterAppear");
        //更改分数显示
        let node = this.node.getChildByName("score");
        node.getComponent(cc.Label).string = this.score + "/100";
        //star动画
        this.scheduleOnce(() => {
            if (this.score >= 60) {
                anima.play("starPassed");
            }
            else {
                anima.play("starUnpassed");
            }
        }, 0.5);
    }
});
