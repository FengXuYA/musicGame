
cc.Class({
    extends: cc.Component,

    properties: {
        audio: {
            default: null,
            type: cc.AudioClip,
        },
        isPlay: false,   //音乐是否正在播放
    },

    onLoad() {
        cc.game.addPersistRootNode(this.node);  //设为常驻节点
    },

    start() {
        this.on();
    },
    
    /**
     * 关闭音乐
     */
    off() {
        if (this.isPlay) {
            cc.audioEngine.stopMusic();
            this.isPlay = false;
        }
    },

    /**
     * 开启音乐
     */
    on() {
        if (!this.isPlay) {
            this.current = cc.audioEngine.playMusic(this.audio, true);
            this.isPlay = true;
        }
    },

    /**
     * 临时关闭
     */
    tempClose() {
        if (this.isPlay) {
            cc.audioEngine.stopMusic();
        }
    },

    /**
     * 打开临时关闭的背景音乐
     */
    tempOn() {
        if (this.isPlay) {
            this.current = cc.audioEngine.playMusic(this.audio, true);
        }
    },

});
