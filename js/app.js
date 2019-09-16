// 元素
var container = document.getElementById('game');
var levelText = document.querySelector('.game-level');
var nextLevelText = document.querySelector('.game-next-level');
var scoreText = document.querySelector('.game-info .score');
var totalScoreText = document.querySelector('.game-failed .score');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// //获取画布信息
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

//数组横向边界
function getHorizontalBoundary(array) {
  var min, max;
  array.forEach(function (item) {
    if (!min && !max) {
      min = item.x;
      max = item.x;
    } else {
      if (item.x < min) {
        min = item.x;
      }
      if (item.x > max) {
        max = item.x;
      }
    }
  });
  return {
    minX: min,
    maxX: max
  }
}

//键盘事件
var KeyBoard = function () {
  document.onkeydown = this.keydown.bind(this);
  document.onkeyup = this.keyup.bind(this);
};
//KeyBoard对象
KeyBoard.prototype = {
  pressedLeft: false,
  pressedRight: false,
  pressedUp: false,
  heldLeft: false,
  heldRight: false,
  pressedSpace: false,
  pressedEnter: false,
  keydown: function (e) {
    var key = e.keyCode;
    switch (key) {
      case 32://空格-发射子弹
        this.pressedSpace = true;
        break;
      case 37://左方向键
        this.pressedLeft = true;
        this.heldLeft = true;
        this.pressedRight = false;
        this.heldRight = false;
        break;
      case 38://上方向键-发射子弹
        this.pressedUp = true;
        break;
      case 39://右方向键
        this.pressedLeft = false;
        this.heldLeft = false;
        this.pressedRight = true;
        this.heldRight = true;
        break;
      case 13://回车键-暂停游戏
        this.pressedEnter = true;
        break;
    }
  },
  keyup: function (e) {
    var key = e.keyCode;
    switch (key) {
      case 32:
        this.pressedSpace = false;
        break;
      case 37:
        this.heldLeft = false;
        this.pressedLeft = false;
      case 38:
        this.pressedUp = false;
        break;
      case 39:
        this.heldRight = false;
        this.pressedRight = false;
        break;
      case 13:
        this.pressedEnter = false;
        break;
    }
  }
};

