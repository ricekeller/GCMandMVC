var Minesweeper = function ()
{

}
Minesweeper.prototype =
{
	__game: null,
	__width: 1000,
	__height: 600,
	__difficulty: null,
	__screens: null,
	__level:null,

	__preload: function ()
	{
		this.__game.load.image('tile', '/Content/Images/Games/Minesweeper/blueblock.png');
		this.__game.load.image('empty', '/Content/Images/Games/Minesweeper/5.png');
		this.__game.load.image('flagged', '/Content/Images/Games/Minesweeper/4.png');
	},
	__create: function ()
	{
		//camera
		this.__game.camera.setSize(this.__width, this.__height);
		this.__game.camera.setBoundsToWorld();
		this.__screens = {};
		var that = this;
		EZGUI.Theme.load(['/Content/EZGUI/metalworks-theme/metalworks-theme.json'], this.__createEZGUIScreens.bind(this));
	},
	__update: function ()
	{
		if(this.__level)
		{
			this.__game.camera.x -= 1;
		}
	},
	__render: function ()
	{
		if (this.__level)
		{
			this.__level.forEachAlive(this.__debugGroup.bind(this), this);
		}
		this.__game.debug.cameraInfo(this.__game.camera, 32, 32);
	},
	__createEZGUIScreens: function ()
	{
		this.__screens.SelectDifficulty = EZGUI.create(Minesweeper.Screens.SelectDifficulty, 'metalworks');
		var moveToY = this.__screens.SelectDifficulty.position.y;
		EZGUI.components.Beginner.on('click', this.__onChooseDifficulty.bind(this));
		EZGUI.components.Intermediate.on('click', this.__onChooseDifficulty.bind(this));
		EZGUI.components.Advanced.on('click', this.__onChooseDifficulty.bind(this));

		this.__screens.SelectDifficulty.position.y = -this.__screens.SelectDifficulty.settings.height;
		this.__screens.SelectDifficulty.animatePosTo(this.__screens.SelectDifficulty.position.x, moveToY, 800, EZGUI.Easing.Back.Out);
	},
	__onChooseDifficulty: function myfunction(evt, src)
	{
		var dialog = this.__screens.SelectDifficulty;
		this.__difficulty = Minesweeper.Difficulty[src.guiID];
		var targetY = this.__height + 20;
		var that = this;
		dialog.animatePosTo(this.__screens.SelectDifficulty.position.x, targetY, 800, EZGUI.Easing.Back.In, function ()
		{
			dialog.visible = false;
			that.__createLevel();
		});
	},
	__createLevel: function ()
	{
		switch (this.__difficulty)
		{
			case Minesweeper.Difficulty.Beginner:
				this.__generateLevel(9, 9, 10);
				break;
			case Minesweeper.Difficulty.Intermediate:
				this.__generateLevel(16, 16, 40);
				break;
			case Minesweeper.Difficulty.Advanced:
				this.__generateLevel(30, 16, 99);
				break;
			default:
				this.__generateLevel(9, 9, 10);
				break;
		}
	},
	__generateLevel: function (width, height, mineCnt)
	{
		this.__level = this.__game.add.group();
		var size = 30;
		var curX = 0, curY = 0;
		for (var i = 0; i < height; i++)
		{
			for (var j = 0; j < width; j++)
			{
				var tile = this.__level.create(curX, curY, 'tile');
				tile.width = size;
				tile.height = size;
				curX += size + 1;
			}
			curX = 0;
			curY += size + 1;
		}
		this.__level.position.x = (this.__width - this.__level.width) / 2;
		this.__level.position.y = (this.__height - this.__level.height) / 2;
	},
	__debugGroup:function(itm)
	{
		this.__game.debug.body(itm);
	},
	init: function ()
	{
		this.__game = new Phaser.Game(this.__width, this.__height, Phaser.AUTO, 'minesweeper-container',
		{
			preload: this.__preload.bind(this), create: this.__create.bind(this), update: this.__update.bind(this),
			render: this.__render.bind(this)
		});
		this.__game.backgroundColor = '#4b0049';
		
	},
}
Minesweeper.Difficulty =
{
	Beginner: 0,
	Intermediate: 1,
	Advanced: 2
}
Minesweeper.Screens =
{
	SelectDifficulty:
	{
		id: 'selectDifficulty',
		component: 'Window',

		padding: 4,
		position: { x: 250, y: 100 },
		width: 500,
		height: 400,
		layout: [1, 4],
		children: [
			{
				component: 'Label',
				text: "What level of difficulty\n do you want to play?",
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
				id: 'Beginner',
				text: 'Beginner',
				component: 'Button',
				position: 'center',
				font: {
					size: '25px',
					family: 'Skranji',
					color: 'green'
				},
				width: 200,
				height: 60
			},
			{
				id: 'Intermediate',
				text: 'Intermediate',
				component: 'Button',
				position: 'center',
				font: {
					size: '25px',
					family: 'Skranji',
					color: 'blue'
				},
				width: 200,
				height: 60
			},
			{
				id: 'Advanced',
				text: 'Advanced',
				component: 'Button',
				position: 'center',
				font: {
					size: '25px',
					family: 'Skranji',
					color: 'red'
				},
				width: 200,
				height: 60
			}
		]
	},
}
$(function ()
{
	var g = new Minesweeper();
	g.init();
});