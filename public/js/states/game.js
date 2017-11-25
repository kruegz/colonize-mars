import Phaser from 'phaser';
import socketio from 'socket.io-client';
import {Player, MainPlayer} from './../player';

export default class GameState extends Phaser.State{
    constructor(){
        super();

        this.players = {};
    }

    preload(){
        this.doneLoading = 0; //this is 1 at the end of createOnConnection

        this.load.spritesheet('astronaut', '/assets/astronaut3.png', 29, 37);
        this.load.tilemap('ground', '/assets/desert_map.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', '/assets/desert_tileset.png');

    }

    create(){
        this.io = socketio.connect();
        this.io.on('connect', data=>{
            this.createOnConnection(data);
        });
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();


        // Background
        this.map = this.add.tilemap('ground');
        this.map.addTilesetImage('desert_tileset', 'tiles');

        // Rock tiles collide
        this.map.setCollision(7);
        
        this.layer = this.map.createLayer('ground');

        this.layer.resizeWorld();

        this.input.onDown.add(this.clickListener, this);

    }

    update(){

        if(this.doneLoading){
            
            for (let id in this.players)
            {
                let player = this.players[id];
                player.update();
            }
            
            this.player.update();

            this.physics.arcade.collide(this.player.sprite, this.layer);

            this.world.bringToTop(this.player.sprite);
            
            this.io.emit('client:player-moved', {
                id:this.io.id,
                name: this.player.name,
                posX: this.player.sprite.world.x,
                posY: this.player.sprite.world.y,
                walking: this.player.walking
            });
            

        }
        
        
    }

    clickListener(pointer) {
        this.player.setDestX(pointer.x + this.camera.x);
        this.player.setDestY(pointer.y + this.camera.y);
    }

    createOnConnection(data){

        console.log("ID: " + this.io.id);
        
        this.physics.startSystem(Phaser.Physics.Arcade);

        let name = prompt("Enter player name: ");
        
        // Player
        this.player = new MainPlayer(this.io.id, name, this, 100, 100);

        this.socketCreateListeners();

        this.stage.backgroundColor = '#FFF';


        this.physics.enable(this.player);

        this.camera.follow(this.player.sprite);

        this.doneLoading = 1;
    }

    socketCreateListeners(){

        //load all existing players

        this.io.on('server:all-players',data=>{ //the response
            data.forEach(e=>{
                if(e.id != this.io.id) //this will prevent loading our player two times
                {
                    this.players[e.id] = new Player(e.id, e.name, this, e.posX, e.posY, e.walking);
                }
            });
        });

        this.io.on('server:player-added',data=>{
            if (data.id != this.io.id)
            {
                console.log(`New ${data.id} added to x: ${data.posX}, y: ${data.posY}`);
                this.players[data.id] = new Player(data.id, data.name, this, data.posX, data.posY, data.walking);
            }
        });

        this.io.on('server:player-disconnected',id=>{ //if a player has disconnected
            console.log(`Player ${id} disconnected`);

            this.players[id].sprite.destroy();//phaser sprite destroy function
            delete this.players[id];
        });

        this.io.on('server:player-moved',data=>{
            if (this.players[data.id])
            {
                this.players[data.id].setName(data.name).setX(data.posX).setY(data.posY).setWalking(data.walking);
            }
        });
        
        this.io.emit('client:give-me-players'); //ask for it
    }

}
