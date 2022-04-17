'use strict';
// 参考・素材サイト
// 効果音:https://umipla.com/shootin
// ロケット:https://frame-illust.com/?p=9823
// 参考(全体):https://original-game.com/enchantjs-gunshooting-game/
// 参考(life-bar):https://web-breeze.net/life-gauge/
enchant();

let game;
let pad;
let player;
let enemy;
let bullet;
let imaiku;
let SpriteList = [];
let score = 0;
let stage = 1;
let imaiku_push = 0;
let life = 200;
let max_life = 200;
let stage_max_speed = 1;
let stage_max_hp = 1;
let right_enemy = false;
let left_enemy = false;
const HPlabel = document.getElementById('hp')
const SCORElabel = document.getElementById('score')
const STAGElabel = document.getElementById('stage');
const lifeBar = document.getElementById('life-bar');
const lifeMark = document.getElementById('life-mark');
lifeBar.style.width = "100%";

Array.prototype.remove = function(elm) {
    let index = this.indexOf(elm);
    this.splice(index,1);
    return this;
}

addEventListener( 'load', function() {
    game = new Game(250,250); //作成
    game.preload(
        "img/rocket-r1.png",
        "img/rocket-r2.png",
        "img/rocket-r3.png",
        "img/creeper-mini.png",
        "img/circle.png",
        "img/imaiku.png",
        "img/imaiku_gun.png"
        );

        game.addEventListener('load', function() {
            game.pushScene(game.gamestartScene()) //シーン追加
        });

        // gamestartscene
        game.gamestartScene = function(){
            let scene = new Scene();
            scene.backgroundColor= "black";

            let titleLabel = new Label('NoNICK Shooting');
            titleLabel.color = "white";
            titleLabel.font ="32px 'Bebas Neue', sans-serif";
            titleLabel.moveTo(40,70);
            scene.addChild(titleLabel);

            let discriptionLabel = new Label('Tap to start');
            discriptionLabel.color = "white";
            discriptionLabel.moveTo(70,200);
            discriptionLabel.font ="26px 'Bebas Neue', sans-serif";
            scene.addChild(discriptionLabel);

            // start
            scene.addEventListener('touchstart',startGame);
            function startGame(){
                game.replaceScene(game.mainScene());
            }

            return scene;
        }

        // main Scene
        game.mainScene = function(){
            let scene =new Scene();
            scene.backgroundColor = "black";
            // scene.backgroundColor = "rgba( 255, 42, 53, 0.5)";

            //プレイヤー作成
            player = new Player();
            SpriteList.push(player);

            scene.onenterframe = function(){
                // 体力修正
                player.hp = Math.floor(player.hp * Math.pow( 10, 2 ) ) / Math.pow( 10, 2 )
                // UI
                HPlabel.textContent = "HP: " + player.hp;
                SCORElabel.textContent = "SCORE:" + score;
                STAGElabel.textContent = "STAGE:" + stage;

                //敵キャラ作成
                if(game.frame % 7 === 0) {
                    enemy = new Enemy(
                        Math.floor(Math.random() * stage_max_hp) + 1,
                        Math.floor(Math.random() * stage_max_speed) + 1
                    );
                    SpriteList.push(enemy);
                }
                // 右から
                if (game.frame % 30 === 0){
                    if(right_enemy){
                        enemy = new Right_enemy(
                            Math.floor(Math.random() * stage_max_hp) + 1,
                            Math.floor(Math.random() * stage_max_speed) + 1
                        );
                        SpriteList.push(enemy);
                    }
                }
                // 左から
                if (game.frame % 40 === 0){
                    if(left_enemy){
                        enemy = new Left_enemy(
                            Math.floor(Math.random() * stage_max_hp) + 1,
                            Math.floor(Math.random() * stage_max_speed * -1) + -1
                        );
                        SpriteList.push(enemy);
                    }
                }
                // 弾作成
                if(game.frame % 13 === 0){
                    bullet = new Bullet();
                    SpriteList.push(bullet);
                }
                // 表示
                for (let i = 0; i < SpriteList.length; i++) {
                    scene.addChild(SpriteList[i])
                }

                // life&Timer
                alterLife(-1);

                // ステージごとの処理
                if(life==0) {
                    stage++;

                    // ステージごとの処理
                    switch (stage) {
                        case 2:
                            stage_max_hp = 2;
                            max_life = 500;
                            break;

                        case 3:
                            stage_max_speed = 2;
                            stage_max_hp = 3;
                            max_life = 700;
                            break;

                        case 5:
                            stage_max_speed = 3;
                            stage_max_hp = 5;
                            right_enemy = true;
                            break;

                        case 10:
                            left_enemy = true;
                            break;

                        default:
                            break;
                    }

                    life = max_life;
                }

            }

            // imaiku作成
            imaiku = new Imaiku
            imaiku.addEventListener(enchant.Event.TOUCH_START, function() {
                imaiku_push=1;
                imaiku.moveTo(60,100);

                let imaiku_gun = new Imaiku_gun;
                scene.addChild(imaiku_gun);

                setTimeout(function(){
                    imaiku.moveTo(60,-100);
                },30000)
            });

            setTimeout(function(){
                imaiku.moveTo(60,-100);
            },10000)
            scene.addChild(imaiku);

            // パッド作成
            pad = new APad();
            pad.x=10;
            pad.y=140;
            scene.addChild(pad);
            return scene;
        }

        // Gameoverscene
        game.gameoverScene = function(){
            let scene = new Scene();
            scene.backgroundColor ="black";
            let gameoverlabel = new Label('GAME OVER');
            gameoverlabel.color = "white";
            gameoverlabel.font ="32px 'Bebas Neue', sans-serif";
            gameoverlabel.moveTo(65,130);
            scene.addChild(gameoverlabel);

            return scene
        }
        game.start(); //スタート
    } );

