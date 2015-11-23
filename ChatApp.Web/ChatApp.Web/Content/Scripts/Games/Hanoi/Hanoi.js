var Hanoi = function ()
{

};
Hanoi.prototype =
{
	__game: null,
	__width: 1000,
	__height: 600,
	__screens: null,
	__sounds: null,
	__curNumberOfDisks: 3,
	__isGameOver: false,
	__staticGroup: null,
	__timeRemains: 0,
	__stepsMoved: 0,
	__timer: null,
	__maxTimeForNumberOfDisks: [0, 0, 0, 180, 240, 300, 360, 420, 480],
	__disks: null,
	__widthOfDisk: [60, 70, 80, 90, 100, 110, 120, 130, 140],
	__startingX: [150, 400, 650],
	__startingY: 480, // 500-20
	__dragObjInfo: null,
	__data: null,
	__cylinders: null,

	__preload: function ()
	{
		this.__game.load.image('disk', '/Content/Images/Games/Hanoi/block.png');
		this.__game.load.image('pipe', '/Content/Images/Games/Hanoi/pipe.png');
		this.__game.load.image('glass-back', '/Content/Images/Games/Hanoi/glass-back.png');

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
		//prevent right click being captured by browser
		this.__game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
		this.__screens = this.__screens || {};
		this.__sounds = this.__sounds || {};
		this.__disks = this.__disks || {};
		this.__sounds.win = this.__game.add.audio('win');
		this.__sounds.lose = this.__game.add.audio('lose');
		this.__staticGroup = this.__game.add.group();
		this.__staticGroup.visible = false;
		this.__staticGroup.position.x = 75;
		this.__staticGroup.position.y = 100;
		this.__createCylinder(0, 0, 0xFF0000);
		this.__createCylinder(250, 0, 0x00FF00);
		this.__createCylinder(500, 0, 0x0000FF);

		EZGUI.Theme.load(['/Content/EZGUI/metalworks-theme/metalworks-theme.json'], this.__createEZGUIScreens.bind(this));
	},
	__createCylinder: function (x, y, tint)
	{
		var cylinder = this.__staticGroup.create(x, y, 'glass-back');
		cylinder.width = 150;
		cylinder.height = 400;
		cylinder.alpha = 0.2;
		cylinder.tint = tint;
		cylinder = this.__staticGroup.create(x + 70, y, 'pipe');
		cylinder.width = 10;
		this.__cylinders = this.__cylinders || [];
		this.__cylinders.push(cylinder);
	},
	__update: function ()
	{

	},

	__render: function ()
	{
		if (this.__dragObjInfo)
		{
			this.__game.debug.spriteInfo(this.__dragObjInfo.sprite, 32, 32);
		}
	},
	__createEZGUIScreens: function ()
	{
		var that = this;
		//select # of disks
		this.__screens.DiskSelection = EZGUI.create(Hanoi.ScreenJSON.DiskSelection, 'metalworks');
		this.__screens.DiskSelection.visible = false;
		EZGUI.components.DiskList.bindChildren('mousedown', function (event, src)
		{
			src.animateSizeTo(src.width * 0.9, src.height * 0.9, 100, EZGUI.Easing.Back.Out);
		});
		EZGUI.components.DiskList.bindChildren('mouseup', this.__onNumberOfDiskSelected.bind(this));

		//in game gui
		this.__screens.InGameGui = EZGUI.create(Hanoi.ScreenJSON.InGameGui, 'metalworks');
		this.__screens.InGameGui.visible = false;
		EZGUI.components.tb_new_game.on('mousedown', function (event, src)
		{
			src.animateSizeTo(src.width * 0.9, src.height * 0.9, 100);
		});
		EZGUI.components.tb_restart.on('mousedown', function (event, src)
		{
			src.animateSizeTo(src.width * 0.9, src.height * 0.9, 100);
		});
		EZGUI.components.tb_new_game.on('mouseup', this.__onButtonClicked.bind(this));
		EZGUI.components.tb_restart.on('mouseup', this.__onButtonClicked.bind(this));

		//after the screens are created, show the start screen
		this.__setupGame();
	},
	__onNumberOfDiskSelected: function (event, src)
	{
		this.__curNumberOfDisks = src.userData || this.__curNumberOfDisks;
		var that = this;
		src.animateSizeTo(src.settings.width, src.settings.height, 100, EZGUI.Easing.Back.Out);
		this.__animateDialog(this.__screens.DiskSelection, false, function ()
		{
			that.__startGame();
		});
	},
	__onButtonClicked: function (event, src)
	{
		var that = this;
		src.animateSizeTo(src.settings.width, src.settings.height, 100, EZGUI.Easing.Back.Out, function ()
		{
			switch (src.userData)
			{
				case 'new':

					break;
				case 'restart':

					break;
			}
		});
	},
	__animateDialog: function (dialog, isShowingDialog, afterAnimationCallback)
	{
		if (isShowingDialog)
		{
			dialog.visible = true;
			var moveToY = dialog.position.y;
			dialog.position.y = -dialog.settings.height;
			dialog.animatePosTo(dialog.position.x, moveToY, 800, EZGUI.Easing.Back.Out);
		}
		else
		{
			var targetY = this.__height + 20;
			dialog.animatePosTo(dialog.position.x, targetY, 800, EZGUI.Easing.Back.In, afterAnimationCallback.bind(this));
		}
	},
	__createDisks: function ()
	{
		var y = this.__startingY;
		var spr = null;
		this.__data = [];
		this.__data.push([]);
		this.__data.push([]);
		this.__data.push([]);
		for (var i = this.__curNumberOfDisks; i >= 1; i--)
		{
			//create and setup
			spr = this.__game.add.sprite(0, 0, 'disk');
			this.__disks[i] = spr;
			spr.height = 40;
			spr.width = this.__widthOfDisk[i];
			spr.anchor.setTo(0.5);
			spr.currentAreaIdx = 0;
			spr.currentValue = i;
			spr.inputEnabled = true;
			spr.events.onDragStart.add(this.__onDragStart, this);
			spr.events.onDragStop.add(this.__onDragStop, this);
			//place to correct location
			spr.position.x = this.__startingX[0];
			spr.position.y = y;
			y -= 40;
			//store to data
			this.__data[0].push(i);
		}
		this.__disks[1].input.enableDrag();
	},
	__onDragStart: function (sprite, pointer)
	{
		this.__dragObjInfo = {};
		this.__dragObjInfo.x = sprite.position.x;
		this.__dragObjInfo.y = sprite.position.y;
		this.__dragObjInfo.sprite = sprite;
	},
	__onDragStop: function (sprite, pointer)
	{
		var idx = this.__getDroppedAreaIdx(sprite);
		if (!idx || idx === sprite.currentAreaIdx || !this.__canPutToArea(idx, sprite.currentValue))
		{
			this.__game.add.tween(sprite).to({ x: this.__dragObjInfo.x }, 500, "Bounce.easeOut", true, 0, 0);
			this.__game.add.tween(sprite).to({ y: this.__dragObjInfo.y }, 500, "Bounce.easeOut", true, 0, 0);
		}
		else
		{
			this.__data[sprite.currentAreaIdx].pop();
			sprite.currentAreaIdx = idx;
			this.__data[idx].push(sprite.currentValue);

			//find correct location on dropping area and move it to there.
		}
	},
	__checkOverlap: function (area, spr)
	{
		var bounds = area.getBounds();
		return spr.x <= bounds.right && spr.x >= bounds.left && spr.y <= spr.bottom && spr.y >= bounds.top;
	},
	__canPutToArea: function (areaIdx, diskVal)
	{
		var area = this.__data[areaIdx];
		if (area.length !== 0 && area[area.length - 1] < diskVal)
		{
			return false;
		}
		return true;
	},
	__getDroppedAreaIdx: function (spr)
	{
		for (var i = 0; i < 3; i++)
		{
			if (this.__checkOverlap(this.__cylinders[i], spr))
			{
				return i;
			}
		}
		return null;
	},
	__setupGame: function ()
	{
		this.__animateDialog(this.__screens.DiskSelection, true);
	},
	__startGame: function ()
	{
		this.__timeRemains = this.__maxTimeForNumberOfDisks[this.__curNumberOfDisks];
		this.__stepsMoved = 0;
		this.__isGameOver = false;
		this.__screens.InGameGui.visible = true;
		this.__staticGroup.visible = true;
		this.__createDisks();
		//TODO: set GUI label of time and step to 0
		this.__timer = this.__game.time.events.loop(Phaser.Timer.SECOND, this.__updateTimer.bind(this), this);
		//TODO: place disks to correct location
	},
	__endGame: function ()
	{
		this.__timer.stop();
		//TODO:
	},
	__updateTimer: function ()
	{
		if (!this.__isGameOver)
		{
			this.__timeRemains--;
			if (this.__timeRemains <= 0)
			{
				this.__isGameOver = true;
			}
			EZGUI.components.lbl_time.text = this.__timeRemains;
		}
	},
	init: function ()
	{
		this.__game = new Phaser.Game(this.__width, this.__height, Phaser.AUTO, 'hanoi-container',
		{
			preload: this.__preload.bind(this), create: this.__create.bind(this), update: this.__update.bind(this),
			render: this.__render.bind(this)
		});
		this.__game.backgroundColor = '#4b0049';
	}
};
Hanoi.ScreenJSON =
{
	DiskSelection:
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
                    { id: 'disk-3', text: '3', userData: 3, component: 'Button', position: 'center', width: 100, height: 100, skin: 'levelBtn' },
                    { id: 'disk-4', text: '4', userData: 4, component: 'Button', position: 'center', width: 100, height: 100, skin: 'levelBtn' },
                    { id: 'disk-5', text: '5', userData: 5, component: 'Button', position: 'center', width: 100, height: 100, skin: 'levelBtn' },
                    { id: 'disk-6', text: '6', userData: 6, component: 'Button', position: 'center', width: 100, height: 100, skin: 'levelBtn' },
                    { id: 'disk-7', text: '7', userData: 7, component: 'Button', position: 'center', width: 100, height: 100, skin: 'levelBtn' },
                    { id: 'disk-8', text: '8', userData: 8, component: 'Button', position: 'center', width: 100, height: 100, skin: 'levelBtn' },
            	]
            }
    	]
    },
	InGameGui:
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
            { id: 'tb_new_game', image: 'newgame', userData: "new", component: 'Button', position: 'center', width: 30, height: 30, skin: 'levelBtn' },
			{ id: 'tb_restart', image: 'restart', userData: "restart", component: 'Button', position: 'center', width: 30, height: 30, skin: 'levelBtn' }
    	]
    },
};
$(function ()
{
	var g = new Hanoi();
	g.init();
});