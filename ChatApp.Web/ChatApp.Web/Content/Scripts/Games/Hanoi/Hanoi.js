var Hanoi = function ()
{

};
Hanoi.prototype =
{
    __game: null,
    __width: 1000,
    __height: 600,
    __diskMoveAnimDuration: 300,
    __screens: null,
    __sounds: null,
    __curNumberOfDisks: 3,
    __isGameOver: false,
    __isPlaying: false,
    __staticGroup: null,
    __sounds: null,
    __bgFire: null,
    __bg: null,
    __strings: { win: "Level completed", lose: "Time's up" },
    __timeRemains: 0,
    __stepsMoved: 0,
    __timer: null,
    __maxTimeForNumberOfDisks: [0, 0, 0, 180, 240, 300, 360, 420, 480],
    __disks: null,
    __widthOfDisk: [60, 70, 80, 90, 100, 110, 120, 130, 140],
    __tintOfDisk: [0, 0x00FF00, 0xFFFF00, 0x00FFFF, 0xFFCC00, 0x99DDFF, 0xFF6600, 0x00CCFF, 0x66FF00],
    __startingX: [150, 400, 650],
    __startingY: 480, // 500-20
    __dragObjInfo: null,
    __data: null,
    __cylinders: null,

    __preload: function ()
    {
        this.__game.load.image('disk', '/Content/Images/Games/Hanoi/block2.png');
        this.__game.load.image('pipe', '/Content/Images/Games/Hanoi/pipe.png');
        this.__game.load.image('glass-back', '/Content/Images/Games/Hanoi/glass-back.png');
        this.__game.load.script('filter-fire', '/Content/Scripts/Games/Hanoi/Fire.js');
        this.__game.load.audio('tick1', '/Content/Sound/clock-tick1.ogg');
        this.__game.load.audio('tick2', '/Content/Sound/clock-tick2.ogg');
        this.__game.load.audio('tick3', '/Content/Sound/clock-tick3.ogg');
        this.__game.load.audio('tick4', '/Content/Sound/clock-tick4.ogg');
        this.__game.load.audio('disk-mousedown', '/Content/Sound/block-mousedown.ogg');
        this.__game.load.audio('disk-placed', '/Content/Sound/block-placed.ogg');

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
        this.__sounds.win = this.__game.add.audio('win');
        this.__sounds.lose = this.__game.add.audio('lose');
        this.__staticGroup = this.__game.add.group();
        this.__staticGroup.visible = false;
        this.__staticGroup.position.x = 75;
        this.__staticGroup.position.y = 100;
        this.__createCylinder(0, 0, 0xFF0000);
        this.__createCylinder(250, 0, 0x00FF00);
        this.__createCylinder(500, 0, 0x0000FF);

        //background fire
        this.__bg = this.__game.add.sprite(0, 0);
        this.__bg.visible = false;
        this.__bg.width = 800;
        this.__bg.height = 600;
        this.__bgFire = this.__game.add.filter('Fire', 800, 600);
        this.__bgFire.alpha = 0.0;
        this.__bg.filters = [this.__bgFire];

        //sound
        this.__sounds = this.__sounds || {};
        this.__sounds.ticks = [];
        for (var i = 1; i < 5; i++)
        {
            this.__sounds.ticks.push(this.__game.add.audio('tick' + i));
        }
        this.__sounds.disk_mousedown = this.__game.add.audio('disk-mousedown');
        this.__sounds.disk_placed = this.__game.add.audio('disk-placed');

        EZGUI.Theme.load(['/Content/EZGUI/metalworks-theme/metalworks-theme.json'], this.__createEZGUIScreens.bind(this));
    },
    __createCylinder: function (x, y, tint)
    {
        var cylinder = this.__staticGroup.create(x, y, 'glass-back');
        cylinder.width = 150;
        cylinder.height = 400;
        cylinder.alpha = 0.4;
        //cylinder.tint = tint;
        this.__cylinders = this.__cylinders || [];
        this.__cylinders.push(cylinder);
        cylinder = this.__staticGroup.create(x + 70, y, 'pipe');
        cylinder.width = 10;
    },
    __update: function ()
    {
        if (this.__isPlaying)
        {
            this.__bgFire.update();
            EZGUI.components.lbl_step.text = this.__stepsMoved;
            this.__checkGameOver();
        }
    },

    __render: function ()
    {
        //if (this.__dragObjInfo)
        //{
        //	this.__game.debug.spriteInfo(this.__dragObjInfo.sprite, 32, 32);
        //}
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

        //end
        this.__screens.End = EZGUI.create(Hanoi.ScreenJSON.End, 'metalworks');
        this.__screens.End.visible = false;
        EZGUI.components.end_btn_new_game.on('mouseup', this.__onButtonClicked.bind(this));
        EZGUI.components.end_btn_next.on('mouseup', this.__onButtonClicked.bind(this));
        EZGUI.components.end_btn_restart.on('mouseup', this.__onButtonClicked.bind(this));
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
            switch (src.Id)
            {
                case 'tb_new_game':
                    that.__endGame(null, false, null);
                    that.__setupGame();
                    break;
                case 'tb_restart':
                    that.__endGame(null, false, null);
                    that.__startGame();
                    break;
                case 'end_btn_new_game':
                    that.__animateDialog(that.__screens.End, false, function ()
                    {
                        that.__setupGame();
                    });
                    break;
                case 'end_btn_next':
                    that.__animateDialog(that.__screens.End, false, function ()
                    {
                        that.__curNumberOfDisks++;
                        that.__startGame();
                    });
                    break;
                case 'end_btn_restart':
                    that.__animateDialog(that.__screens.End, false, function ()
                    {
                        that.__startGame();
                    });
                    break;
            }
        });
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
    __playClockTickSound: function ()
    {
        var n = this.__game.rnd.integerInRange(0, this.__sounds.ticks.length - 1);
        this.__sounds.ticks[n].play();
    },
    __createDisks: function ()
    {
        var y = this.__startingY;
        var spr = null;
        this.__data = [];
        this.__data.push([]);
        this.__data.push([]);
        this.__data.push([]);
        this.__disks = {};
        for (var i = this.__curNumberOfDisks; i >= 1; i--)
        {
            //create and setup
            spr = this.__game.add.sprite(0, 0, 'disk');
            this.__disks[i] = spr;
            spr.height = 40;
            spr.width = this.__widthOfDisk[i];
            spr.anchor.setTo(0.5);
            spr.tint = this.__tintOfDisk[i];
            spr.currentAreaIdx = 0;
            spr.currentValue = i;
            spr.inputEnabled = true;
            spr.events.onDragStart.add(this.__onDragStart, this);
            spr.events.onDragStop.add(this.__onDragStop, this);
            var text = this.__game.add.text(0, 0, i, { font: "20px Arial", fill: "#FFFFFF" });
            text.anchor.setTo(0.5);
            spr.addChild(text);
            //place to correct location
            spr.position.x = this.__startingX[0];
            spr.position.y = y;
            y -= 40;
            //store to data
            this.__data[0].push(spr);
        }
        this.__disks[1].input.enableDrag();
    },
    __onDragStart: function (sprite, pointer)
    {
        //if (this.__dragObjInfo === null)
        //{
        this.__dragObjInfo = {};
        this.__dragObjInfo.x = sprite.position.x;
        this.__dragObjInfo.y = sprite.position.y;
        this.__dragObjInfo.sprite = sprite;
        sprite.bringToTop();
        this.__sounds.disk_mousedown.play();
        //}
    },
    __onDragStop: function (sprite, pointer)
    {
        var idx = this.__getDroppedAreaIdx(sprite);
        sprite.input.disableDrag();
        if (null === idx || idx === sprite.currentAreaIdx || !this.__canPutToArea(idx, sprite.currentValue))
        {
            this.__game.add.tween(sprite).to({ x: this.__dragObjInfo.x }, this.__diskMoveAnimDuration, "Bounce.easeOut", true, 0, 0);
            this.__game.add.tween(sprite).to({ y: this.__dragObjInfo.y }, this.__diskMoveAnimDuration, "Bounce.easeOut", true, 0, 0).onComplete.add(function ()
            {
                sprite.input.enableDrag();
            });
        }
        else
        {
            this.__moveDisk(sprite.currentAreaIdx, idx, sprite);
        }
    },
    __moveDisk: function (fromIdx, toIdx, sprite)
    {
        //move display, this must be done before move data because we use data to find correct y location
        var to = { x: this.__startingX[toIdx], y: this.__startingY };
        for (var i = 0; i < this.__data[toIdx].length; i++)
        {
            to.y -= 40;
        }
        //play sound
        this.__sounds.disk_placed.play();
        this.__game.add.tween(sprite).to({ x: to.x }, this.__diskMoveAnimDuration, "Bounce.easeOut", true, 0, 0);
        this.__game.add.tween(sprite).to({ y: to.y }, this.__diskMoveAnimDuration, "Bounce.easeOut", true, 0, 0).onComplete.add(function myfunction()
        {
            //move data
            this.__data[fromIdx].pop();
            sprite.currentAreaIdx = toIdx;
            this.__data[toIdx].push(sprite);

            //toggle drag
            this.__toggleDrag(fromIdx, toIdx);

            //add conter
            this.__stepsMoved++;

            //re-enable drag
            sprite.input.enableDrag();
        }, this);
    },
    __toggleDrag: function (fromIdx, toIdx)
    {
        for (var i = 0; i < 3; i++)
        {
            if (this.__data[i].length > 0)
            {
                this.__data[i][this.__data[i].length - 1].input.enableDrag();
            }
        }
        //var arr = this.__data[fromIdx];
        //if (arr.length > 0)
        //{
        //    arr[arr.length - 1].input.enableDrag();
        //}
        //arr = this.__data[toIdx];
        //if (arr.length - 2 >= 0)
        //{
        //    arr[arr.length - 2].input.disableDrag();
        //}
    },
    __checkOverlap: function (area, spr)
    {
        var bounds = area.getBounds();
        return spr.x <= bounds.right && spr.x >= bounds.left && spr.y <= spr.bottom && spr.y >= bounds.top;
    },
    __canPutToArea: function (areaIdx, diskVal)
    {
        var area = this.__data[areaIdx];
        if (area.length !== 0 && area[area.length - 1].currentValue < diskVal)
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
    __setGameScreenVisibility: function (toShow)
    {
        this.__staticGroup.visible = toShow;
        for (var prop in this.__disks)
        {
            if (this.__disks.hasOwnProperty(prop))
            {
                this.__disks[prop].visible = toShow;
            }
        }
        this.__bg.visible = toShow;
        //gui
        this.__screens.InGameGui.visible = toShow;
    },
    __checkGameOver: function ()
    {
        if (this.__isPlaying)
        {
            if (this.__data[2].length == this.__curNumberOfDisks)
            {
                //win
                this.__endGame(this.__screens.End, true, this.__strings.win);
            }
            else if (this.__isGameOver)
            {
                //lose
                this.__endGame(this.__screens.End, true, this.__strings.lose);
            }
        }
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
        this.__isPlaying = true;
        this.__createDisks();
        this.__setGameScreenVisibility(true);
        EZGUI.components.lbl_time.text = this.__maxTimeForNumberOfDisks[this.__curNumberOfDisks];
        this.__timer = this.__game.time.create(true);
        this.__timer.loop(Phaser.Timer.SECOND, this.__updateTimer.bind(this), this);
        this.__timer.start();
    },
    __endGame: function (dialog, showDialog, title)
    {
        this.__timer.stop(true);
        this.__timer.destroy();
        this.__setGameScreenVisibility(false);
        this.__isGameOver = false;
        this.__isPlaying = false;
        if (showDialog)
        {
            EZGUI.components.end_lbl_time.text = this.__maxTimeForNumberOfDisks[this.__curNumberOfDisks] - this.__timeRemains;
            EZGUI.components.end_lbl_step.text = this.__stepsMoved;
            EZGUI.components.lbl_title.text = title;
            if (this.__curNumberOfDisks === 8)
            {
                EZGUI.components.end_btn_next.visible = false;
            }
            else
            {
                EZGUI.components.end_btn_next.visible = true;
            }
            this.__animateDialog(this.__screens.End, true);
        }
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
            else if (this.__timeRemains <= 15)
            {
                this.__playClockTickSound();
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
};
$(function ()
{
    var g = new Hanoi();
    g.init();
});