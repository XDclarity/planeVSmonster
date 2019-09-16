/*飞机*/
var Plane = function (opts) {
    this.opts = opts || {};
    //调用父类方法
    Element.call(this, opts);
    //属性、图标
    this.status = 'normal';
    this.width = opts.width;
    this.height = opts.height;
    this.planeIcon = opts.planeIcon;
    this.minX = opts.minX;
    this.maxX = opts.maxX;
    //子弹相关
    this.bullets = [];
    this.bulletSpeed = opts.bulletSpeed || CONFIG.bulletSpeed;
    this.bulletSize = opts.bulletSize || CONFIG.bulletSize;
};

inheritPrototype(Plane, Element);

//子弹击中
Plane.prototype.hasHit = function (monster) {
    var bullets = this.bullets;
    for (var i = bullets.length - 1; i >= 0; i--) {
        var bullet = bullets[i];
        var isHitPosX = (monster.x < bullet.x) && (bullet.x < (monster.x + monster.size));
        var isHitPosY = (monster.y < bullet.y) && (bullet.y < (monster.y + monster.size));
        if (isHitPosX && isHitPosY) {
            this.bullets.splice(i, 1);
            return true;
        }
    }
    return false;
};

//绘制飞机
Plane.prototype.draw = function () {
    this.drawBullets();
    var planeIcon = new Image();
    planeIcon.src = this.planeIcon;
    ctx.drawImage(planeIcon, this.x, this.y, this.width, this.height);
    return this;
};
//飞机移动方向
Plane.prototype.direction = function (direction) {
    var speed = this.speed;
    var planeSpeed;
    if (direction === 'left') {
        planeSpeed = this.x < this.minX ? 0 : -speed;
    } else {
        planeSpeed = this.x > this.maxX ? 0 : speed;
    }
    console.log('planeSpeed:', planeSpeed);
    console.log('this.x:', this.x);
    console.log('this.minX:', this.minX);
    console.log('this.maxX:', this.maxX);
    this.move(planeSpeed, 0);
    return this;//方便链式调用
};
//发射
Plane.prototype.shoot = function () {
    var bulletPosX = this.x + this.width / 2;
    this.bullets.push(new Bullet({
        x: bulletPosX,
        y: this.y,
        size: this.bulletSize,
        speed: this.bulletSpeed
    }));
    return this;
};
//绘制子弹
Plane.prototype.drawBullets = function () {
    var bullets = this.bullets;
    var i = bullets.length;
    while (i--) {
        var bullet = bullets[i];
        bullet.moveForward();
        if (bullet.y <= 0) {
            bullets.splice(i, 1);
        }
        bullet.draw();
    }
};