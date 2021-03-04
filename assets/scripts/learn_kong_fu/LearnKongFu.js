/**
 * 本脚本一些全局变量说明
 * @this music    乐谱
 * 
 * //音符记录记录当前要执行动画和音效的音符名，主要是为了方便延音'-'的处理
 * //类型声明
 * currNote = {
 *   type: noteType,
 *   note: char,
 *   scale: scaleType, 
 * };
 * @this npcCurrNote    这个是Npc的音符记录音符记录
 * @this playerCurrNote 这个是player的音符记录
 * 
 * @this scale 音阶，分高中低
 * @this noteTime 音符持续时间，指一个音符的音乐和动画持续时间，与speed和length有关
 * @this speed 关卡速度，整关的整体速度，由乐谱的BPM决定
 * @this tips 按键提示字，true表示开启(取消使用
 * @this musicNum   //乐谱小节序号，表示当前指向的乐谱小节
 * @this playerNoteNum  //玩家当前判断的音符下标
 * @this judgeSize  //音符判定区域的大小
 * 
 * @this notePool note对象池，大小由乐谱决定
 * @this noteList note列表，从notePool申请来的对象放到这里面
 * @this noteBTList noteBT列表 存放7个noteBT
 * @this animaBackgournd //提前记录乐谱区框需要进行动画的Node
 * @this judgeLine  //子节点judgeLine
 */



