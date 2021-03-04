cc.Class({
    extends: cc.Component,

    properties: {
        note: 0,     //音符，int代号，0~6
        scale: scaleType.MIDDLE,    //音阶
        type: noteType.CLICK,     //音符类型
        isJudged: false,    //是否已进行过判定,true是，false否
    },


    reuse(currNote) {
        //初始化属性
        this.note = this.noteNameToNum(currNote.note);
        this.type = currNote.type;
        this.scale = currNote.scale;
        this.isJudged = false;    //是否已进行过判定, true是，false否
        //初始化动画
        this.node.angle = 0;
        this.node.color = colors[7];
        //初始化图片
        this.initFrame();
    },


    hadJudge() {
        this.isJudged = true;
    },


    getJudged() {
        return this.isJudged;
    },


    /**
     * 按type类型添加SpriteFrame
     */
    initFrame() {
        let spt = this.node.getComponent(cc.Sprite);
        switch (this.type) {
            //加载note1的情况
            case noteType.CLICK:
                cc.loader.loadRes("note1", cc.SpriteFrame, (err, frame) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    spt.spriteFrame = frame;
                });
                break;
            //加载note2的情况
            case noteType.PRESSH:
            case noteType.PRESSB:
                cc.loader.loadRes("note2", cc.SpriteFrame, (err, frame) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    spt.spriteFrame = frame;
                });
                break;
        }
    },


    /**
     * 播放动画
     * @param {number} speed 播放速度   
     * @param {boolean} success 触发成功动画或失败动画
     */
    playAnima(speed, success) {
        //判断触发的动画名
        let animaName;  //动画名
        if (success) {
            if (this.type === noteType.CLICK) animaName = "noteClick" + this.note;
            else if (this.type === noteType.PRESSH) animaName = "notePress" + this.note;
            else if (this.type === noteType.PRESSB) animaName = "notePress" + this.note;    
        }
        else animaName = "noteFault";

        //播放动画
        let anima = this.getComponent(cc.Animation);    //获取动画组件
        let animaState = anima.getAnimationState(animaName);    //获取动画clip状态

        animaState.speed = speed;   //速度设置
        anima.play(animaName);  //播放动画
    },

    noteNameToNum(note) {
        let a = note.charCodeAt();
        return (a - 97) % 7;
    },
});
