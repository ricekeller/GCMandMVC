﻿MainGame = function ()
{

}

MainGame.prototype =
{
	_game: null,
	_logo: null,
	_level: null,
	_map: null,
	_keyboard: null,
	_previousKeyboard: null,
	_player: null,
	_CAMERAVERTICALSPEED: 3,
	_CAMERAHORIZONTALSPEED: 3,
	_WORLDBOUNDS: { x1: -200, y1: -200, x2: 5100, y2: 5100 },

    layer1:null,
	layer2: null,


	init: function (width, height)
	{
		this._game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: this._preload.bind(this), create: this._create.bind(this), update: this._update.bind(this), render: this._render.bind(this) });
		this._level = new MainGame.Level(this._game, 100, 100, 64, 64);
	},

	_preload: function ()
	{
		this._game.load.tilemap('terrain', '../Content/Images/Games/PhaserTest/1-1.json', null, Phaser.Tilemap.TILED_JSON);
		this._game.load.image('terrain_image', '../Content/Images/Games/PhaserTest/1-1.jpg');
		this._game.load.image('terrain_tiles', '../Content/Images/Games/PhaserTest/empty.png');
		//this._game.load.spritesheet('ground', '../Content/Images/Games/PhaserTest/terrain_1.png', 32, 32);
		this._game.load.spritesheet('player', '../Content/Images/Games/PhaserTest/player1.png', 32, 64);
	},

	_create: function ()
	{
		this._game.physics.startSystem(Phaser.Physics.ARCADE);
		this._game.camera.setSize(800, 600);
		this._keyboard = this._game.input.keyboard.createCursorKeys();
		this._previousKeyboard = { up: false, down: false, left: false, right: false };
		this._level.init();

		//alway added last so it is displayed on top of others
		var playerFPS = 10;
		var playerSprite = this._game.add.sprite(0, 0, 'player');
		playerSprite.anchor.setTo(0.5, 0.5);
		playerSprite.scale.setTo(1, 0.75);
		playerSprite.animations.add('up', [4, 5, 6, 7], playerFPS, true);
		playerSprite.animations.add('down', [0, 1, 2, 3], playerFPS, true);
		playerSprite.animations.add('left', [12, 13, 14, 15], playerFPS, true);
		playerSprite.animations.add('right', [8, 9, 10, 11], playerFPS, true);
		this._game.physics.enable(playerSprite);
		playerSprite.body.collideWorldBounds = true;
		this._player = new MainGame.Characters.Player(this._game, playerSprite);
		this._player.bindCamera(this._game.camera);
	},

	_update: function ()
	{
		this._game.physics.arcade.collide(this._player._sprite, this._level.get_itemsLayer());
		
		if ((this._keyboard.up.isUp && this._previousKeyboard.up) || (this._keyboard.down.isUp && this._previousKeyboard.down))
		{
		    this._player.clearSpeed('y');
		}
		if ((this._keyboard.left.isUp && this._previousKeyboard.left) || (this._keyboard.right.isUp && this._previousKeyboard.right))
		{
		    this._player.clearSpeed('x');
		}
		var dirs = ['up', 'down', 'left', 'right'];
		for (var dir = 0; dir < dirs.length; dir++)
		{
			this._previousKeyboard[dirs[dir]] = this._keyboard[dirs[dir]].isDown;
		}

		if (this._keyboard.up.isDown)
		{
			this._player.move('up');
		}
		if (this._keyboard.down.isDown)
		{
			this._player.move('down');
		}
		if (this._keyboard.left.isDown)
		{
			this._player.move('left');
		}
		if (this._keyboard.right.isDown)
		{
			this._player.move('right');
		}
	},

	_render: function ()
	{
		this._game.debug.cameraInfo(this._game.camera, 32, 32);
		this._game.debug.bodyInfo(this._player._sprite, 32, 320);
	},

	get_phaserGame: function get_phaserGame()
	{
		return this._game;
	}
}

MainGame.Level = function (game, w, h, cellW, cellH)
{
	this._game = game;
	this._w = w;
	this._h = h;
	this._cellW = cellW;
	this._cellH = cellH;
}

