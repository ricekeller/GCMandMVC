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

    __preload: function ()
    {
        this.__game.load.image( 'disk', '/Content/Images/Games/Hanoi/disk.png' );
        this.__game.load.image( 'pipe', '/Content/Images/Games/Hanoi/pipe.png' );
        this.__game.load.image( 'glass-back', '/Content/Images/Games/Hanoi/glass-back.png' );

        //TODO: change images
        var EZimages = {};
        EZimages.Keys = ['newgame', 'restart', 'clock', 'mine-tb'];
        EZimages.Urls = ['/Content/Images/Games/Minesweeper/newgame.png', '/Content/Images/Games/Minesweeper/restart.png',
                         '/Content/Images/Games/Minesweeper/clock.png', '/Content/Images/Games/Minesweeper/mine2.png'];
        for ( var i = 0; i < EZimages.Urls.length; i++ )
        {
            this.__game.load.image( EZimages.Keys[i], EZimages.Urls[i] );
        }
        //Note that you need to call fixCache here to fix compatibility issue
        //this is temporary fix, it will be replaced with a specific EZGUI Loader
        this.__game.load.onLoadComplete.add( EZGUI.Compatibility.fixCache, this.__game.load, null, EZimages.Keys );
    },

    __create: function ()
    {
        //prevent right click being captured by browser
        this.__game.canvas.oncontextmenu = function ( e ) { e.preventDefault(); }
        this.__screens = {};
        this.__sounds = this.__sounds || {};
        this.__sounds.win = this.__game.add.audio( 'win' );
        this.__sounds.lose = this.__game.add.audio( 'lose' );
        this.__staticGroup = this.__game.add.group();
        this.__staticGroup.visible = false;


        EZGUI.Theme.load( ['/Content/EZGUI/metalworks-theme/metalworks-theme.json'], this.__createEZGUIScreens.bind( this ) );
    },

    __update: function ()
    {

    },

    __render: function ()
    {

    },
    __createEZGUIScreens: function ()
    {
        //select # of disks
        this.__screens.DiskSelection = EZGUI.create( Hanoi.ScreenJSON.DiskSelection, 'metalworks' );
        this.__screens.DiskSelection.visible = false;
        EZGUI.components.DiskList.bindChildren( 'mousedown', function ( event, src )
        {
            src.animateSizeTo( src.width * 0.9, src.height * 0.9, 100, EZGUI.Easing.Back.Out );
        } );
        EZGUI.components.DiskList.bindChildren( 'mouseup', this.__onNumberOfDiskSelected.bind( this ) );


        //after the screens are created, show the start screen
        this.__setupGame();
    },
    __onNumberOfDiskSelected: function ( event, src )
    {
        this.__curNumberOfDisks = src.userData || this.__curNumberOfDisks;
        var that = this;
        src.animateSizeTo( src.settings.width, src.settings.height, 100, EZGUI.Easing.Back.Out );
        this.__animateDialog( this.__screens.DiskSelection, false, function ()
        {
            that.__startGame();
        } );
        Debug.writeln( this.__curNumberOfDisks );
    },
    __animateDialog: function ( dialog, isShowingDialog, afterAnimationCallback )
    {
        if ( isShowingDialog )
        {
            dialog.visible = true;
            var moveToY = dialog.position.y;
            dialog.position.y = -dialog.settings.height;
            dialog.animatePosTo( dialog.position.x, moveToY, 800, EZGUI.Easing.Back.Out );
        }
        else
        {
            var targetY = this.__height + 20;
            dialog.animatePosTo( dialog.position.x, targetY, 800, EZGUI.Easing.Back.In, afterAnimationCallback.bind( this ) );
        }
    },
    __setupGame: function ()
    {
        this.__animateDialog( this.__screens.DiskSelection, true );
    },
    __startGame: function ()
    {
        this.__timeRemains = this.__maxTimeForNumberOfDisks[this.__curNumberOfDisks];
        this.__stepsMoved = 0;
        this.__isGameOver = false;
        //TODO: set GUI label of time and step to 0
        this.__timer = this.__game.time.events.loop( Phaser.Timer.SECOND, this.__updateTimer.bind( this ), this );
        //TODO: place disks to correct location
    },
    __updateTimer: function ()
    {
        if ( !this.__isGameOver )
        {
            Debug.writeln( this.__timeRemains );
            this.__timeRemains--;
            if ( this.__timeRemains <= 0 )
            {
                this.__isGameOver = true;
            }
            //TODO: update the text on the label 
        }
    },
    init: function ()
    {
        this.__game = new Phaser.Game( this.__width, this.__height, Phaser.AUTO, 'hanoi-container',
		{
		    preload: this.__preload.bind( this ), create: this.__create.bind( this ), update: this.__update.bind( this ),
		    render: this.__render.bind( this )
		} );
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
};
$( function ()
{
    var g = new Hanoi();
    g.init();
} );