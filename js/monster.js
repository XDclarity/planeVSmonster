/*怪兽*/
var Monster = function (opts) {
    this.opts = opts || {};

    Element.call(this, opts);
    //特有属性状态和图标
    this.status = 'normal';//normal、booming、noomed
    this.monsterIcon = opts.monsterIcon;
    this.monsterBoomIcon = opts.monsterBoomIcon;
    this.boomCount = 0;
};

inheritPrototype(Monster, Element);

//绘制怪兽
Monster.prototype.draw = function () {
    if (this.monsterIcon && this.monsterBoomIcon) {

        switch (this.status) {
            case 'normal':
                var monsterIcon = new Image();
                monsterIcon.src = this.monsterIcon;
                ctx.drawImage(monsterIcon, this.x, this.y, this.size, this.size);
                break;
            case 'booming':
                var monsterBoomIcon = new Image();
                monsterBoomIcon.src = this.monsterBoomIcon;
                ctx.drawImage(monsterBoomIcon, this.x, this.y, this.size, this.size);
                break;
            case 'boomed':
                ctx.clearRect(this.x, this.y, this.size, this.size);
                break;
            default:
                break;
        }
    }
    return this;
};

//down向下移动
Monster.prototype.down = function () {
    this.move(0, this.size);
    return this;
};
//左右移动
Monster.prototype.direction = function (direction) {
    if (direction === 'right') {
        this.move(this.speed, 0);
    } else {
        this.move(-this.speed, 0);
    }
    return this;
};
//死亡得分
Monster.prototype.booming = function () {
    this.status = 'booming';
    this.boomCount += 1;
    if (this.boomCount > 4) {
        this.status = 'boomed';
    }
    return this;
}