let Player = Class.create(Sprite,{
    initialize: function() {
        // 初期化処理
        this.hp = 5;
        Sprite.call(this,25,40);
        this.image = game.assets['img/rocket-r1.png'];
        this.speed = 8;
        this.moveTo(110, 180);
    },
    onenterframe: function() {
        //毎フレームごとの処理

        //移動
        if(game.input.left){
            this.x -= this.speed;
            this.image = game.assets['img/rocket-r2.png']
        }
        if(game.input.right){
            this.x += this.speed;
            this.image = game.assets['img/rocket-r3.png']
        }
        if(game.input.up){
            this.y -= this.speed;
            this.image = game.assets['img/rocket-r1.png']
        }
        if(game.input.down){
            this.y += this.speed;
            this.image = game.assets['img/rocket-r1.png']
        }
        if(pad.isTouched){
            this.x += pad.vx * this.speed;
            this.y += pad.vy * this.speed;
            if(pad.vx > 0){
                this.image = game.assets['img/rocket-r3.png']
            }
            if(pad.vx < 0){
                this.image = game.assets['img/rocket-r2.png']
            }
            if(pad.vy != 0){
                this.image = game.assets['img/rocket-r1.png']
            }
        }
        // 行動範囲
        if(this.x < 0) this.x = 0;
        if(this.x > 225) this.x = 225;
        if(this.y < 20) this.y = 20;
        if(this.y > 210) this.y = 210;

        // 当たり判定
        for (let i = 0; i < SpriteList.length; i++) {
            let sprite = SpriteList[i];
            if(sprite === bullet || sprite === this) continue;
            if(this.within(sprite,20)){
                this.moveTo(110,180)
                this.hp--;
            }
        }

        // ゲームオーバー
        if(player.hp <= 0){
            game.replaceScene(game.gameoverScene());
            HPlabel.textContent = "HP: 0"
        }
    }
} );

let Enemy = Class.create(Sprite,{
    initialize: function(hp,speed){
        this.hp = hp;
        this.speed = speed;
        Sprite.call(this, 40, 40);
        this.image = game.assets['img/creeper-mini.png'];
        this.moveTo(Math.random() * 280 - 10, -10);
    },
    onenterframe: function(){
        this.y += this.speed;

        if (this.y > 240 || this.hp === 0) {
            this.parentNode.removeChild(this);
            SpriteList.remove(this);
        }
    }
});

let Right_enemy = Class.create(Sprite,{
    initialize:function(hp,speed){
        this.hp = hp;
        this.speed = speed;
        Sprite.call(this, 40, 40);
        this.image = game.assets['img/creeper-mini.png'];
        this.moveTo(-10, Math.random() * 280 - 10);
    },
    onenterframe: function(){
        this.x += this.speed;

        if (this.x > 240 || this.hp === 0) {
            this.parentNode.removeChild(this);
            SpriteList.remove(this);
        }
    }
})

let Left_enemy = Class.create(Sprite,{
    initialize:function(hp,speed){
        this.hp = hp;
        this.speed = speed;
        Sprite.call(this, 40, 40);
        this.image = game.assets['img/creeper-mini.png'];
        this.moveTo(280, Math.random() * 280 - 10);
    },
    onenterframe: function(){
        this.x += this.speed;

        if (this.x < -240 || this.hp === 0) {
            this.parentNode.removeChild(this);
            SpriteList.remove(this);
        }
    }
})

let Bullet = Class.create( Sprite, {
    initialize: function() {
        this.existence = 1;
        let bulletX;
        let bulletY;
        Sprite.call( this, 12, 12);
        this.image = game.assets['img/circle.png'];
        this.speed = -5;

        bulletX = player.x + 7;
        bulletY = player.y - 20;
        this.moveTo(bulletX,bulletY);	//弾の位置
    },
    onenterframe: function() {
        this.y += this.speed;

        if (this.y < 0 || this.existence === 0) {
            this.parentNode.removeChild(this);
            SpriteList.remove(this);
        }

        //当たり判定
        for (let i = 0; i < SpriteList.length; i++) {
            let sprite = SpriteList[i];
            if(sprite === player || sprite === this) continue;
            if(this.intersect(sprite)){
                sprite.hp--;
                this.existence = 0;
                score += 200;
            }
        }
    }
} );

let Imaiku = Class.create(Sprite, {
    initialize:function(){
        Sprite.call(this,340,340);
        this.scaleX= 0.1;
        this.scaleY= 0.1;
        this.image = game.assets['img/imaiku.png'];
        this.moveTo(60,100);
    }
})

let Imaiku_gun = Class.create(Sprite, {
    initialize:function(){
        Sprite.call(this,340,340);
        this.speed = -6;
        this.image = game.assets['img/imaiku_gun.png'];
        let gunX;
        let gunY;
        gunX = player.x - 156;
        gunY = player.y;
        this.moveTo(gunX,gunY);
    },
    onenterframe :function(){
        this.y += this.speed;

        if (this.y < -300) {
            this.parentNode.removeChild(this);
            SpriteList.remove(this);
        }

        for (let i = 0; i < SpriteList.length; i++) {
            let sprite = SpriteList[i];
            if(sprite === player || sprite === this) continue;
            if(this.intersect(sprite)){
                sprite.hp --;
                player.hp += 0.01;
                score += 200;
            }
        }
    }
})

function alterLife(value){
    life += value;
    if(life <= 0){
        life = 0
    }
    lifeBar.style.width = life / max_life * 100 + "%";

}

