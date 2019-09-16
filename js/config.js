/**
  * 游戏相关配置
  * @type {Object}
  */
var CONFIG = {
  status: 'start', // 游戏开始默认为开始中
  level: 1, // 游戏默认等级
  totalLevel: 6, // 总共6关
  numPerLine: 7, // 游戏默认每行多少个怪兽
  canvasPadding: 30, // 默认画布的间隔
  bulletSize: 10, // 默认子弹长度
  bulletSpeed: 10, // 默认子弹的移动速度
  monsterSpeed: 3, // 默认敌人移动距离
  monsterSize: 50, // 默认敌人的尺寸
  monsterGap: 10,  // 默认敌人之间的间距
  monsterIcon: './img/monster.png', // 怪兽的图像
  monsterBoomIcon: './img/boom.png', // 怪兽死亡的图像
  monsterDirection: 'right', // 默认敌人一开始往右移动
  planeSpeed: 7, // 默认飞机每一步移动的距离
  planeSize: {
    width: 60,
    height: 100
  }, // 默认飞机的尺寸,
  planeIcon: './img/plane.png'
};