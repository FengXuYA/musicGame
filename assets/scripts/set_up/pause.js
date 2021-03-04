// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,


    properties: {
        gamePause :cc.Node,

    },
 onLoad(){
       this.gamePause.active = false
    },
    // LIFE-CYCLE CALLBACKS:


btn_stopgame_Click : function (sender,str){
      if(str =='pause'){
      this.gamePause.active = true      //暂停游戏
      cc.director.pause()
      }else if(str =='continue'){
      this.gamePause.active = false     //继续游戏
      cc.director.resume();

      }else if(str =='restart'){
       this.gamePause.active = false    //重新开始
        cc.director.restart();
      }
   },
    start () {

    },

    // update (dt) {},
});