cc.Class({
    extends: cc.Component,

    properties: {
        score: 0,       //分数
        level: 0,       //关卡，第level关
        speed: 1,     //本关速度

        notePrefab: cc.Prefab,    //note预制体
        noteBTPrefab: cc.Prefab,    //noteBT预制体
        audio: {
            default: [],
            type: cc.AudioClip
        },
    },


    onLoad() {
        this.init();   //初始化
    },


    start() {
        ///准备
        cc.find("music").getComponent("MusicControl").tempClose();    //临时关闭标题背景音乐
        //开始
        this.scheduleOnce(() => {
            //延迟0.5s
            //触发npc回合
            this.npcRound();
        }, 0.5);
    },


    /**
     * 节点、组件及资源加载初始化
     */
    init() {
        this.initData();        //初始化数据
        this.initNoteBTList();  //初始化音符按钮列表
        this.initNoteList(this.music.length);    //初始化音符列表
        this.initNotePool(this.music.length);    //初始化note对象池
        this.drawNoteBT();      //绘制音符按钮
        //注册监听的玩家事件
        this.initPlayerEvent();
    },


    /**
     * 关卡结束
     */
    final() {
        let percentScore = this.score / (this.music.length * this.music.size) * 100;
        percentScore = Math.round(percentScore * Math.pow(10, 1)) / Math.pow(10, 1);    //保留一位小数
        cc.find("end").getComponent("End").settlement(percentScore, this.level);
    },


    /**
     * npc回合
     */
    npcRound() {
        if (this.musicNum < this.music.size) {
            this.npcStart();
        }
        else {
            this.final();    //结束
        }
    },

    /**
     * npc开始
     */
    npcStart() {
        let noteNum = 0;    //当前判定的音符下标
        //循环进行动作，每次一个音符
        this.schedule(() => {
            //设置当前音符记录
            this.setCurrNote(this.musicNum, noteNum, this.npcCurrNote);

            ///从对象池中申请note并放到场景中
            this.setNote(this.npcCurrNote, noteNum, this.music.length);
            //npc做动作
            this.npcActive(activeType.POSTURE, this.npcCurrNote.note);
            //播放音效
            this.playAudio(this.npcCurrNote);

            ++noteNum;  //音符下标+1
            if (noteNum == this.music.length) {
                //延迟，进入玩家回合
                this.scheduleOnce(() => {
                    cc.audioEngine.stopAllEffects();        //关停所有音效
                    this.npcActive(activeType.CHANGE);      //提示动作
                    //if (this.tips) this.offTips();       //关闭显示提示字
                    this.playerRound();  //进入玩家回合
                }, this.noteTime);
            }
        }, this.noteTime, this.music.length - 1);
    },


    /**
     * player回合
     */
    playerRound() {
        this.playerNoteNum = 0;    //玩家当前判定的音符下标重置为0
        //修改音符记录
        this.setCurrNote(this.musicNum, this.playerNoteNum, this.playerCurrNote);
        //judgeLine动画
        this.playAnimaJudgeLine();
        ///监测玩家没有点击按钮的失败事件
        this.notClickFault();
        //玩家开始
        this.playerStart();
    },


    /**
     * 监测玩家没有点击按钮的失败事件
     */
    notClickFault() {
        let areaNum = 0;    //记录判定线越过第areaNum个音符的判定区
        //监测间隔this.noteTime
        //delay延迟
        let delay = this.judgeSize / 200 / this.speed + this.noteTime;
        let faultCallback = () => {
            //判定线当前经过的判定区所对应音符，是否已判定过
            if (this.noteList[areaNum].getComponent("Note").getJudged()) {
                ++areaNum;
            }
            //没判定过
            else {
                //播放失败动画
                this.playAnimaNote(areaNum, false, this.speed);
                //Note置为已判断状态
                this.noteList[areaNum].getComponent("Note").hadJudge();
                ++areaNum; ++this.playerNoteNum;//判定过的区域+1
                //修改音符记录
                this.setCurrNote(this.musicNum, areaNum, this.playerCurrNote);

                if (this.playerNoteNum < this.music.length) {
                    //press的部分全部木大
                    while (this.playerCurrNote.type == noteType.PRESSB) {
                        //播放失败动画
                        this.playAnimaNote(this.playerNoteNum, false, this.speed);
                        //Note置为已判断状态
                        this.noteList[this.playerNoteNum].getComponent("Note").hadJudge();
                        ++this.playerNoteNum;//判定过的区域+1
                        //修改音符记录
                        this.setCurrNote(this.musicNum, this.playerNoteNum, this.playerCurrNote);
                    }
                }
            }
            //this.playerNoteNum到上限后取消计时器
            if (this.playerNoteNum >= this.music.length) this.unschedule(faultCallback);
        }
        this.schedule(faultCallback, this.noteTime, this.music.length - 1, delay);    //监测间隔this.noteTime
    },


    /**
     * player开始
     */
    playerStart() {
        //计时器，judgeLine动画结束后跳转到npc回合
        let delay = 4.5 / this.speed + this.noteTime;  //延迟的时间，速度越快，时间越短
        this.scheduleOnce(() => {
            cc.audioEngine.stopAllEffects();        //关停所有音效
            this.playerActive(activeType.CHANGE)    //玩家toChange动作
            ++this.musicNum;    //下一乐谱小节
            this.noteBack();    //回收note
            this.npcRound();    //轮到npc
        }, delay);
    },


    /**
     * 注册玩家点击事件
     */
    initPlayerEvent() {
        ///按下noteBT
        this.node.on("down", (event) => {
            let postureNum = event.getUserData();   //获取按下的按钮序号
            //判定线已到判定区
            if (this.checkLinePosition(this.music.length, this.playerNoteNum)) {
                //当前音符未被判定过时，才进行判定
                if (!this.noteList[this.playerNoteNum].getComponent("Note").getJudged()) {
                    //修改音符记录
                    this.setCurrNote(this.musicNum, this.playerNoteNum, this.playerCurrNote);
                    switch (this.playerCurrNote.type) {
                        case noteType.CLICK:
                            this.clickStart(postureNum);  //click
                            break;
                        case noteType.PRESSH:
                            this.pressStart(postureNum);  //press
                            break;
                    }
                }
            }
        });

        ///松开noteBT
        this.node.on("up", (event) => {
            let x = this.judgeLine.x;   //判定线位置横坐标
            let pos = this.getPosition(this.playerNoteNum, this.music.length);    //第this.playerNoteNum音符所在区域
            let space = this.judgeSize / 2;   //判定区域左右间隔
            //按够时间之前松开，则失败
            if (x < pos.x - space) {
                this.node.emit("pressFault");
            }
        });
    },


    /**
     * 处理click事件
     * @param {int} postureNum noteBT序号
     */
    clickStart(postureNum) {
        //note置为已判断状态
        this.noteList[this.playerNoteNum].getComponent("Note").hadJudge();
        //按对
        if (this.judge(postureNum, this.playerCurrNote.note)) {
            //播放音效
            this.playAudio(this.playerCurrNote);
            //播放玩家动作
            this.playerActive(activeType.POSTURE, this.playerCurrNote.note);
            //成功音符动画
            this.playAnimaNote(this.playerNoteNum, true, this.speed);
            //加分
            ++this.score;
        }
        //没按对
        else {
            //根据玩家按下的postureNum播放音效
            this.playAudioPosture(postureNum);
            //播放玩家失败动作，暂时用change动作代替
            this.playerActive(activeType.CHANGE);
            //音符失败动画
            this.playAnimaNote(this.playerNoteNum, false, this.speed);
        }
        ++this.playerNoteNum;   //当前判定note下标+1
    },


    /**
     * 按压开始事件
     * @param {int} postureNum noteBT序号
     */
    pressStart(postureNum) {
        //note置为已判断状态
        this.noteList[this.playerNoteNum].getComponent("Note").hadJudge();
        //判断结果
        let result = this.judge(postureNum, this.playerCurrNote.note);

        //计算press长度
        let num = this.playerNoteNum + 1;    //用于数press长度的中间量
        this.setCurrNote(this.musicNum, num, this.playerCurrNote); //修改音符记录
        while (this.playerCurrNote.type == noteType.PRESSB) {
            //note置为已判断状态
            this.noteList[num].getComponent("Note").hadJudge();
            ++num;
            if (num < this.music.length) {
                //修改音符记录
                this.setCurrNote(this.musicNum, num, this.playerCurrNote);
            }
            else break;
        }
        this.pressLength = num - this.playerNoteNum;   //记录press长度

        //按对
        if (result) {
            this.pressRigth();
        }
        //没按对
        else {
            this.pressMiss();
        }
    },


    /**
     * press按错
     */
    pressMiss() {
        let max = this.playerNoteNum + this.pressLength;  //press尾下标+1
        for (; this.playerNoteNum < max; ++this.playerNoteNum) {
            //失败音符动画
            this.playAnimaNote(this.playerNoteNum, false, this.speed);
        }
    },


    /**
     * 处理press按对事件
     */
    pressRigth() {
        //修改音符记录
        this.setCurrNote(this.musicNum, this.playerNoteNum, this.playerCurrNote);
        //播放音效
        this.playAudio(this.playerCurrNote);
        //播放玩家动作
        this.playerActive(activeType.POSTURE, this.playerCurrNote.note);
        //成功音符动画
        this.playAnimaNote(this.playerNoteNum, true, this.speed);
        let start = this.playerNoteNum + 1;             //press头下标+1
        this.playerNoteNum = this.playerNoteNum + this.pressLength; //press尾下标+1

        //press失败事件：没按够时间
        let faultEvent = () => {
            for (let i = this.playerNoteNum - this.pressLength; i < this.playerNoteNum; ++i) {
                //失败音符动画
                this.playAnimaNote(i, false, this.speed);
            }
            //注销事件
            this.node.off("pressFault", faultEvent);
            //取消计时器
            this.unschedule(pressEvent);
        };
        this.node.on("pressFault", faultEvent); //注册事件

        //这个计时器用于播放pressB部分的效果
        let pressEvent = () => {
            //修改音符记录
            this.setCurrNote(this.musicNum, start, this.playerCurrNote);
            //播放音效
            this.playAudio(this.playerCurrNote);
            //播放玩家动作
            this.playerActive(activeType.POSTURE, this.playerCurrNote.note);
            //成功音符动画
            this.playAnimaNote(start, true, this.speed);
            ++start;

            //成功完成press
            if (start == this.playerNoteNum) {
                this.node.off("pressFault", faultEvent);    //注销事件
                //加分
                this.score += this.pressLength;
            }
        };
        this.schedule(pressEvent, this.noteTime, this.pressLength - 2);
    },

    /**
     * 判断玩家是否按对按钮
     * @param {int} postureNum 按钮序号
     * @param {char} note 音符名，字符
     * @returns {boolean} true按对
     */
    judge(postureNum, note) {
        let num = this.noteNameToNum(note);
        return postureNum == num;
    },

    /**
     * 判断judgeLine是否已到达第noteNum个音符的判定区
     * @param {int} length 一行总音符数
     * @param {int} noteNum 当前要判断的音符下标，从0开始
     * @returns {boolean} true表示已到达
     */
    checkLinePosition(length, noteNum) {
        if (noteNum > length) return false;
        let x = this.judgeLine.x;   //判定线位置横坐标
        let pos = this.getPosition(noteNum, length);    //第noteNum音符所在区域
        let space = this.judgeSize / 2;   //判定区域左右间隔

        return ((pos.x - space) <= x && x <= (pos.x + space)); //x在范围之内则返回true
    },

    /**
     * 播放第num个音符动画，速度为speed，若播放失败动画success==false
     * @param {int} num 
     * @param {boolean} success 
     * @param {double} speed 
     */
    playAnimaNote(num, success, speed) {
        if (num < this.music.length) {
            this.noteList[num].getComponent("Note").playAnima(speed, success);
        }
    },

    /**
     * 播放指定类型type和音符note对应的player动作
     * @param {activeType} type 动作类型
     * @param {char} note 音符对应名
     */
    playerActive(type, note = 'h') {
        let num = this.noteNameToNum(note);
        //播放动画
        this.node.getChildByName("player").getComponent("Player").playAnima(this.speed, type, num);
    },


    /**
     * 根据架势按钮序号播放音乐
     * @param {int} postureNum 按钮序号
     */
    playAudioPosture(postureNum) {
        cc.audioEngine.playEffect(this.audio[postureNum], false);
    },


    /**
     * 播放judgeLine动画
     */
    playAnimaJudgeLine() {
        let anima = this.judgeLine.getComponent("cc.Animation");
        let animaState = anima.getAnimationState("judgeLine");    //获取动画clip状态
        animaState.speed = this.speed;   //速度设置
        anima.play("judgeLine");  //播放动画
    },


    /**
     * 初始化notelist
     * @param {int} size 大小
     */
    initNoteList(size) {
        if (this.noteList) {
            for (let i = 0; i < size; ++i) {
                this.noteList[i].destroy();
            }
        }
        this.noteList = [];     //初始化为空
    },


    /**
     * 回收所有note到对象池中
     */
    noteBack() {
        this.playAnimaMusicBackground();    //乐谱框动画
        let size = this.noteList.length;    //获取长度
        //重置noteList
        if (this.noteList) {
            for (let i = 0; i < size; ++i) {
                this.notePool.put(this.noteList[i]);
            }
        }
        this.noteList = [];
    },


    /**
     * 播放乐谱区背景框动画
     */
    playAnimaMusicBackground() {
        let anima = this.animaBackgournd.getComponent("AnimaBackground");
        anima.playAnima("musicBackground");
    },


    /**
     * 从对象池中获取一个note并放到场景中
     * @param {currNote} currNote  音符记录
     * @param {int} number 音符序号，从0开始
     * @param {int} length 一行note总个数
     */
    setNote(currNote, number, length) {
        //获取并添加到场景
        let note = this.notePool.get(currNote);
        this.node.addChild(note);
        this.noteList.push(note);
        //摆放
        note.setPosition(this.getPosition(number, length));  //位置
    },


    /**
     * 获取放置note的位置坐标，以Canvas为相对对象
     * @param {int} number 第几个，从0开始
     * @param {int} length 一行总个数
     */
    getPosition(number, length) {
        /**
         * start 乐谱区起始x坐标
         * end 乐谱区结束x坐标
         * total 乐谱区总长
         */
        let start = -225, end = 225, total = 450;
        let y = 65, x = -225 + total / (length + 1) * (number + 1);
        return (cc.v2(x, y));
    },


    /**
     * 初始化note对象池
     * @param {int} size 对象池大小
     */
    initNotePool(size) {
        this.notePool = new cc.NodePool("Note");
        for (let i = 0; i < size; ++i) {
            let note = cc.instantiate(this.notePrefab);
            this.notePool.put(note);
        }
    },


    /**
     * 根据currNote播放相应音效
     * @param {currNote} currNote 当前音乐记录
     */
    playAudio(currNote) {
        let num = this.noteNameToNum(currNote.note);
        switch (currNote.type) {
            case noteType.CLICK:
            case noteType.PRESSH:
                break;
            case noteType.PRESSB:
                return;
        }
        cc.audioEngine.stopAllEffects();        //停止之前播放的音效
        cc.audioEngine.playEffect(this.audio[num], false);
    },


    /**
     * 显示tips提示字
     * @param {int} noteNum 音符序号0-6
     */
    /* onTips(noteNum) {
         this.node.getChildByName("centerTaiji").getComponent("CenterTaiji").onTips(noteNum);
     },*/


    /**
     * 不显示tips
     */
    /*  offTips() {
          this.node.getChildByName("centerTaiji").getComponent("CenterTaiji").offTips();
      },*/


    /**
     * 设置currNote
     * @param {int} musicNum 乐谱小节序号
     * @param {int} noteNum 小节内当前要设置的音符序号
     * @param {currNote} currNote 要设置的音符记录
     */
    setCurrNote(musicNum, noteNum, currNote) {
        //不是延音符
        if (this.music.music[musicNum][noteNum] != '-') {
            currNote.note = this.music.music[musicNum][noteNum]; //更换音符记录
            //判断是否是延音区域的头部
            if (noteNum < 7) {
                //后面是延音符，则当前是延音区域头部
                if (this.music.music[musicNum][noteNum + 1] == '-')
                    currNote.type = noteType.PRESSH;
                else currNote.type = noteType.CLICK;
            }
            //最后一个音符了，这个情况一定是CLICK类型
            else currNote.type = noteType.CLICK;
        }
        //是延音符
        else currNote.type = noteType.PRESSB;    //不需要更换音符记录，直接记录类型
    },


    /**
     * 播放指定类型type和音符note对应的npc动作
     * @param {activeType} type 动作类型
     * @param {char} note 音符对应名
     */
    npcActive(type, note = 'h') {
        let num = this.noteNameToNum(note);
        //播放动画
        this.node.getChildByName("npc").getComponent("Npc").playAnima(this.speed, type, num);
        //根据this.tips和activeType判断是否激活提示字
        //if (this.tips && type == activeType.POSTURE) this.onTips(num);
    },

    /**
     * 转换动画速度
     * @param {int} BPM 120为基准
     * @returns speed
     */
    speedSwitch(BPM) {
        return BPM / 120;
    },


    /**
     * 转换音符效果持续时间，标准为0.5
     * @param {number} speed 标准为1
     * @param {int} length 一行的音符数，8个为基准
     * @returns noteTime
     */
    noteTimeSwtich(speed, length) {
        return 4.5 / (speed * (length + 1));    //0.5*(8+1) / (speed * (length+1))
    },


    /**
     *初始化存放7个音符按钮节点的数组列表 
     */
    initNoteBTList() {
        if (this.noteBTList) {
            for (let i = 0; i < 7; ++i) {
                this.noteBTList[i].destroy();
            }
        }
        this.noteBTList = [];   //七个
    },


    /**
     * 绘制7个音符按钮
     */
    drawNoteBT() {
        let centerX = 270, centerY = 220, radius = 160; //音符区中心坐标及半径
        let radian = 0; //旋转角度参数
        let background = this.node.getChildByName("background");

        //do~xi
        for (let number = 0; number < 7; ++number, radian += 2 * Math.PI / 7) {
            this.noteBTList.push(cc.instantiate(this.noteBTPrefab));   //复制创建一个noteBT实例
            background.addChild(this.noteBTList[number]);    //添加
            //位置
            this.noteBTList[number].setPosition(cc.v2(centerX + radius * Math.sin(radian), centerY + radius * Math.cos(radian)));
            this.noteBTList[number].getComponent('NoteBT').set(number);  //初始化noteBT
        }
    },


    /**
     * 初始化数据
     */
    initData() {
        let currentLevelInfo = JSON.parse(cc.sys.localStorage.getItem('currentLevelInfo'));//获取当前关卡信息
        this.level = currentLevelInfo['level'];     //第几关
        this.score = 0;         //分数清空

        this.music = require("music" + this.level);  //读取乐谱
        this.scale = scaleType.MIDDLE;         //音阶初始化为中音
        this.speed = this.speedSwitch(this.music.BPM); //关卡速度
        this.noteTime = this.noteTimeSwtich(this.speed, this.music.length);   //一个音符的持续时间
        this.musicNum = 0;  //乐谱小节序号，初始0
        this.playerNoteNum = 0;
        this.judgeSize = 30;    //判定区域大小，设置为30像素
        //this.tips = true;

        //npc音符记录
        this.npcCurrNote = {
            type: noteType.CLICK,
            note: 'h',
            scale: scaleType.MIDDLE,
        };
        //player音符记录
        this.playerCurrNote = {
            type: noteType.CLICK,
            note: 'h',
            scale: scaleType.MIDDLE,
        };

        //记录乐谱区框需要进行动画的Node
        this.animaBackgournd = cc.find("Canvas/background/musicBackground/animaBackground");
        //记录judgeLine的node
        this.judgeLine = this.node.getChildByName("judgeLine");
    },

    noteNameToNum(note) {
        let a = note.charCodeAt();
        return (a - 97) % 7;
    },
});
