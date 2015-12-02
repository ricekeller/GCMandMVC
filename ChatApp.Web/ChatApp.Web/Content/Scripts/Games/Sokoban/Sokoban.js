var Sokoban = function ()
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
		this.__game.load.audio('player-move', '/Content/Sound/player-moving.ogg');
		this.__game.load.audio('box-move', '/Content/Sound/box-moving.ogg');
		this.__game.load.audio('win', '/Content/Sound/blessing.ogg');
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
				this._nextLevel();
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
	_nextLevel: function ()
	{
		var val = parseInt($("#slt_level").val());
		if (val >= $("#slt_level option").length - 1)
		{
			val = 0;
		}
		else
		{
			val++;
		}
		$("#slt_level").val(val);
		$("#slt_level").trigger('change');
	},
	_previousLevel: function ()
	{
		var val = parseInt($("#slt_level").val());
		if (val === 0)
		{
			val = $("#slt_level option").length - 1;
		}
		else
		{
			val--;
		}
		$("#slt_level").val(val);
		$("#slt_level").trigger('change');
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
	$("#moves").text(0);
	this.__sounds.player_move = this.__game.add.audio('player-move');
	this.__sounds.box_move = this.__game.add.audio('box-move');
	this.__sounds.win = this.__game.add.audio('win');
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
	__moves: 0,
	__sounds:{},
	__createLevel: function ()
	{
		this.__boxes = [];
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
						this.__createSprite(j, i, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__createSprite(j, i, this.__spriteKey, 'WallRound_Beige.png', Sokoban.ObjectType.Wall, true, true);
						break;
					case '@'://player
						this.__createSprite(j, i, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__createPlayer(i, j);
						break;
					case '+'://player on goal square
						this.__createSprite(j, i, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__createSprite(j, i, this.__spriteKey, 'EndPoint_Blue.png', null, false, true);
						this.__createPlayer(i, j);
						break;
					case '$'://box
						this.__createSprite(j, i, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__boxes.push(this.__createSprite(j, i, this.__spriteKey, 'Crate_Black.png', Sokoban.ObjectType.Box, true, false));
						break;
					case '*'://box on goal square
						this.__createSprite(j, i, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__goals.push(this.__createSprite(j, i, this.__spriteKey, 'EndPoint_Blue.png', null, false, true));
						this.__boxes.push(this.__createSprite(j, i, this.__spriteKey, 'Crate_Blue.png', Sokoban.ObjectType.Box, true, false));
						break;
					case '.'://goal square
						this.__createSprite(j, i, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						this.__goals.push(this.__createSprite(j, i, this.__spriteKey, 'EndPoint_Blue.png', null, false, true));
						break;
					case ' '://floor
						if (metWall)
						{
							this.__createSprite(j, i, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
						}
						break;
				}
			}
		}
		//put it at the center
		var width = maxJ * this.__squareSize;
		var height = (this.__levelData.LevelData.length - offset) * this.__squareSize;
		this.__levelGroup.position.x = (800 - width) / 2;
		var targetY = (600 - height) / 2;
		this.__levelGroup.position.y = -height;
		this.__game.add.tween(this.__levelGroup).to({ y: targetY }, 1000, "Back", true, 0, 0);
		//create keys
		this.__cursorKeys = this.__game.input.keyboard.createCursorKeys();

		//bring goals up
		for (var i = 0; i < this.__goals.length; i++)
		{
			this.__goals[i].bringToTop();
		}
		//bring boxes up
		for (var i = 0; i < this.__boxes.length; i++)
		{
			this.__boxes[i].bringToTop();
		}
		//bring player up
		this.__player.bringToTop();
	},
	__findBox: function (r, c)
	{
		var box = null;
		for (var i = 0; i < this.__boxes.length; i++)
		{
			box = this.__boxes[i];
			if (box.rowIdx === r && box.colIdx === c)
			{
				return box;
			}
		}
		return null;
	},
	__createSprite: function (c, r, key, frame, objType, enablePhysics, immovable)
	{
		var spr = this.__levelGroup.create(c * this.__squareSize, r * this.__squareSize, key, frame);
		spr.width = this.__squareSize;
		spr.height = this.__squareSize;
		spr.rowIdx = r;
		spr.colIdx = c;
		spr.objectType = objType;
		return spr;
	},
	__createPlayer: function (i, j)
	{
		var spr = this.__createSprite(j, i, this.__spriteKey, 'Character4.png');
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
				var newI2, newJ2, oldData = target;
				newI2 = newI + deltaI;
				newJ2 = newJ + deltaJ;
				if (!this.__levelMatrix[newI2] || !this.__levelMatrix[newI2][newJ2])
				{
					return;
				}
				target = this.__levelMatrix[newI2][newJ2];
				if (target !== '#' && target !== '*' && target !== '$')
				{
					target = this.__findBox(newI, newJ);
					target.rowIdx = newI2;
					target.colIdx = newJ2;
					if (oldData === '*')
					{
						this.__levelMatrix[newI][newJ] = '.';
						this.__changeBoxTexture(target, false);
					}
					else
					{
						this.__levelMatrix[newI][newJ] = ' ';
					}
					var newData = this.__levelMatrix[newI2][newJ2];
					if (newData === '.' || newData === '+')
					{
						this.__levelMatrix[newI2][newJ2] = '*';
						this.__changeBoxTexture(target, true);
					}
					else
					{
						this.__levelMatrix[newI2][newJ2] = '$';
					}
					this.__game.add.tween(target).to({ x: newJ2 * this.__squareSize }, this.__movingSpeed, "Linear", true, 0, 0);
					this.__game.add.tween(target).to({ y: newI2 * this.__squareSize }, this.__movingSpeed, "Linear", true, 0, 0).onComplete.add(function ()
					{
						this.__checkGameStatus();
					}, this);
					this.__animPlayer(newI, newJ);
					this.__moves++;
					$("#moves").text(this.__moves);
					this.__sounds.box_move.play();
				}
			}
			else
			{
				this.__animPlayer(newI, newJ);
				this.__sounds.player_move.play();
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
	__changeBoxTexture: function (box, isOnGoal)
	{
		if (isOnGoal)
		{
			box.loadTexture(this.__spriteKey, 'Crate_Blue.png');
		}
		else
		{
			box.loadTexture(this.__spriteKey, 'Crate_Black.png');
		}
	},
	__checkGameStatus: function ()
	{
		for (var i in this.__levelMatrix)
		{
			if (this.__levelMatrix.hasOwnProperty(i))
			{
				for (var j in this.__levelMatrix[i])
				{
					if (this.__levelMatrix[i].hasOwnProperty(j))
					{
						if (this.__levelMatrix[i][j] === '.')
						{
							return;
						}
					}
				}
			}
		}
		//play win sound
		this.__sounds.win.play();
		//display effect
		this.__game.add.tween(this.__levelGroup).to({ y: 600 }, 2000, "Back", true, 0, 0).onComplete.add(function ()
		{
			this.__isGameOver = true;
		}, this);
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
		//this.__debug();
	},
	render: function ()
	{

	},
	//__debugGrp: null,
	//__debug: function ()
	//{
	//	if (this.__debugGrp)
	//	{
	//		this.__debugGrp.destroy();
	//	}
	//	this.__debugGrp = this.__game.add.group();
	//	var tmp = [];
	//	for (var i in this.__levelMatrix)
	//	{
	//		if (this.__levelMatrix.hasOwnProperty(i))
	//		{
	//			for (var j in this.__levelMatrix[i])
	//			{
	//				if (this.__levelMatrix[i].hasOwnProperty(j))
	//				{
	//					var data = this.__levelMatrix[i][j];
	//					switch (data)
	//					{
	//						case '#'://wall
	//							//metWall = true;
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'WallRound_Beige.png', Sokoban.ObjectType.Wall, true, true);
	//							break;
	//						case '@'://player
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
	//							//this.__createPlayer(i, j, j * this.__squareSize, i * this.__squareSize);
	//							break;
	//						case '+'://player on goal square
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
	//							tmp.push(this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'EndPoint_Blue.png', null, false, true));
	//							//this.__createPlayer(i, j, j * this.__squareSize, i * this.__squareSize);
	//							break;
	//						case '$'://box
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Crate_Black.png', Sokoban.ObjectType.Box, true, false);
	//							break;
	//						case '*'://box on goal square
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
	//							tmp.push(this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'EndPoint_Blue.png', null, false, true));
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Crate_Black.png', Sokoban.ObjectType.Box, true, false);
	//							break;
	//						case '.'://goal square
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
	//							tmp.push(this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'EndPoint_Blue.png', null, false, true));
	//							break;
	//						case ' '://floor
	//							this.__debugCreateSprite(j * this.__squareSize, i * this.__squareSize, this.__spriteKey, 'Ground_Concrete.png', null, false, true);
	//							break;
	//					}
	//				}
	//			}
	//		}
	//	}
	//	for (var i = 0; i < tmp.length; i++)
	//	{
	//		tmp[i].bringToTop();
	//	}
	//},
	//__debugCreateSprite: function (x, y, key, frame)
	//{
	//	var spr = this.__debugGrp.create(x, y, key, frame);
	//	spr.width = this.__squareSize;
	//	spr.height = this.__squareSize;
	//	return spr;
	//}
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
	$("#prev").click(g._previousLevel.bind(g));
	$("#next").click(g._nextLevel.bind(g));
});