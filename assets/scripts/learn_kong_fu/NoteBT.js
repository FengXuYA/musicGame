cc.Class({
    extends: cc.Component,

    properties: {
        postureNumber: 0,

        posture: {
            default: null,
            type: cc.Sprite,
        },
    },

    /**
     * 设置架势按钮
     * @param {Int} number 架势按钮编号
     */
    set(number) {
        this.postureNumber = number;    //设置编号
        let button = this.node.getComponent(cc.Button); //获取Button组件
        //加载资源
        if (number < 8) {
            this.loadNotePosture(number);   //加载架势图标
        }
        //节点大小
        this.node.width = this.node.height = 100;
        //posture图片大小
        this.node.getChildByName("posture").width = this.node.getChildByName("posture").height = 100;
        //注册点击事件  
        this.clickEvent();
    },


    /**
     * 加载音符架势Frame
     * @param {整型} number 
     */
    loadNotePosture(number) {
        cc.loader.loadRes("textures/" + number, cc.SpriteFrame, (err, pos) => {
            if (err) {
                console.log(err);
                return;
            }
            this.posture.spriteFrame = pos;
            this.posture.node.color = colors[number];    //number
        });
    },


    /**
     * 7音符按钮点击事件
     */
    clickEvent() {
        let bg = this.node.getChildByName("background");
        //触摸
        this.node.on("touchstart", () => {
            //设置派送事件
            let event = new cc.Event.EventCustom("down", true);
            event.setUserData(this.postureNumber);
            //派送事件
            this.node.dispatchEvent(event);
            bg.opacity = 255;   //显示背景
        });

        //按钮内离开屏幕
        //按钮外离开屏幕，都一样
        this.node.on("touchend", () => {
            //设置派送事件
            let event = new cc.Event.EventCustom("up", true);
            //派送事件
            this.node.dispatchEvent(event);
            bg.opacity = 0;
        });
        this.node.on("touchcancel", () => {
            //设置派送事件
            let event = new cc.Event.EventCustom("up", true);
            //派送事件
            this.node.dispatchEvent(event);
            bg.opacity = 0;
        });
    }



});
