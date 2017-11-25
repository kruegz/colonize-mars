import Phaser from 'phaser';


export class Player{
    constructor(id, name, game, x, y, walking = false){
        this.id = id;
        this.game = game;
        this.name = name;

        // Add sprite
        this.sprite = this.game.add.sprite(0, 0, 'astronaut');
        this.sprite.animations.add('walk', [0, 1, 2], 8, true);

        this.game.physics.arcade.enable(this.sprite);
        this.sprite.body.collideWorldBounds = true;

        this.sprite.inputEnabled = true;

        this.sprite.anchor.setTo(0.5,0.5);
        this.sprite.x = x;
        this.sprite.y = y;

        this.label = game.add.text(0, 0, this.name, { font: "10px Arial",  align: "center" });
        this.label.anchor.setTo(0.5, 1.6);

        this.sprite.addChild(this.label);
        

        this.walking = false;


        this.sprite.body.allowRotation = false;
    }

    update(){

        //console.log(this.id, this.sprite.x, this.sprite.y, this.destX, this.destY);

        // If moving towards destination, walk
        if (this.walking)
        {
            this.sprite.animations.play('walk');

            // If going left, face left
            if (this.sprite.x > this.destX)
            {
                this.sprite.scale.x = -1;
                this.label.scale.x = this.sprite.scale.x;
            }
            else
            {
                this.sprite.scale.x = 1;
                this.label.scale.x = this.sprite.scale.x;
            }
        }
        else
        {
            this.sprite.animations.stop();
            this.sprite.frame = 0;
        }

    }

    setX(x){
        this.sprite.x = x;
        return this;
    }

    setY(y){
        this.sprite.y = y;
        return this;
    }

    setWalking(walking)
    {
        this.walking = walking;
        return this;
    }

    setName(name)
    {
        this.name = name;
        this.label.destroy();
        this.sprite.removeChild(this.label);
        this.label = this.game.add.text(0, 0, this.name, { font: "10px Arial",  align: "center" });
        this.label.anchor.setTo(0.5, 1.6);

        this.sprite.addChild(this.label);
        return this;
    }
    

}

export class MainPlayer extends Player {

    constructor(id, name, game, x, y){
        super(id, name, game, x, y);
        
        this.destX = x;
        this.destY = x;
    }


    update() {

        // Fix close enough to destination
        if (Math.abs(this.sprite.x - this.destX) < 1 && Math.abs(this.sprite.y - this.destY) < 1)
        {
            this.sprite.x = this.destX;
            this.sprite.y = this.destY;
        }

        super.update();

        //marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
        //marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;



        
        if (this.sprite.x != this.destX || this.sprite.y != this.destY)
        {
            this.game.physics.arcade.moveToXY(this.sprite, this.destX, this.destY);
            this.walking = true;
        }
        else
        {
            this.walking = false;
        }
        

        
    }

    setDestX(x) {
        this.destX = x;
        return this;
    }
    
    setDestY(y) {
        this.destY = y;
        return this;
    }

}
