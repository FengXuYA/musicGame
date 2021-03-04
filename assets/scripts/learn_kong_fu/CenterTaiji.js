

cc.Class({
    extends: cc.Component,

    properties: {
    },


    /**
     * 显示tips
     * @param {int} noteNum 音符序号0-6
     */
    onTips(number) {
        let node = this.node.getChildByName("tipLB");
        let strLabel;
        switch (number) {
            case 0: strLabel = "叨";
                break;
            case 1: strLabel = "唻";
                break;
            case 2: strLabel = "咪";
                break;
            case 3: strLabel = "发";
                break;
            case 4: strLabel = "嗖";
                break;
            case 5: strLabel = "啦";
                break;
            case 6: strLabel = "嘻";
                break;
        }
        node.color = colors[number];
        let LB = node.getComponent(cc.Label);
        //LB.string = strLabel;
        LB.fontSize = 100;
    },


    /**
     * 不显示tips
     */
    offTips() {
        this.node.getChildByName("tipLB").getComponent(cc.Label).string = "";
    },


});
