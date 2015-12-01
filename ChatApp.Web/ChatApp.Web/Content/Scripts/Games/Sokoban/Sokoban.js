﻿var Sokoban = function ()
{
	this.__levelsData = window.sokobanLevels;
	delete window.sokobanLevels;

	this.__init();
}

Sokoban.prototype =
{
	__game: null,
	__width: 800,
	__height: 600,
	__screens: null,
	__gamePlay: null,
	__levelsData: null,

	__preload: function ()
	{
		this.__game.load.atlasXML('sprites', '/Content/Images/Games/Sokoban/sprites.png', '/Content/Images/Games/Sokoban/sprites.xml');

		//TODO: change images
		var EZimages = {};
		EZimages.Keys = ['newgame', 'restart', 'clock', 'mine-tb'];
		EZimages.Urls = ['/Content/Images/Games/Minesweeper/newgame.png', '/Content/Images/Games/Minesweeper/restart.png',
                         '/Content/Images/Games/Minesweeper/clock.png', '/Content/Images/Games/Minesweeper/mine2.png'];
		for (var i = 0; i < EZimages.Urls.length; i++)
		{
			this.__game.load.image(EZimages.Keys[i], EZimages.Urls[i]);
		}

		//Note that you need to call fixCache here to fix compatibility issue
		//this is temporary fix, it will be replaced with a specific EZGUI Loader
		this.__game.load.onLoadComplete.add(EZGUI.Compatibility.fixCache, this.__game.load, null, EZimages.Keys);
	},
	__create: function ()
	{
		this.__screens = this.__screens || {};

		EZGUI.Theme.load(['/Content/EZGUI/metalworks-theme/metalworks-theme.json'], this.__createEZGUIScreens.bind(this));

		//after phaser game created, load first level
		this._onLevelSelectChange();
	},

	__update: function ()
	{
		if (this.__gamePlay)
		{
			this.__gamePlay.update();
			if (this.__gamePlay.get_isGameOver())
			{
				//TODO:get game result
				//display it
				this.__gamePlay = null;
			}
		}
	},
	__render: function ()
	{
		if (this.__gamePlay)
		{
			this.__gamePlay.render();
		}
	},
	__createEZGUIScreens: function ()
	{
		this.__screens.test1 = EZGUI.create(Sokoban.ScreenJSON.test1, 'metalworks');
		this.__screens.test1.visible = false;
		this.__screens.test2 = EZGUI.create(Sokoban.ScreenJSON.test2, 'metalworks');
		this.__screens.test2.visible = false;
		this.__screens.end = EZGUI.create(Sokoban.ScreenJSON.End, 'metalworks');
		this.__screens.end.visible = false;
	},
	__animateDialog: function (dialog, isShowingDialog, afterAnimationCallback)
	{
		if (isShowingDialog)
		{
			dialog.visible = true;
			var moveToY = dialog.settings.position.y;
			dialog.position.y = -dialog.settings.height;
			dialog.animatePosTo(dialog.position.x, moveToY, 800, EZGUI.Easing.Back.Out);
		}
		else
		{
			var targetY = this.__height + 20;
			dialog.animatePosTo(dialog.position.x, targetY, 800, EZGUI.Easing.Back.In, afterAnimationCallback.bind(this));
		}
	},
	__createGame: function (lvlData)
	{
		this.__gamePlay = new Sokoban.Gameplay(this.__game, lvlData);
	},
	__destroyCurrentGame: function ()
	{
		if (this.__gamePlay)
		{
			this.__gamePlay.destroy();
			this.__gamePlay = null;
		}
	},
	__init: function ()
	{
		this.__game = new Phaser.Game(this.__width, this.__height, Phaser.AUTO, 'game',
		{
			preload: this.__preload.bind(this), create: this.__create.bind(this), update: this.__update.bind(this),
			render: this.__render.bind(this)
		});
		this.__game.backgroundColor = '#4b0049';
	},
	_onLevelSelectChange: function (evt, src)
	{
		var lvlIdx = $("#slt_level").val();
		var lvlData = this.__levelsData[lvlIdx];
		if (lvlData)
		{
			this.__destroyCurrentGame();
			this.__createGame(lvlData);
		}

	}
}

Sokoban.Gameplay = function (game, lvlData)
{
	this.__game = game;
	this.__levelData = lvlData;
	this.__createLevel();
}

