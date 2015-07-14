MainGame = function ()
{

}

MainGame.prototype =
{
	_game: null,
	_logo: null,
	_level: null,
	_keyboard: null,
	_CAMERAVERTICALSPEED: 3,
	_CAMERAHORIZONTALSPEED: 3,

	init: function (width, height)
	{
		this._game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: this._preload.bind(this), create: this._create.bind(this), update: this._update.bind(this), render: this._render.bind(this) });
		this._level = new MainGame.Level(this, 100, 100, 64, 64);
	},

	_preload: function ()
	{
		this._game.load.spritesheet('ground', '../Content/Images/Games/PhaserTest/terrain_1.png', 32, 32);
	},

	_create: function ()
	{
		//this._logo = this._game.add.sprite(this._game.world.centerX, this._game.world.centerY, 'ground');
		//this._logo.animations.add('left', [0, 1, 2, 3, 4, 5], 10, true);
		//this._logo.anchor.setTo(0.5, 0.5);
		this._game.world.setBounds(-100, -100, 5100, 5100);
		this._level.set_randomGround();
		this._keyboard = this._game.input.keyboard.createCursorKeys();
		this._game.camera.setSize(800, 600);
	},

	_update: function ()
	{
		var d = 0.1;
		//this._logo.animations.play('left');
		if (this._keyboard.up.isDown)
		{
			this._game.camera.y -= this._CAMERAVERTICALSPEED;
		}
		if (this._keyboard.down.isDown)
		{
			this._game.camera.y += this._CAMERAVERTICALSPEED;
		}
		if (this._keyboard.left.isDown)
		{
			this._game.camera.x -= this._CAMERAVERTICALSPEED;
		}
		if (this._keyboard.right.isDown)
		{
			this._game.camera.x += this._CAMERAVERTICALSPEED;
		}
	},

	_render: function ()
	{
		this._game.debug.cameraInfo(this._game.camera, 32, 32);
	},

	get_phaserGame: function get_phaserGame()
	{
		return this._game;
	}
}

MainGame.Level = function (game, w, h, cellW, cellH)
{
	this._mainGame = game;
	this._w = w;
	this._h = h;
	this._cellW = cellW;
	this._cellH = cellH;
}

MainGame.Level.prototype =
{
	_mainGame: null,
	_w: null,
	_h: null,
	_cellW: null,
	_cellH: null,
	_ground: null,
	_currentSelectedCell: null,

	set_randomGround: function set_randomGround()
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

	_onMouseDown: function _onMouseDown(sprite, pointer)
	{
		if (pointer.button === 2)
		{
			this._currentSelectedCell = { x: sprite.x / this._cellW, y: sprite.y / this._cellH };
			console.log("x:" + this._currentSelectedCell.x + " y:" + this._currentSelectedCell.y);
		}
	},

	_createBuildContextMenu: function _createBuildContextMenu()
	{
		var frameNum = 7;
		for(var i=0;i<frameNum;i++)
		{
			
		}
	}
}