MainGame.Level.prototype =
{
    _game: null,
    _map: null,
    _layers:null,
	_w: null,
	_h: null,
	_cellW: null,
	_cellH: null,
	_ground: null,
	_currentSelectedCell: null,
	_buildContextMenu: null,

	init: function init(cellData)
	{
	    this._map = this._game.add.tilemap('terrain');
	    this._map.addTilesetImage('bg', 'terrain_image');
	    this._map.addTilesetImage('obstacles', 'terrain_tiles');
	    this._layers = [];
	    this._layers.push(this._map.createLayer('bg'));
	    this._layers.push(this._map.createLayer('items'));
	    
	    var currentLayer = this._layers[this._layers.length - 1];
	    currentLayer.visible = false;
	    currentLayer.debug = true;
	    currentLayer.resizeWorld();
	    this._game.camera.setBoundsToWorld();
	    this._map.setCollision(401, true, currentLayer);
	},

	get_itemsLayer:function get_itemsLayer() 
	{
	    return this._layers[this._layers.length-1];
	},

	_set_randomGround: function set_randomGround()
	{
		this._ground = [];
		for (var i = 0; i < this._h; i++)
		{
			this._ground[i] = [];
			for (var j = 0; j < this._w; j++)
			{
				this._ground[i][j] = this._mainGame.get_phaserGame().add.sprite(j * this._cellW, i * this._cellH, 'ground', Math.floor(Math.random() * 7));
				this._ground[i][j].inputEnabled = true;
				this._ground[i][j].events.onInputDown.add(this._onMouseDown, this);
				this._ground[i][j].scale.setTo(2, 2);
			}
		}
	},

	_set_cellData: function _set_cellData(data)
	{

	},

	_onMouseDown: function _onMouseDown(sprite, pointer)
	{
		var camera = this._mainGame.get_phaserGame().camera;
		if (pointer.button === 2)
		{
			this._currentSelectedCell = { x: sprite.x / this._cellW, y: sprite.y / this._cellH };
			console.log("x:" + this._currentSelectedCell.x + " y:" + this._currentSelectedCell.y);

			this._buildContextMenu.position.setTo(pointer.x + camera.x, pointer.y + camera.y);
		}
	},

	_createBuildContextMenu: function _createBuildContextMenu()
	{
		var frameNum = 7;
		var worldBounds = this._mainGame._WORLDBOUNDS;
		var tmpSprite;
		this._buildContextMenu = this._mainGame.get_phaserGame().add.group();

		for (var i = 0; i < frameNum; i++)
		{
			tmpSprite = this._mainGame.get_phaserGame().add.sprite(0, i * 32, 'ground', i + 20);
			tmpSprite.inputEnabled = true;
			tmpSprite.events.onInputDown.add(this._onBuildContextMenuClick, this);
			this._buildContextMenu.add(tmpSprite);
		}

		this._buildContextMenu.position.setTo(worldBounds.x1, worldBounds.y1);
	},

	_onBuildContextMenuClick: function _onBuildContextMenuClick(sprite, pointer)
	{
		if (pointer.button === 0)
		{
			var worldBounds = this._mainGame._WORLDBOUNDS;
			this._ground[this._currentSelectedCell.y][this._currentSelectedCell.x].frame = sprite.frame;
			this._buildContextMenu.position.setTo(worldBounds.x1, worldBounds.y1);
		}
	}
}

MainGame.Characters = MainGame.Characters || {};
MainGame.Characters.Player = function (game, sprite)
{
	this._game = game;
	this._sprite = sprite;
}

MainGame.Characters.Player.prototype =
{
	_game: null,
	_sprite: null,
	_VERTICALSPEED: 200,
	_HORIZONTALSPEED: 200,

	bindCamera: function bindCamera(camera)
	{
		camera.follow(this._sprite);
	},

	move: function move(dir)
	{
	    var vel = this._sprite.body.velocity;
		var c = dir.toLowerCase();
		switch (c)
		{
			case 'up':
				vel.y = -this._VERTICALSPEED;
				break;
			case 'down':
			    vel.y = this._VERTICALSPEED;
				break;
			case 'left':
			    vel.x = -this._HORIZONTALSPEED;
				break;
			case 'right':
			    vel.x = this._HORIZONTALSPEED;
				break;
			default:
				//shouldn't be here
		}
		this._sprite.animations.play(c);
	},

	clearSpeed: function clearSpeed(axis)
	{
	    switch(axis.toLowerCase())
	    {
	        case 'x':
	            this._sprite.body.velocity.x = 0;
	            break;
	        case 'y':
	            this._sprite.body.velocity.y = 0;
	            break;
	        default:
	            break;
	    }
	}
}