Sokoban.Gameplay.prototype =
{
	__game: null,
	__isGameOver: null,
	__levelData: null,
	__levelGroup: null,
	__squareSize: 40,
	__playerSize: 40,
	__boxSize: 40,
	__spriteKey: "sprites",
	__playerAnimFrameRate: 10,
	__movingSpeed: 250,
	__player: null,
	__cursorKeys: null,
	__boxes: null,
	__goals: null,
	__levelMatrix: null,
	__createLevel: function ()
	{
		this.__boxes = {};
		this.__goals = [];
		this.__levelMatrix = {};
		//create level from data
		this.__levelGroup = this.__game.add.group();
		var maxJ = 0;
		var offset = 0;
		var spr = null;
		for (var i = 0; i < this.__levelData.LevelData.length; i++)
		{
			if (this.__levelData.LevelData[i].indexOf('#') !== -1)
			{
				offset = i;
				break;
			}
		}
		for (var i = 0; i + offset < this.__levelData.LevelData.length; i++)
		{
			var rowData = this.__levelData.LevelData[i + offset];
			maxJ = Math.max(maxJ, rowData.length);
			var metWall = false;
			this.__levelMatrix[i] = this.__levelMatrix[i] || {};
			for (var j = 0; j < rowData.length; j++)
			{
				var data = rowData.charAt(j);
				this.__levelMatrix[i][j] = data;
				switch (data)
				{
					case '#'://wall
						metWall = true;
						this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'WallRound_Beige.png', Sokoban.ObjectType.Wall, true, true);
						break;
					case '@'://player
						this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__createPlayer(i, j, j * this.__squareSize, i * this.__squareSize);
						break;
					case '+'://player on goal square
						this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'EndPoint_Blue.png', null, false, true);
						this.__createPlayer(i, j, j * this.__squareSize, i * this.__squareSize);
						break;
					case '$'://box
						this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__boxes[i] = this.__boxes[i] || {};
						this.__boxes[i][j] = this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Crate_Black.png', Sokoban.ObjectType.Box, true, false);
						break;
					case '*'://box on goal square
						this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__goals.push(this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'EndPoint_Blue.png', null, false, true));
						this.__boxes[i] = this.__boxes[i] || {};
						this.__boxes[i][j] = this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Crate_Black.png', Sokoban.ObjectType.Box, true, false);
						break;
					case '.'://goal square
						this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__goals.push(this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'EndPoint_Blue.png', null, false, true));
						break;
					case ' '://floor
						if (metWall)
						{
							this.__createSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						}
						break;
				}
			}
		}
		//put it at the center
		var width = maxJ * this.__squareSize;
		var height = (this.__levelData.LevelData.length - offset) * this.__squareSize;
		this.__levelGroup.position.x = (800 - width) / 2;
		this.__levelGroup.position.y = (600 - height) / 2;
		//create keys
		this.__cursorKeys = this.__game.input.keyboard.createCursorKeys();

		//bring goals up
		for (var i = 0; i < this.__goals.length; i++)
		{
			this.__goals[i].bringToTop();
		}
		//bring boxes up
		for (var i in this.__boxes)
		{
			if (this.__boxes.hasOwnProperty(i))
			{
				for (var j in this.__boxes[i])
				{
					if (this.__boxes[i].hasOwnProperty(j))
					{
						this.__boxes[i][j].bringToTop();
					}
				}
			}
		}
		//bring player up
		this.__player.bringToTop();
	},
	__createSprite: function (x, y, key, frame, objType, enablePhysics, immovable)
	{
		var spr = this.__levelGroup.create(x, y, key, frame);
		spr.width = this.__squareSize;
		spr.height = this.__squareSize;
		spr.objectType = objType;
		return spr;
	},
	__createPlayer: function (i, j, x, y)
	{
		var spr = this.__createSprite(x, y, this.__spriteKey, 'Character4.png');
		spr.width = this.__playerSize;
		spr.height = this.__playerSize;
		spr.objectType = Sokoban.ObjectType.Player;
		spr.rowIdx = i;
		spr.colIdx = j;
		spr.canMove = true;
		spr.animations.add('down', ['Character4.png', 'Character5.png', 'Character6.png'], this.__playerAnimFrameRate);
		spr.animations.add('up', ['Character7.png', 'Character8.png', 'Character9.png'], this.__playerAnimFrameRate);
		spr.animations.add('left', ['Character1.png', 'Character10.png'], this.__playerAnimFrameRate);
		spr.animations.add('right', ['Character2.png', 'Character3.png'], this.__playerAnimFrameRate);
		this.__player = spr;
	},
	__updatePlayer: function ()
	{
		if (this.__cursorKeys.up.isDown)
		{
			this.__movePlayer(-1, 0, 'up');
		}
		else if (this.__cursorKeys.down.isDown)
		{
			this.__movePlayer(1, 0, 'down');
		}

		else if (this.__cursorKeys.left.isDown)
		{
			this.__movePlayer(0, -1, 'left');
		}
		else if (this.__cursorKeys.right.isDown)
		{
			this.__movePlayer(0, 1, 'right');
		}
	},
	__movePlayer: function (deltaI, deltaJ, anim)
	{
		var spr = this.__player;
		if (spr.canMove)
		{
			spr.play(anim);
			var newI, newJ, target;
			newI = spr.rowIdx + deltaI;
			newJ = spr.colIdx + deltaJ;
			if (!this.__levelMatrix[newI] || !this.__levelMatrix[newI][newJ])
			{
				return;
			}
			target = this.__levelMatrix[newI][newJ];
			if (target === '#')
			{
				return;
			}
			else if (target === '*' || target === '$')
			{
				var newI2, newJ2, target2, oldData = target;
				newI2 = newI + deltaI;
				newJ2 = newJ + deltaJ;
				if (!this.__levelMatrix[newI2] || !this.__levelMatrix[newI2][newJ2])
				{
					return;
				}
				target = this.__levelMatrix[newI2][newJ2];
				if (target !== '#' && target !== '*' && target !== '$')
				{
					target = this.__boxes[newI][newJ];
					delete this.__boxes[newI][newJ];
					this.__boxes[newI2] = this.__boxes[newI2] || {};
					this.__boxes[newI2][newJ2] = target;
					if (oldData === '*')
					{
						this.__levelMatrix[newI][newJ] = '.';
					}
					else
					{
						this.__levelMatrix[newI][newJ] = ' ';
					}
					var newData = this.__levelMatrix[newI2][newJ2];
					if (newData === '.' || newData === '+')
					{
						this.__levelMatrix[newI2][newJ2] = '*';
					}
					else
					{
						this.__levelMatrix[newI2][newJ2] = '$';
					}
					this.__game.add.tween(target).to({ x: newJ2 * this.__squareSize }, this.__movingSpeed, "Linear", true, 0, 0);
					this.__game.add.tween(target).to({ y: newI2 * this.__squareSize }, this.__movingSpeed, "Linear", true, 0, 0);
					this.__animPlayer(newI, newJ);
				}
			}
			else
			{
				this.__animPlayer(newI, newJ);
			}
		}
	},
	__animPlayer: function (newI, newJ)
	{
		var spr = this.__player;
		spr.canMove = false;
		spr.rowIdx = newI;
		spr.colIdx = newJ;
		this.__game.add.tween(spr).to({ x: newJ * this.__squareSize }, this.__movingSpeed, "Linear", true, 0, 0);
		this.__game.add.tween(spr).to({ y: newI * this.__squareSize }, this.__movingSpeed, "Linear", true, 0, 0).onComplete.add(function ()
		{
			spr.canMove = true;
		});
	},
	get_isGameOver: function ()
	{
		return this.__isGameOver;
	},
	destroy: function ()
	{
		this.__levelGroup.destroy();
	},
	update: function ()
	{
		this.__updatePlayer();
	},
	render: function ()
	{

	}
}
Sokoban.ObjectType =
{
	Wall: 0,
	Box: 1,
	Player: 2,
};
Sokoban.ScreenJSON =
{
	test1:
		{
			id: 'DiskSelectionScreen',
			component: 'Window',
			padding: 0,
			position: { x: 200, y: 50 },
			width: 600,
			height: 500,


			layout: [1, 1],
			children: [
				{
					id: 'DiskList',
					component: 'List',
					dragX: false,
					dragY: false,
					padding: 0,
					position: { x: 5, y: 25 },
					width: 590,
					height: 450,
					layout: [3, 3],
					children: [
					null,
					{
						component: 'Label',
						text: "Select number of disks:",
						font: {
							size: '35px',
							family: 'Skranji',
							color: 'white'
						},
						position: 'center',
						width: 200,
						height: 60
					},
					null,
						{ id: 'disk-3', text: '3', userData: 3, component: 'Button', position: 'center', width: 100, height: 100 },
						{ id: 'disk-4', text: '4', userData: 4, component: 'Button', position: 'center', width: 100, height: 100 },
						{ id: 'disk-5', text: '5', userData: 5, component: 'Button', position: 'center', width: 100, height: 100 },
						{ id: 'disk-6', text: '6', userData: 6, component: 'Button', position: 'center', width: 100, height: 100 },
						{ id: 'disk-7', text: '7', userData: 7, component: 'Button', position: 'center', width: 100, height: 100 },
						{ id: 'disk-8', text: '8', userData: 8, component: 'Button', position: 'center', width: 100, height: 100 },
					]
				}
			]
		},
	test2:
    {
    	id: 'InGameGui',
    	component: 'Window',
    	padding: 0,
    	position: { x: 800, y: 0 },
    	width: 200,
    	height: 600,


    	layout: [1, 8],
    	children: [
			null,
            {
            	component: 'Label',
            	text: "Time:",
            	font: {
            		size: '35px',
            		family: 'Skranji',
            		color: 'white'
            	},
            	position: 'center',
            	width: 200,
            	height: 60
            },
			{
				id: 'lbl_time',
				component: 'Label',
				text: "0",
				font: {
					size: '35px',
					family: 'Skranji',
					color: 'white'
				},
				position: 'center',
				width: 200,
				height: 60
			},
			{
				component: 'Label',
				text: "Steps:",
				font: {
					size: '35px',
					family: 'Skranji',
					color: 'white'
				},
				position: 'center',
				width: 200,
				height: 60
			},
			{
				id: 'lbl_step',
				component: 'Label',
				text: "0",
				font: {
					size: '35px',
					family: 'Skranji',
					color: 'white'
				},
				position: 'center',
				width: 200,
				height: 60
			},
            null,
            { id: 'tb_new_game', image: 'newgame', userData: "new", component: 'Button', position: 'center', width: 30, height: 30 },
			{ id: 'tb_restart', image: 'restart', userData: "restart", component: 'Button', position: 'center', width: 30, height: 30 }
    	]
    },
	End:
    {
    	id: 'End',
    	component: 'Window',
    	padding: 0,
    	position: { x: 250, y: 50 },
    	width: 500,
    	height: 500,


    	layout: [3, 6],
    	children: [
			null,
            {
            	id: 'lbl_title',
            	component: 'Label',
            	text: "",
            	font: {
            		size: '35px',
            		family: 'Skranji',
            		color: 'white'
            	},
            	position: 'center',
            	width: 200,
            	height: 60
            },
            null,
            null, null, null,
            {
            	component: 'Label',
            	text: "Time used:",
            	font: {
            		size: '35px',
            		family: 'Skranji',
            		color: 'white'
            	},
            	position: 'center',
            	width: 200,
            	height: 60
            },
            null,
            {
            	component: 'Label',
            	text: "Steps:",
            	font: {
            		size: '35px',
            		family: 'Skranji',
            		color: 'white'
            	},
            	position: 'center',
            	width: 200,
            	height: 60
            },
			{
				id: 'end_lbl_time',
				component: 'Label',
				text: "0",
				font: {
					size: '35px',
					family: 'Skranji',
					color: 'white'
				},
				position: 'center',
				width: 200,
				height: 60
			},
            null,
			{
				id: 'end_lbl_step',
				component: 'Label',
				text: "0",
				font: {
					size: '35px',
					family: 'Skranji',
					color: 'white'
				},
				position: 'center',
				width: 200,
				height: 60
			},
            null, null, null,
            { id: 'end_btn_new_game', text: 'New game', userData: "new", component: 'Button', position: 'center', width: 150, height: 60 },
            { id: 'end_btn_next', text: 'Next level', userData: "next", component: 'Button', position: 'center', width: 150, height: 60 },
			{ id: 'end_btn_restart', text: 'Replay', userData: "restart", component: 'Button', position: 'center', width: 150, height: 60 }
    	]
    },
}

$(function ()
{
	var g = new Sokoban();
	$("#slt_level").change(g._onLevelSelectChange.bind(g));
});