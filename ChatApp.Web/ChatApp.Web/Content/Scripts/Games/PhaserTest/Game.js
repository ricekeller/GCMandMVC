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
	_playerTeam: null,
	_enemyTeam: null,
	_otherTeams: null,
	_gui: null,
	_selectedCharacter: null,
	_CAMERAVERTICALSPEED: 3,
	_CAMERAHORIZONTALSPEED: 3,
	_WORLDBOUNDS: { x1: -200, y1: -200, x2: 5100, y2: 5100 },

	init: function (width, height)
	{
		this._game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: this._preload.bind(this), create: this._create.bind(this), update: this._update.bind(this), render: this._render.bind(this) });
		this._msgProcessor = new MainGame.MessageProcessor(this);
		this._level = new MainGame.Level(this, 100, 100, 48, 48);
		this._gui = new MainGame.GUI(this);
	},

	_preload: function ()
	{
		this._game.load.tilemap('terrain', '../Content/Images/Games/PhaserTest/1-1.json', null, Phaser.Tilemap.TILED_JSON);
		this._game.load.image('terrain_image', '../Content/Images/Games/PhaserTest/1-1.jpg');
		this._game.load.image('terrain_tiles', '../Content/Images/Games/PhaserTest/empty.png');
		this._game.load.image('dialogbox', '../Content/Images/Games/PhaserTest/dialog_box.png');
		this._game.load.image('status_bar', '../Content/Images/Games/PhaserTest/EmptyBar.png');
		this._game.load.image('hp_icon', '../Content/Images/Games/PhaserTest/heart.png');
		this._game.load.image('sword_general', '../Content/Images/Games/PhaserTest/sword.png');
		this._game.load.spritesheet('all_pack', '../Content/Images/Games/PhaserTest/terrain_1.png', 32, 32);
		this._game.load.spritesheet('player', '../Content/Images/Games/PhaserTest/player1.png', 32, 64);
		this._game.load.spritesheet('btn_rightpanel', '../Content/Images/Games/PhaserTest/btn_rightpanel.png', 142, 28);
		this._game.load.spritesheet('bg_rightpanel', '../Content/Images/Games/PhaserTest/bg_rightpanel.png', 192, 16);
		this._game.load.spritesheet('bg_menu', '../Content/Images/Games/PhaserTest/bg_menu.png', 145, 28);
	},

	_create: function ()
	{
		this._game.physics.startSystem(Phaser.Physics.ARCADE);
		this._game.camera.setSize(960, 600);
		this._keyboard = this._game.input.keyboard.createCursorKeys();
		this._previousKeyboard = { up: false, down: false, left: false, right: false };
		this._level.init();
		this._gui.init();

		this._generateTeam();
		this.subscribe(MainGame.Message.CharacterSelected, this._onCharacterSelected, this);
		this.subscribe(MainGame.Message.CharacterDeselected, this._onCharacterDeselected, this);
	},

	_update: function ()
	{
		this._msgProcessor.update();
		//this._player.update();
		this._playerTeam.update();
		this._enemyTeam.update();
		for (var i = 0; i < this._otherTeams.length; i++)
		{
			this._otherTeams.update();
		}
		this._gui.update();


		//if ((this._keyboard.up.isUp && this._previousKeyboard.up) || (this._keyboard.down.isUp && this._previousKeyboard.down))
		//{
		//	this._player.clearSpeed('y');
		//}
		//if ((this._keyboard.left.isUp && this._previousKeyboard.left) || (this._keyboard.right.isUp && this._previousKeyboard.right))
		//{
		//	this._player.clearSpeed('x');
		//}
		//var dirs = ['up', 'down', 'left', 'right'];
		//for (var dir = 0; dir < dirs.length; dir++)
		//{
		//	this._previousKeyboard[dirs[dir]] = this._keyboard[dirs[dir]].isDown;
		//}

		if (this._keyboard.up.isDown)
		{
			//this._player.move('up');
			this._game.camera.y -= this._CAMERAVERTICALSPEED;
		}
		if (this._keyboard.down.isDown)
		{
			//this._player.move('down');
			this._game.camera.y += this._CAMERAVERTICALSPEED;
		}
		if (this._keyboard.left.isDown)
		{
			//this._player.move('left');
			this._game.camera.x -= this._CAMERAHORIZONTALSPEED;
		}
		if (this._keyboard.right.isDown)
		{
			//this._player.move('right');
			this._game.camera.x += this._CAMERAHORIZONTALSPEED;
		}
	},

	_render: function ()
	{
		this._game.debug.cameraInfo(this._game.camera, 32, 32);
		this._game.debug.bodyInfo(this._playerTeam._characters[0]._sprite, 32, 320);
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

	get_selectedCharacter: function get_selectedCharacter()
	{
		return this._selectedCharacter;
	},

	_generateTeam: function _generateTeam()
	{
		this._playerTeam = new MainGame.Team(this);
		this._enemyTeam = new MainGame.Team(this);
		this._otherTeams = [];
		this._playerTeam.add(this._createCharacter('player', { x: 480, y: 48 }, 'test1', MainGame.Characters.AttackRange.Types.Square));
		this._playerTeam.add(this._createCharacter('player', { x: 480, y: 144 }, 'ttttt2', MainGame.Characters.AttackRange.Types.Cross_1));

		this._enemyTeam.add(this._createCharacter('player', { x: 300, y: 48 }, '46343545346', MainGame.Characters.AttackRange.Types.Square));
		this._enemyTeam.add(this._createCharacter('player', { x: 300, y: 144 }, 'rewgargaer', MainGame.Characters.AttackRange.Types.Cross_1));
	},

	_createCharacter: function _createCharacter(spriteKey, pos, name, attackType)
	{
		var playerFPS = 10;
		var playerSprite = this._game.add.sprite(pos.x, pos.y, spriteKey);
		playerSprite.anchor.setTo(0, 0);
		playerSprite.scale.setTo(1, 0.75);
		playerSprite.animations.add('up', [4, 5, 6, 7], playerFPS, true);
		playerSprite.animations.add('down', [0, 1, 2, 3], playerFPS, true);
		playerSprite.animations.add('left', [12, 13, 14, 15], playerFPS, true);
		playerSprite.animations.add('right', [8, 9, 10, 11], playerFPS, true);
		this._game.physics.enable(playerSprite);
		playerSprite.body.collideWorldBounds = true;
		return new MainGame.Characters.Player(this, playerSprite, name, attackType);
		//debug
	},

	_onCharacterSelected: function _onCharacterSelected(msg, data)
	{
		if (msg === MainGame.Message.CharacterSelected)
		{
			this._selectedCharacter = data;
		}
	},

	_onCharacterDeselected: function _onCharacterDeselected(msg, data)
	{
		if (msg === MainGame.Message.CharacterDeselected)
		{
			this._selectedCharacter = null;
		}
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
	_map: null,
	_layers: null,
	_w: null,
	_h: null,
	_cellW: null,
	_cellH: null,
	_ground: null,
	_currentSelectedCell: null,
	_buildContextMenu: null,
	_charactersPositions: null,

	init: function init(cellData)
	{
		//load map and create layers
		this._map = this._mainGame.get_phaserGame().add.tilemap('terrain');
		this._map.addTilesetImage('bg', 'terrain_image');
		this._map.addTilesetImage('obstacles', 'terrain_tiles');
		this._layers = [];
		this._layers.push(this._map.createLayer('bg'));
		this._layers.push(this._map.createLayer('items'));

		var currentLayer = this._layers[this._layers.length - 1];
		currentLayer.visible = false;
		currentLayer.debug = true;
		currentLayer.resizeWorld();
		this._mainGame.get_phaserGame().camera.setBoundsToWorld();
		//set collision
		this._map.setCollision(401, true, currentLayer);
		//initialize _characterPositions
		this._charactersPositions = [];
		for (var i = 0; i < this._map.height; i++)
		{
			this._charactersPositions.push([]);
			for (var j = 0; j < this._map.width; j++)
			{
				this._charactersPositions[i].push(null);
			}
		}
		//subscribe messages
		this._mainGame.subscribe(MainGame.Message.CharacterPositionChanged, this._onCharacterPositionChanged, this);
	},

	get_itemsLayer: function get_itemsLayer()
	{
		return this._layers[this._layers.length - 1];
	},

	get_bgLayer: function get_bgLayer()
	{
		return this._layers[0];
	},

	hasCharacter: function hasCharacter(tile)
	{
		return !!this._charactersPositions[tile.y][tile.x];
	},

	getCharacterAtPos: function getCharacterAtPos(tile)
	{
		return this._charactersPositions[tile.y][tile.x];
	},

	_onCharacterPositionChanged: function _onCharacterPositionChanged(msg, data)
	{
		/**
		 * data: Character object.
		 */
		if (msg === MainGame.Message.CharacterPositionChanged)
		{
			//find old pos and set it to null
			var old = data.get_previousPos();
			var now = data.get_posTile();
			if (old && old.x && old.y)
			{
				this._charactersPositions[old.y][old.x] = null;
			}
			//assign the data obj to new pos
			if (now && now.x && now.y && !this._charactersPositions[now.y][now.x])
			{
				this._charactersPositions[now.y][now.x] = data;
			}
		}
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
MainGame.Characters.Player = function (game, sprite, name, attackType)
{
	this._game = game;
	this._sprite = sprite;
	this._name = name;
	this._attackRange = new MainGame.Characters.AttackRange(game, attackType);
	this._hookupEvent();
	this._updatePosition();
	this._sendPositionChangedMessage();
}

MainGame.Characters.Player.prototype =
{
	_game: null,
	_sprite: null,
	_posTile: {},
	_previousPosTile: {},
	_isSelected: null,
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
	_moveSpeed: 4,
	_attackRange: null,

	bindCamera: function bindCamera(camera)
	{
		camera.follow(this._sprite);
	},

	update: function update()
	{
		this._game.get_phaserGame().physics.arcade.collide(this._sprite, this._game.get_level().get_itemsLayer());
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

	moveTo: function moveTo(dest)
	{
		/**
		 * should update posTile
		 */
		this._sprite.position.setTo(dest.x * 48, dest.y * 48);
		this._updatePosition();
		this._sendPositionChangedMessage();
	},

	goBack: function goBack()
	{
		this.moveTo(this._previousPosTile);
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

	get_previousPos: function get_previousPos()
	{
		return this._previousPosTile;
	},

	get_isSelected: function get_isSelected()
	{
		return this._isSelected;
	},

	cancelSelect: function cancelSelect()
	{
		this._isSelected = false;
	},

	get_moveSpeed: function get_moveSpeed()
	{
		return this._moveSpeed;
	},

	get_attackRange: function get_attackRange()
	{
		return this._attackRange.get_range();
	},

	_updatePosition: function _updatePosition()
	{
		var layer = this._game.get_level().get_bgLayer();
		this._previousPosTile = { x: this._posTile.x, y: this._posTile.y };
		this._posTile = { x: layer.getTileX(this._sprite.position.x), y: layer.getTileY(this._sprite.position.y) }
	},

	_sendPositionChangedMessage: function _sendPositionChangedMessage()
	{
		this._game.addMsg(MainGame.Message.CharacterPositionChanged, this);
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
		if (!this._game.get_selectedCharacter())
		{
			this._isSelected = true;
			this._game.addMsg(MainGame.Message.CharacterSelected, this);
		}
	},

	_onMouseUp: function _onMouseUp(sprite, event)
	{

	},

	_onMouseOver: function _onMouseOver(sprite, event)
	{
		this._game.addMsg(MainGame.Message.MouseOverCharacter, {
			name: this._name, level: this._level, hp: this._hp,
			mp: this._mp, pos: { x: this._sprite.x, y: this._sprite.y },
			fullHP: this._fullHP, fullMP: this._fullMP
		});
	},

	_onMouseOut: function _onMouseOut(sprite, event)
	{
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
	_canMoveArea: null,
	_canMoveAreaTileIndex: null,
	_currentGUIState: null,
	_mainCharacterMenu: null,
	_canAttackArea: null,
	_canAttackAreaTileIndex: null,


	init: function init()
	{
		//init any arrays,objs
		this._canMoveArea = [];
		this._canMoveAreaTileIndex = {};
		this._canAttackArea = [];
		this._canAttackAreaTileIndex = {};
		this._currentGUIState = MainGame.GUI.State.General;
		//moving marker
		this._marker = this._createMarker(2, 0x00ff00, 1, 0, 0, 48, 48);
		//create right panel
		this._createRightPanel();
		//create charater hover infobox
		this._createCharacterHoverInfobox();
		//create main character menu
		this._createMainCharacterMenu();
		//hook up mousemove and mouse down event
		this._mainGame.get_phaserGame().input.addMoveCallback(this._onMouseMove, this);
		this._mainGame.get_phaserGame().input.onDown.add(this._onMouseButtonDown, this);
		//subscribe messages
		this._mainGame.subscribe(MainGame.Message.MouseOverCharacter, this._onMouseOverCharacter, this);
		this._mainGame.subscribe(MainGame.Message.MouseOutCharacter, this._onMouseOutCharacter, this);
		this._mainGame.subscribe(MainGame.Message.CharacterSelected, this._onCharacterSelected, this);
		this._mainGame.subscribe(MainGame.Message.CharacterPositionChanged, this._onCharacterPosChanged, this);
	},

	update: function update()
	{
		
	},

	_createRightPanel: function _createRightPanel()
	{
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
	},

	_createCharacterHoverInfobox: function _createCharacterHoverInfobox()
	{
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
	},

	_createMainCharacterMenu: function _createMainCharacterMenu()
	{
		//the group
		this._mainCharacterMenu = this._mainGame.get_phaserGame().add.group();
		//the container
		var up, center, bottom;
		up = this._mainGame.get_phaserGame().add.sprite(0, 0, 'bg_menu', 0, this._mainCharacterMenu);
		up.width = 150;
		this._bindMoveEvent(up);
		center = this._mainGame.get_phaserGame().add.sprite(0, 24, 'bg_menu', 1, this._mainCharacterMenu);
		center.width = 150;
		center.height = 140;
		this._bindMoveEvent(center);
		bottom = this._mainGame.get_phaserGame().add.sprite(0, 145, 'bg_menu', 2, this._mainCharacterMenu);
		bottom.width = 150;
		this._bindMoveEvent(bottom);
		//add 5 buttons
		var btnAtt = this._createButton('btn_rightpanel', 'sword_general', 'Attack', 'btnAttack');
		btnAtt.position.setTo(0, 10);
		var btnMagic = this._createButton('btn_rightpanel', 'sword_general', 'Magic', 'btnMagic');
		btnMagic.position.setTo(0, 40);
		var btnItem = this._createButton('btn_rightpanel', 'sword_general', 'Items', 'btnItems');
		btnItem.position.setTo(0, 70);
		var btnFinish = this._createButton('btn_rightpanel', 'sword_general', 'Finish', 'btnFinish');
		btnFinish.position.setTo(0, 100);
		var btnCancel = this._createButton('btn_rightpanel', 'sword_general', 'Cancel', 'btnCancel');
		btnCancel.position.setTo(0, 130);
		this._mainCharacterMenu.add(btnAtt);
		this._mainCharacterMenu.add(btnMagic);
		this._mainCharacterMenu.add(btnItem);
		this._mainCharacterMenu.add(btnFinish);
		this._mainCharacterMenu.add(btnCancel);
		//debug only
		this._mainCharacterMenu.position.setTo(200, 200);
	},

	_createButton: function _createButton(btnKey, iconKey, caption, name)
	{
		var btnGroup = this._mainGame.get_phaserGame().add.group();
		btnGroup.visible = true;
		var btn = this._mainGame.get_phaserGame().add.sprite(0, 0, btnKey, 0, btnGroup);
		btn.width = 150;
		btn.height = 30;
		btn.animations.add('mousedown', [0, 1, 2, 3], 20, false);
		btn.animations.add('mouseup', [3, 2, 1, 0], 20, false);
		btn.name = name;
		var left, right;
		left = this._mainGame.get_phaserGame().add.sprite(14, 7, iconKey, 0, btnGroup);
		right = this._mainGame.get_phaserGame().add.sprite(122, 7, iconKey, 0, btnGroup);
		left.width = 15, left.height = 15;
		right.width = 15, right.height = 15;
		var text = this._mainGame.get_phaserGame().add.text(75, 17, caption, null, btnGroup);
		text.anchor.set(0.5);
		text.align = 'center';
		text.fontSize = 13;
		text.stroke = '#000000';
		text.strokeThickness = 6;
		text.fill = '#43d637';
		//hookup event
		this._bindMoveEvent(btn);
		this._bindMoveEvent(left);
		this._bindMoveEvent(right);
		this._bindMoveEvent(text);
		btn.events.onInputDown.add(this._playMouseDownAnimation, btn);
		btn.events.onInputDown.add(this._onMenuButtonDown, { btn: btn, context: this });
		btn.events.onInputUp.add(this._playMouseUpAnimation, btn);
		left.events.onInputDown.add(this._playMouseDownAnimation, btn);
		left.events.onInputDown.add(this._onMenuButtonDown, { btn: btn, context: this });
		left.events.onInputUp.add(this._playMouseUpAnimation, btn);
		right.events.onInputDown.add(this._playMouseDownAnimation, btn);
		right.events.onInputDown.add(this._onMenuButtonDown, { btn: btn, context: this });
		right.events.onInputUp.add(this._playMouseUpAnimation, btn);
		text.events.onInputDown.add(this._playMouseDownAnimation, btn);
		text.events.onInputDown.add(this._onMenuButtonDown, { btn: btn, context: this });
		text.events.onInputUp.add(this._playMouseUpAnimation, btn);
		return btnGroup;
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

	_goBackToPreviousState: function _goBackToPreviousState()
	{
		switch (this._currentGUIState)
		{
			case MainGame.GUI.State.CharacterSelected:
				//set current state to the previous one, clear can-move-area and raise the event.
				this._currentGUIState = MainGame.GUI.State.General;
				this._clearCanMoveArea();
				this._clearCanAttackArea();
				this._mainGame.addMsg(MainGame.Message.CharacterDeselected);
				break;
			case MainGame.GUI.State.CharacterMoved:
				this._mainGame.get_selectedCharacter().goBack();
				this._unhideCanMoveArea();
				this._clearAndDrawAttackArea();
				this._hideMainCharacterMenu();
				this._currentGUIState = MainGame.GUI.State.CharacterSelected;
				break;
		}
	},

	_playMouseDownAnimation: function _playMouseDownAnimation(pointer, event)
	{
		/**
		 *  'this' keyword in this function should be the sprite, so when binding, should pass the sprite as context
		 */
		this.animations.play('mousedown');
	},

	_playMouseUpAnimation: function _playMouseUpAnimation(pointer, event)
	{
		/**
		 *  'this' keyword in this function should be the sprite, so when binding, should pass the sprite as context
		 */
		this.animations.play('mouseup');
	},

	_clearCanMoveArea: function _clearCanMoveArea()
	{
		for (var i = 0; i < this._canMoveArea.length; i++)
		{
			this._canMoveArea[i].kill();
		}
		this._canMoveArea = [];
		this._canMoveAreaTileIndex = {};
	},

	_hideCanMoveArea: function _hideCanMoveArea()
	{
		for (var i = 0; i < this._canMoveArea.length; i++)
		{
			this._canMoveArea[i].visible = false;
		}
	},

	_unhideCanMoveArea: function _unhideCanMoveArea()
	{
		for (var i = 0; i < this._canMoveArea.length; i++)
		{
			this._canMoveArea[i].visible = true;
		}
	},

	_clearCanAttackArea: function _clearCanAttackArea()
	{
		for (var i = 0; i < this._canAttackArea.length; i++)
		{
			this._canAttackArea[i].kill();
		}
		this._canAttackArea = [];
		this._canAttackAreaTileIndex = {};
	},

	_hideCanAttackArea: function _hideCanAttackArea()
	{
		for (var i = 0; i < this._canAttackArea.length; i++)
		{
			this._canAttackArea[i].visible = false;
		}
	},

	_showCanAttackArea: function _showCanAttackArea()
	{
		for (var i = 0; i < this._canAttackArea.length; i++)
		{
			this._canAttackArea[i].visible = true;
		}
	},

	_displayMainCharacterMenu: function _displayMainCharacterMenu(characterTile)
	{
		var pos = this._findProperMenuPos(characterTile);
		this._mainCharacterMenu.position.setTo(pos.x, pos.y);
		this._mainCharacterMenu.visible = true;
		this._mainGame.get_phaserGame().world.bringToTop(this._mainCharacterMenu);
	},

	_hideMainCharacterMenu: function _hideMainCharacterMenu()
	{
		this._mainCharacterMenu.visible = false;
		this._mainGame.get_phaserGame().world.sendToBack(this._mainCharacterMenu);
	},

	_findProperMenuPos: function _findProperMenuPos(characterTile)
	{
		return { x: (characterTile.x + 1) * 48, y: characterTile.y * 48 };
	},

	_updateCharacterInfoPos: function _updateCharacterInfoPos()
	{
		var cha = this._mainGame.get_selectedCharacter();
		if (cha)
		{
			var pos = cha.get_posTile();
			this._characterInfo.position.setTo((pos.x + 1) * 48, pos.y * 48);
		}
	},

	_paintSingleTile: function _paintSingleTile(x, y, visitedObj, queue, curMove, color)
	{
		//check bounds
		if (x < 0 || x > 19 || y < 0 || y > 19)
		{
			return;
		}
		//check if visited
		if (visitedObj[y] && visitedObj[y][x])
		{
			return;
		}
		//check if has other characters
		if (this._mainGame.get_level().hasCharacter({ x: x, y: y }))
		{
			return;
		}
		//check if can move
		var data = this._mainGame.get_level().get_itemsLayer().layer.data;
		if (data && data[y] && data[x] && !data[y][x].canCollide)
		{
			//paint, add to group, add to visited
			var g = this._mainGame.get_phaserGame().add.graphics(0, 0);
			g.beginFill(color, 0.3);
			g.drawRect(x * 48, y * 48, 48, 48);
			g.endFill();
			this._canMoveArea.push(g);
			if (!this._canMoveAreaTileIndex[y])
			{
				this._canMoveAreaTileIndex[y] = {};
			}
			this._canMoveAreaTileIndex[y][x] = g;
			if (!visitedObj[y])
			{
				visitedObj[y] = {};
			}
			visitedObj[y][x] = true;
			queue.enqueue({ x: x, y: y, moved: curMove + 1 });
		}
	},

	_clearAndDrawAttackArea: function _clearAndDrawAttackArea(selectedCharacter)
	{
		this._clearCanAttackArea();
		if (!selectedCharacter) selectedCharacter = this._mainGame.get_selectedCharacter();
		var range = selectedCharacter.get_attackRange();
		var curTile = selectedCharacter.get_posTile();
		var dt = null;
		for (var i = 0; i < range.length; i++)
		{
			dt = range[i];
			this._paintAttackTile(curTile.x + dt.dX, curTile.y + dt.dY, 0xff0000);
		}
	},

	_paintAttackTile: function _paintAttackTile(x, y, color)
	{
		//check bounds
		if (x < 0 || x > 19 || y < 0 || y > 19)
		{
			return;
		}
		//paint, add to group, add to visited
		var g = this._mainGame.get_phaserGame().add.graphics(0, 0);

		g.lineStyle(5, color, 0.3);
		g.drawRect(x * 48, y * 48, 48, 48);
		this._canAttackArea.push(g);
		if (!this._canAttackAreaTileIndex[y])
		{
			this._canAttackAreaTileIndex[y] = {};
		}
		this._canAttackAreaTileIndex[y][x] = g;
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
		//if on GUI, do nothing because GUI elements have their own handler.
		if (this._isCursorOnGUI) return;

		var isCharacterSelected = this._mainGame.get_selectedCharacter() ? this._mainGame.get_selectedCharacter().get_isSelected() : false;
		if (isCharacterSelected)
		{
			switch (pointer.button)
			{
				case 0://left
					switch (this._currentGUIState)
					{
						case MainGame.GUI.State.CharacterSelected:
							//detact if character can be moved to dest. If can, move selected character to destination, change state
							var layer = this._mainGame.get_level().get_bgLayer();
							var currentTile = { x: layer.getTileX(pointer.worldX), y: layer.getTileY(pointer.worldY) };
							if (this._canMoveAreaTileIndex[currentTile.y] && this._canMoveAreaTileIndex[currentTile.y][currentTile.x])
							{
								//move the character
								this._mainGame.get_selectedCharacter().moveTo(currentTile);
								//change the GUI state
								this._currentGUIState = MainGame.GUI.State.CharacterMoved;
								//show the character menu
								this._displayMainCharacterMenu(currentTile);
								//hide the can-move-area and can-attack-area
								this._hideCanMoveArea();
								this._hideCanAttackArea();
							}
							break;
					}
					break;
				case 1://middle
					break;
				case 2://right:go back to previous state
					this._goBackToPreviousState();
					break;
			}
		}
		else
		{
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
	},
	_onCharacterSelected: function _onCharacterSelected(msg, data)
	{
		if (msg === MainGame.Message.CharacterSelected)
		{
			var selectedCharacter = data;
			if (selectedCharacter)
			{
				//calculate can-move-area
				var tile = selectedCharacter.get_posTile();
				var moveSpeed = selectedCharacter.get_moveSpeed();
				var queue = new Queue();
				var visited = {};
				var cur = null;
				queue.enqueue({ x: tile.x, y: tile.y, moved: 0 });
				visited[tile.y] = {}, visited[tile.y][tile.x] = true;
				while (!queue.isEmpty())
				{
					cur = queue.dequeue();
					if (cur.moved < moveSpeed)
					{
						this._paintSingleTile(cur.x, cur.y - 1, visited, queue, cur.moved, 0x0000ff);
						this._paintSingleTile(cur.x, cur.y + 1, visited, queue, cur.moved, 0x0000ff);
						this._paintSingleTile(cur.x - 1, cur.y, visited, queue, cur.moved, 0x0000ff);
						this._paintSingleTile(cur.x + 1, cur.y, visited, queue, cur.moved, 0x0000ff);
					}
				}
				//calculate can-attack-area
				this._clearAndDrawAttackArea(selectedCharacter);
				this._currentGUIState = MainGame.GUI.State.CharacterSelected;
			}
		}
	},
	_onMenuButtonDown: function _onMenuButtonDown(pointer, event)
	{
		/**
		 *  'this' keyword in this function should be the object: {btn:btn,context:GUI obj}, so when binding, should pass the sprite as context
		 */
		var that = this.context;
		switch (this.btn.name)
		{
			case 'btnAttack':
				if (that._currentGUIState === MainGame.GUI.State.CharacterMoved)
				{
					that._hideMainCharacterMenu();
					that._clearAndDrawAttackArea();
				}
				break;
			case 'btnMagic':

				break;
			case 'btnItems':

				break;
			case 'btnFinish':

				break;
			case 'btnCancel':

				break;
		}
	},
	_onCharacterPosChanged: function _onCharacterPosChanged(msg, data)
	{
		if (msg === MainGame.Message.CharacterPositionChanged)
		{
			this._updateCharacterInfoPos();
		}
	}
}


MainGame.GUI.State =
{
	General: 1,
	CharacterSelected: 2,
	CharacterMoved: 3,
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
		this._queue = new Queue();
		this._processors = {};
	},

	addMsg: function addMsg(msg, data)
	{
		this._queue.enqueue({ msg: msg, data: data });
	},

	clearQueue: function clearQueue()
	{
		this._queue = new Queue();
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
		while (!this._queue.isEmpty())
		{
			msgObj = this._queue.dequeue();
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
	}
}


MainGame.Team = function (game)
{
	this._mainGame = game;
	this._characters = [];
}

MainGame.Team.prototype =
{
	_mainGame: null,
	_characters: null,

	add: function add(character)
	{
		if (this._characters.indexOf(character) === -1)
		{
			this._characters.push(character);
		}
	},

	update: function update()
	{
		for (var i = 0; i < this._characters.length; i++)
		{
			this._characters[i].update();
		}
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


MainGame.Characters.AttackRange = function (game, type)
{
	this._mainGame = game;
	this._createRangeWithType(type);
}

MainGame.Characters.AttackRange.Types =
{
	Square: 1,
	Cross_1: 2,
}

MainGame.Characters.AttackRange.prototype =
{
	_mainGame: null,
	_rangeCells: null,

	get_range: function get_range()
	{
		return this._rangeCells;
	},

	_createRangeWithType: function _createRangeWithType(type)
	{
		this._rangeCells = [];
		switch (type)
		{
			case MainGame.Characters.AttackRange.Types.Square:
				this._rangeCells.push({ dX: -1, dY: -1 });
				this._rangeCells.push({ dX: 0, dY: -1 });
				this._rangeCells.push({ dX: 1, dY: -1 });
				this._rangeCells.push({ dX: -1, dY: 0 });
				this._rangeCells.push({ dX: 1, dY: 0 });
				this._rangeCells.push({ dX: -1, dY: 1 });
				this._rangeCells.push({ dX: 0, dY: 1 });
				this._rangeCells.push({ dX: 1, dY: 1 });
				break;
			case MainGame.Characters.AttackRange.Types.Cross_1:
				this._rangeCells.push({ dX: 0, dY: -1 });
				this._rangeCells.push({ dX: -1, dY: 0 });
				this._rangeCells.push({ dX: 1, dY: 0 });
				this._rangeCells.push({ dX: 0, dY: 1 });
				break;
		}
	},
}


MainGame.Message =
{
	MouseClicked: 1,
	MouseOverCharacter: 2,
	MouseOutCharacter: 3,
	CharacterSelected: 4,
	CharacterDeselected: 5,
	CharacterPositionChanged: 6,
}