/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts 
   * @return {[type]}      [description]
   */
  init: function (opts) {
    //设置opts
    var opts = Object.assign({}, opts, CONFIG);//合并所有参数
    this.opts = opts;
    this.status = 'start';
    //计算飞机对象初始坐标
    this.planePosX = canvasWidth / 2 - opts.planeSize.width;
    this.planePosY = canvasHeight - opts.planeSize.height - opts.canvasPadding;
    //飞机极限坐标
    this.planeMinX = opts.canvasPadding;
    this.planeMaxX = canvasWidth - opts.canvasPadding - opts.planeSize.width;
    //计算敌人移动区域
    this.monsterMinX = opts.canvasPadding;
    this.monsterMaxX = canvasWidth - opts.canvasPadding - opts.monsterSize;
    //分数设置为0
    this.score = 0;
    this.enemies = [];
    this.keyBoard = new KeyBoard();

    this.bindEvent();
    this.renderLevel();
  },
  bindEvent: function () {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    var replayBtn = document.querySelectorAll('.js-replay');
    var nextBtn = document.querySelector('.js-next');
    var stopBtn = document.querySelector('.js-stop');
    // 开始游戏按钮绑定
    playBtn.onclick = function () {
      self.play();
    };
    //重新开始游戏按钮绑定
    replayBtn.forEach(function (e) {
      e.onclick = function () {
        self.opts.level = 1;
        self.play();
        self.score = 0;
        totalScoreText.innerText = self.score;
      };
    });
    // 下一关游戏按钮绑定
    nextBtn.onclick = function () {
      self.opts.level += 1;
      self.play();
    };
    // 暂停游戏继续按钮绑定
    stopBtn.onclick = function () {
      self.setStatus('playing');
      self.updateElement();
    };
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   * stop 游戏暂停（可选）
   */
  setStatus: function (status) {
    this.status = status;
    container.setAttribute('data-status', status);
  },
  //playing 游戏中
  play: function () {
    this.setStatus('playing');
    var opts = this.opts;
    //清空敌人
    this.enemies = [];
    //创建敌人
    this.createMonster('normal');
    console.log(this.enemies);
    //创建飞机
    this.plane = new Plane({
      x: this.planePosX,
      y: this.planePosY,
      width: opts.planeSize.width,
      height: opts.planeSize.height,
      minX: this.planeMinX,
      speed: opts.planeSpeed,
      maxX: this.planeMaxX,
      planeIcon: opts.planeIcon
    });
    this.renderLevel();
    this.updateElement();
  },
  //stop  游戏暂停
  stop: function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.setStatus('stop');
    return;
  },
  end: function (status) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.setStatus(status);
    totalScoreText.innerText = this.score;
    return;
  },
  //更新所有元素状态
  updateElement: function () {
    var self = this;
    var opts = this.opts;
    var enemies = this.enemies;
    //清理画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //绘制画布
    this.draw();

    if (enemies.length === 0) {
      if (opts.level === opts.totalLevel) {
        this.end('all-success');
      } else {
        this.end('success');
      }
      return;
    }
    if (enemies[enemies.length - 1].y >= this.planePosY - opts.monsterSize) {
      this.end('failed');
      return;
    }

    //更新元素状态
    this.updatePanel();
    this.updateEnemeis();

    //不断循环updateElement
    requestAnimationFrame(function () {
      if(self.status === 'stop'){
        return;
      }else{
        self.updateElement();
        rAF(loop);//计算FPS
      }
    });
  },
  updatePanel: function () {
    var plane = this.plane;
    var keyBoard = this.keyBoard;
    if (keyBoard.pressedEnter) {
      this.stop();
      return;
    }
    if (keyBoard.pressedLeft || keyBoard.heldLeft) {
      plane.direction('left');
    }
    if (keyBoard.pressedRight || keyBoard.heldRight) {
      plane.direction('right');
    }
    if (keyBoard.pressedUp || keyBoard.pressedSpace) {
      keyBoard.pressedUp = false;
      keyBoard.pressedSpace = false;
      plane.shoot();
    }
  },
  //更新怪兽状态
  updateEnemeis: function () {
    var opts = this.opts;
    var plane = this.plane;
    var enemies = this.enemies;
    var i = enemies.length;
    var isFall = false;//敌人下落
    var enemiesX = getHorizontalBoundary(enemies);
    if (enemiesX.minX < this.monsterMinX || enemiesX.maxX >= this.monsterMaxX) {
      console.log('enemiesX.minX', enemiesX.minX);
      console.log('enemiesX.maxX', enemiesX.maxX);
      opts.monsterDirection = opts.monsterDirection === 'right' ? 'left' : 'right';
      console.log('opts.monsterDirection', opts.monsterDirection);
      isFall = true;
    }
    //循环更新怪兽
    while (i--) {
      var monster = enemies[i];
      if (isFall) {
        monster.down();
      }
      monster.direction(opts.monsterDirection);
      switch (monster.status) {
        case 'normal':
          if (plane.hasHit(monster)) {
            monster.booming();
          }
          break;
        case 'booming':
          monster.booming();
          break;
        case 'boomed':
          enemies.splice(i, 1);
          this.score += 1;
          break;
        default:
          break;
      }
    }
  },
  //生成怪兽
  createMonster: function (monsterType) {
    var opts = this.opts;
    var level = opts.level;
    var enemies = this.enemies;
    var numPerLine = opts.numPerLine;
    var padding = opts.canvasPadding;
    var gap = opts.monsterGap;
    var size = opts.monsterSize;
    var speed = opts.monsterSpeed;
    //每升级一关敌人增加一行
    for (var i = 0; i < level; i++) {
      for (var j = 0; j < numPerLine; j++) {
        var initOpt = {
          x: padding + j * (size + gap),
          y: padding + i * (size + gap),
          size: size,
          speed: speed,
          status: monsterType,
          monsterIcon: opts.monsterIcon,
          monsterBoomIcon: opts.monsterBoomIcon
        };
        enemies.push(new Monster(initOpt));
      }
    }
    return enemies;
  },
  draw: function () {
    this.renderScore();
    this.plane.draw();
    this.enemies.forEach(function (monster) {
      monster.draw();
    });
  },
  renderLevel: function () {
    levelText.innerText = '当前Level：' + this.opts.level;
    nextLevelText.innerText = '下一Level：' + (this.opts.level + 1);
  },
  renderScore: function () {
    scoreText.innerText = this.score;
  }
};


// 初始化
GAME.init(CONFIG);
