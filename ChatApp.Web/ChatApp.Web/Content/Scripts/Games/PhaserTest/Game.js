MainGame = function ()
{

}

MainGame.prototype =
{
	_game: null,
	_msgProcessor: null,
	_logo: null,
	_level: null,
	_map: null,
	_keyboard: null,
	_previousKeyboard: null,
	_player: null,
	_gui: null,
	_CAMERAVERTICALSPEED: 3,
	_CAMERAHORIZONTALSPEED: 3,
	_WORLDBOUNDS: { x1: -200, y1: -200, x2: 5100, y2: 5100 },

	layer1: null,
	layer2: null,


	init: function (width, height)
	{
		this._game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: this._preload.bind(this), create: this._create.bind(this), update: this._update.bind(this), render: this._render.bind(this) });
		this._msgProcessor = new MainGame.MessageProcessor(this);
		this._level = new MainGame.Level(this._game, 100, 100, 48, 48);
		this._gui = new MainGame.GUI(this);
	},

	_preload: function ()
	{
		this._game.load.tilemap('terrain', '../Content/Images/Games/PhaserTest/1-1.json', null, Phaser.Tilemap.TILED_JSON);
		this._game.load.image('terrain_image', '../Content/Images/Games/PhaserTest/1-1.jpg');
		this._game.load.image('terrain_tiles', '../Content/Images/Games/PhaserTest/empty.png');
		this._game.load.spritesheet('all_pack', '../Content/Images/Games/PhaserTest/terrain_1.png', 32, 32);
		this._game.load.spritesheet('player', '../Content/Images/Games/PhaserTest/player1.png', 32, 64);
		this._game.load.spritesheet('btn_rightpanel', '../Content/Images/Games/PhaserTest/btn_rightpanel.png', 142, 28);
		this._game.load.spritesheet('bg_rightpanel', '../Content/Images/Games/PhaserTest/bg_rightpanel.png', 192, 16);
		this._game.load.image('dialogbox', '../Content/Images/Games/PhaserTest/dialog_box.png');
		this._game.load.image('status_bar', '../Content/Images/Games/PhaserTest/EmptyBar.png');
		this._game.load.image('hp_icon', '../Content/Images/Games/PhaserTest/heart.png');
	},

	_create: function ()
	{
		this._game.physics.startSystem(Phaser.Physics.ARCADE);
		this._game.camera.setSize(960, 600);
		this._keyboard = this._game.input.keyboard.createCursorKeys();
		this._previousKeyboard = { up: false, down: false, left: false, right: false };
		this._level.init();
		this._gui.init();

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
		this._player = new MainGame.Characters.Player(this, playerSprite);
		this._player.bindCamera(this._game.camera);
	},

	_update: function ()
	{
		this._msgProcessor.update();
		this._player.update();
		this._gui.update();
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

	addMsg: function addMsg(msg, data)
	{
		this._msgProcessor.addMsg(msg, data);
	},

	subscribe: function subsribe(msg, handler, context)
	{
		this._msgProcessor.subscribe(msg, handler, context);
	},

	get_phaserGame: function get_phaserGame()
	{
		return this._game;
	},

	get_level: function get_level()
	{
		return this._level;
	},

	get_player: function get_player()
	{
		return this._player;
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
	_layers: null,
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

	get_itemsLayer: function get_itemsLayer()
	{
		return this._layers[this._layers.length - 1];
	},

	get_bgLayer: function get_bgLayer()
	{
		return this._layers[0];
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
	this._hookupEvent();
	//this._game.subscribe(MainGame.Message.MouseClicked, this._onMouseDown, this);
}

MainGame.Characters.Player.prototype =
{
	_game: null,
	_sprite: null,
	_posTile: {},
	_selected: null,
	_infoDisplay: null,
	_VERTICALSPEED: 200,
	_HORIZONTALSPEED: 200,
	_name: 'test',
	_level: 1,
	_exp: 0,
	_hp: 1,
	_fullHP: 1,
	_mp: 1,
	_fullMP: 1,
	_attackPower: 1,
	_defensePower: 1,

	bindCamera: function bindCamera(camera)
	{
		camera.follow(this._sprite);
	},

	update: function update()
	{
		this._updatePosition();
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
		switch (axis.toLowerCase())
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
	},

	get_posTile: function get_posTile()
	{
		return this._posTile;
	},

	_updatePosition: function _updatePosition()
	{
		var layer = this._game.get_level().get_bgLayer();
		this._posTile = { x: layer.getTileX(this._sprite.world.x), y: layer.getTileY(this._sprite.world.y) }
	},

	_hookupEvent: function _hookupEvent()
	{
		this._sprite.inputEnabled = true;
		this._sprite.events.onInputDown.add(this._onMouseDown, this);
		this._sprite.events.onInputUp.add(this._onMouseUp, this);
		this._sprite.events.onInputOver.add(this._onMouseOver, this);
		this._sprite.events.onInputOut.add(this._onMouseOut, this);
	},

	_onMouseDown: function _onMouseDown(sprite, event)
	{
		//if (msg === MainGame.Message.MouseClicked)
		//{
		//	if (data.x === this._posTile.x && data.y === this._posTile.y)
		//	{
		//		this._selected = true;
		//	}
		//	else
		//	{
		//		this._selected = false;
		//	}
		//}
		this._selected = true;
		console.log(this._selected);
	},

	_onMouseUp: function _onMouseUp(sprite, event)
	{

	},

	_onMouseOver: function _onMouseOver(sprite, event)
	{
		//if (!this._selected)
		//{
		//	this._generateInfoDisplay();
		//	this._infoDisplay.visible = true;
		//}
		//console.log('over');
		this._game.addMsg(MainGame.Message.MouseOverCharacter, {
			name: this._name, level: this._level, hp: this._hp,
			mp: this._mp, pos: { x: this._sprite.x, y: this._sprite.y },
			fullHP: this._fullHP, fullMP: this._fullMP
		});
	},

	_onMouseOut: function _onMouseOut(sprite, event)
	{
		//if (!this._selected && this._infoDisplay)
		//{
		//	this._infoDisplay.visible = false;
		//}
		this._game.addMsg(MainGame.Message.MouseOutCharacter);
	}
}

/**
 * This class holds all GUI elements in game.
 */
MainGame.GUI = function (game)
{
	this._mainGame = game;
}
MainGame.GUI.prototype =
{
	_mainGame: null,
	_marker: null,
	_currentSelectedMarker: null,
	_rightPanel: null,
	_rightPanelToggleButton: null,
	_rightPanelContainer: null,
	_isCursorOnGUI: null,
	_characterInfo: null,
	_characterInfoText: null,
	_characterInfoHPBar: null,
	_characterInfoHPBarText: null,
	_characterInfoMPBar: null,
	_characterInfoMPBarText: null,


	init: function init()
	{
		//moving marker
		this._marker = this._createMarker(2, 0x00ff00, 1, 0, 0, 48, 48);
		//right panel group
		this._rightPanel = this._mainGame.get_phaserGame().add.group();
		this._rightPanel.fixedToCamera = true;
		this._rightPanel.cameraOffset.setTo(800, 0);
		//right panel toggle button
		this._rightPanelToggleButton = this._mainGame.get_phaserGame().add.sprite(0, 0, 'btn_rightpanel');
		this._rightPanelToggleButton.animations.add('mousedown', [0, 1, 2, 3], 10, false);
		this._rightPanelToggleButton.animations.add('mouseup', [3, 2, 1, 0], 10, false);
		this._bindMoveEvent(this._rightPanelToggleButton);
		this._rightPanelToggleButton.events.onInputDown.add(this._onRightPanelToggleButtonDown, this);
		this._rightPanelToggleButton.events.onInputUp.add(this._onRightPanelToggleButtonUp, this);
		this._rightPanelToggleButton.width = 150;
		this._rightPanelToggleButton.height = 50;
		this._rightPanel.add(this._rightPanelToggleButton);
		//right panel container
		var up, center, bottom;
		this._rightPanelContainer = this._mainGame.get_phaserGame().add.group();
		this._rightPanelContainer.width = 150;
		this._rightPanelContainer.height = 550;
		this._rightPanelContainer.position.setTo(0, 50);
		this._rightPanelContainer.debug = true;
		up = this._mainGame.get_phaserGame().add.sprite(0, 0, 'bg_rightpanel');
		up.width = 150;
		this._bindMoveEvent(up);
		center = this._mainGame.get_phaserGame().add.sprite(0, 16, 'bg_rightpanel');
		center.frame = 1;
		center.width = 150;
		center.height = 508;
		this._bindMoveEvent(center);
		bottom = this._mainGame.get_phaserGame().add.sprite(0, 524, 'bg_rightpanel');
		bottom.frame = 3;
		bottom.width = 150;
		this._bindMoveEvent(bottom);
		this._rightPanelContainer.add(up);
		this._rightPanelContainer.add(center);
		this._rightPanelContainer.add(bottom);
		this._rightPanel.add(this._rightPanelContainer);
		//character info group
		this._characterInfo = this._mainGame.get_phaserGame().add.group();
		this._characterInfo.position.setTo(100, 100);
		this._characterInfo.width = 100;
		this._characterInfo.height = 80;
		//box container
		var box = this._mainGame.get_phaserGame().add.sprite(0, 0, 'dialogbox', 0, this._characterInfo);
		box.anchor.setTo(0, 0);
		box.width = 100, box.height = 80;
		//hp and mp icon
		var hp, mp;
		hp = this._mainGame.get_phaserGame().add.sprite(5, 24, 'hp_icon', 0, this._characterInfo);
		hp.width = 24, hp.height = 24;
		mp = this._mainGame.get_phaserGame().add.sprite(7, 48, 'all_pack', 157, this._characterInfo);
		mp.width = 20, mp.height = 20;
		//empty bar
		var bar = this._mainGame.get_phaserGame().add.sprite(30, 28, 'status_bar', 0, this._characterInfo);
		bar.width = 60, bar.height = 24;
		bar = this._mainGame.get_phaserGame().add.sprite(30, 50, 'status_bar', 0, this._characterInfo);
		bar.width = 60, bar.height = 24;
		//hook up mousemove and mouse down event
		this._mainGame.get_phaserGame().input.addMoveCallback(this._onMouseMove, this);
		this._mainGame.get_phaserGame().input.onDown.add(this._onMouseButtonDown, this);
		//subscribe messages
		this._mainGame.subscribe(MainGame.Message.MouseOverCharacter, this._onMouseOverCharacter, this);
		this._mainGame.subscribe(MainGame.Message.MouseOutCharacter, this._onMouseOutCharacter, this);
	},

	update: function update()
	{

	},

	_createMarker: function _createMarker(lineWidth, color, alpha, x, y, width, height)
	{
		var m = this._mainGame.get_phaserGame().add.graphics();
		m.lineStyle(lineWidth, color, alpha);
		m.drawRect(x, y, width, height);
		return m;
	},

	_bindMoveEvent: function _bindMoveEvent(sprite)
	{
		sprite.inputEnabled = true;
		sprite.events.onInputOver.add(this._onMouseOverGUI, this);
		sprite.events.onInputOut.add(this._onMouseOutGUI, this);
	},

	_generateCharacterInfoDisplay: function _generateCharacterInfoDisplay(data)
	{
		//text
		if (!this._characterInfoText)
		{
			this._characterInfoText = this._mainGame.get_phaserGame().add.text(0, 3, '', null, this._characterInfo);
			this._characterInfoText.anchor.set(0.5);
			this._characterInfoText.align = 'center';
			this._characterInfoText.fontSize = 13;
			this._characterInfoText.stroke = '#000000';
			this._characterInfoText.strokeThickness = 6;
			this._characterInfoText.fill = '#43d637';
			this._characterInfoText.position.setTo(50, 15);
		}
		this._characterInfoText.setText(data.name + '  Lv:' + data.level);
		//hp,mp bar
		if (!this._characterInfoHPBar)
		{
			this._characterInfoHPBar = this._mainGame.get_phaserGame().add.graphics(33, 30, this._characterInfo);
		}
		if (!this._characterInfoMPBar)
		{
			this._characterInfoMPBar = this._mainGame.get_phaserGame().add.graphics(33, 52, this._characterInfo);
		}
		this._characterInfoHPBar.lineWidth = 1;
		this._characterInfoMPBar.lineWidth = 1;
		this._characterInfoHPBar.beginFill(0xff0000, 1);
		this._characterInfoHPBar.drawRoundedRect(0, 0, data.hp / data.fullHP * 55, 11, 5);
		this._characterInfoHPBar.endFill();
		this._characterInfoMPBar.beginFill(0x0000ff, 1);
		this._characterInfoMPBar.drawRoundedRect(0, 0, data.mp / data.fullMP * 55, 11, 5);
		this._characterInfoMPBar.endFill();
		//hp,mp bar text
		if (!this._characterInfoHPBarText)
		{
			this._characterInfoHPBarText = this._mainGame.get_phaserGame().add.text(60, 38, '', null, this._characterInfo);
			this._characterInfoHPBarText.anchor.set(0.5);
			this._characterInfoHPBarText.align = 'center';
			this._characterInfoHPBarText.fontSize = 9;
			this._characterInfoHPBarText.stroke = '#000000';
			this._characterInfoHPBarText.strokeThickness = 6;
			this._characterInfoHPBarText.fill = '#43d637';
			//this._characterInfoHPBarText.position.setTo(50, 15);
		}
		if (!this._characterInfoMPBarText)
		{
			this._characterInfoMPBarText = this._mainGame.get_phaserGame().add.text(60, 60, '', null, this._characterInfo);
			this._characterInfoMPBarText.anchor.set(0.5);
			this._characterInfoMPBarText.align = 'center';
			this._characterInfoMPBarText.fontSize = 9;
			this._characterInfoMPBarText.stroke = '#000000';
			this._characterInfoMPBarText.strokeThickness = 6;
			this._characterInfoMPBarText.fill = '#43d637';
		}
		this._characterInfoHPBarText.setText(data.hp + '/' + data.fullHP);
		this._characterInfoMPBarText.setText(data.mp + '/' + data.fullMP);
	},

	_onMouseMove: function _onMouseMove(pointer)
	{
		if (this._isCursorOnGUI) return;
		//check if within camera
		var camera = this._mainGame.get_phaserGame().camera;
		if (pointer.x >= camera.width || pointer.x <= 0 || pointer.y >= camera.height || pointer.y <= 0)
			return;
		//update marker position
		var layer = this._mainGame.get_level().get_bgLayer();
		this._marker.x = layer.getTileX(pointer.worldX) * 48;
		this._marker.y = layer.getTileY(pointer.worldY) * 48;
	},

	_onMouseButtonDown: function _onMouseButtonDown(pointer, event)
	{
		if (this._isCursorOnGUI) return;
		switch (pointer.button)
		{
			case 0:// left button
				var layer = this._mainGame.get_level().get_bgLayer();
				var currentTile = { x: layer.getTileX(pointer.worldX), y: layer.getTileY(pointer.worldY) };
				// set current marker
				if (!this._currentSelectedMarker)
				{
					this._currentSelectedMarker = this._createMarker(2, 0xffffff, 1, 0, 0, 48, 48);
				}
				this._currentSelectedMarker.x = currentTile.x * 48;
				this._currentSelectedMarker.y = currentTile.y * 48;
				// send message
				this._mainGame.addMsg(MainGame.Message.MouseClicked, currentTile);
				break;
			case 1:// middle button
				break;
			case 2:// right button
				break;
			default:
				break;
		}

	},

	_onRightPanelToggleButtonDown: function _onRightPanelToggleButtonDown(pointer, event)
	{
		this._rightPanelToggleButton.animations.play('mousedown');
	},
	_onRightPanelToggleButtonUp: function _onRightPanelToggleButtonUp(pointer, event)
	{
		this._rightPanelToggleButton.animations.play('mouseup');
		this._rightPanelContainer.visible = !this._rightPanelContainer.visible;
	},
	_onMouseOverGUI: function _onMouseOverGUI(pointer, event)
	{
		this._isCursorOnGUI = true;
	},
	_onMouseOutGUI: function _onMouseOutGUI(pointer, event)
	{
		this._isCursorOnGUI = false;
	},
	_onMouseOverCharacter: function _onMouseOverCharacter(msg, data)
	{
		if (msg === MainGame.Message.MouseOverCharacter && data)
		{
			this._generateCharacterInfoDisplay(data);
			this._characterInfo.position.setTo(data.pos.x, data.pos.y);
			this._characterInfo.visible = true;
		}
	},
	_onMouseOutCharacter: function _onMouseOutCharacter(msg, data)
	{
		if (msg === MainGame.Message.MouseOutCharacter)
		{
			this._characterInfo.visible = false;
		}
	}
}

MainGame.MessageProcessor = function (game)
{
	this._mainGame = game;
	this.init();
}

MainGame.MessageProcessor.prototype =
{
	_mainGame: null,
	_queue: null,
	_processors: null,

	init: function init()
	{
		this._queue = [];
		this._processors = {};
	},

	addMsg: function addMsg(msg, data)
	{
		this._queue.push({ msg: msg, data: data });
	},

	clearQueue: function clearQueue()
	{
		this._queue = [];
	},

	subscribe: function subscribe(msg, handler, context)
	{
		var handlers = this._processors[msg];
		var obj = { handler: handler, context: context };
		if (!handlers)
		{
			handlers = [];
		}
		if (handlers.indexOf(obj) < 0)
		{
			handlers.push(obj);
		}
		this._processors[msg] = handlers;
	},

	update: function update()
	{
		var i, j, msgObj, msg, data, handlers, handlerObj, handler, context, abort;
		for (i = 0; i < this._queue.length; i++)
		{
			msgObj = this._queue[i];
			msg = msgObj.msg;
			data = msgObj.data;
			handlers = this._processors[msg];
			if (handlers)
			{
				for (j = 0; j < handlers.length; j++)
				{
					handlerObj = handlers[j];
					handler = handlerObj.handler;
					context = handlerObj.context;
					abort = handler.call(context, msg, data);
					if (abort) break;
				}
			}
		}
		this.clearQueue();
	}
}


MainGame.Characters.StateMachine = function (game)
{
	this._mainGame = game;
}

MainGame.Characters.StateMachine.prototype =
{
	_mainGame: null,
}


MainGame.Message =
{
	MouseClicked: 1,
	MouseOverCharacter: 2,
	MouseOutCharacter: 3,
}