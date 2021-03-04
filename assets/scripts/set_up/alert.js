

cc.Class({
    extends: cc.Component,
  
    properties: {
      m_Action: [cc.Node],
      
    },

  
    //转场主菜单
    btn_main_Click: function(){
        cc.director.loadScene("mainSC");
    },
     //警告框节点
     onLoad: function () {
         this.Outpus = this.m_Action.getPosition();
                cc.audioSource.active = false

     },
     //警告框节点动画出
    onActionBtOut : function(){
        var moveTo = cc.moveTo(1,cc.v2(-1000,-1000));
        this.m_Action[0].runAction(moveTo);
    },
     //警告框节点动画进
    onActionBtIn : function(){
        var moveTo = cc.moveTo(1,this.Outpus);
        this.m_Action[0].runAction(moveTo);
    },


    start () {

    },

    // update (dt) {},
});
