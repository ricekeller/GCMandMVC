var Minesweeper = function () {

}
Minesweeper.prototype =
{
    __game: null,
    __width: 1000,
    __height: 600,
    __difficulty: null,
    __screens: null,
    __mineGrid: null,
    __mineCount: null,
    __gridWidth: null,
    __gridHeight: null,
    __mineDic: null,
    __areaSize: 30,
    __gameResult: null,
    __debug: true,
    __concealedCount: null,
    __loseTitle: "Sorry, you lost this game. Better luck next time!",
    __winTitle: "Congratulations, you won the game!",
    __startTime: null,
    __gamePlayed: 0,
    __gameWon: 0,
    __elapsedTime: 0,
    __updateTimer: null,


    __preload: function () {
        this.__game.load.image('tile', '/Content/Images/Games/Minesweeper/concealed.png');
        this.__game.load.image('mine', '/Content/Images/Games/Minesweeper/1.png');
        this.__game.load.image('empty', '/Content/Images/Games/Minesweeper/blueblock.png');
        this.__game.load.image('flagged', '/Content/Images/Games/Minesweeper/flag.png');
        this.__game.load.image('inquestion', '/Content/Images/Games/Minesweeper/questionmark.png');
        this.__game.load.image('number1', '/Content/Images/Games/Minesweeper/number1.png');
        this.__game.load.image('number2', '/Content/Images/Games/Minesweeper/number2.png');
        this.__game.load.image('number3', '/Content/Images/Games/Minesweeper/number3.png');
        this.__game.load.image('number4', '/Content/Images/Games/Minesweeper/number4.png');
        this.__game.load.image('number5', '/Content/Images/Games/Minesweeper/number5.png');
        this.__game.load.image('number6', '/Content/Images/Games/Minesweeper/number6.png');
        this.__game.load.image('number7', '/Content/Images/Games/Minesweeper/number7.png');
        this.__game.load.image('number8', '/Content/Images/Games/Minesweeper/number8.png');

        var EZimages = {};
        EZimages.Keys = ['newgame', 'restart', 'clock', 'mine-tb'];
        EZimages.Urls = ['/Content/Images/Games/Minesweeper/newgame.png', '/Content/Images/Games/Minesweeper/restart.png',
                         '/Content/Images/Games/Minesweeper/clock.png', '/Content/Images/Games/Minesweeper/mine2.png'];
        for (var i = 0; i < EZimages.Urls.length; i++) {
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
        this.__screens = {};
        EZGUI.Theme.load(['/Content/EZGUI/metalworks-theme/metalworks-theme.json'], this.__createEZGUIScreens.bind(this));
    },
    __update: function () {
        this.__updateFlaggedCount();
        if (this.__checkWin()) {
            this.__gameResult = Minesweeper.GameResult.Win;
        }
        switch (this.__gameResult) {
            case Minesweeper.GameResult.Win:
                this.__endGame(this.__winTitle, true, true);
                break;
            case Minesweeper.GameResult.Lose:
                this.__endGame(this.__loseTitle, false, true);
                break;
        }
    },
    __render: function () {
        //this.__game.debug.cameraInfo(this.__game.camera, 32, 500);
    },
    __createEZGUIScreens: function () {
        //select difficulty
        this.__screens.SelectDifficulty = EZGUI.create(Minesweeper.Screens.SelectDifficulty, 'metalworks');
        this.__screens.SelectDifficulty.visible = false;
        EZGUI.components.Beginner.on('click', this.__onChooseDifficulty.bind(this));
        EZGUI.components.Intermediate.on('click', this.__onChooseDifficulty.bind(this));
        EZGUI.components.Advanced.on('click', this.__onChooseDifficulty.bind(this));

        //end
        this.__screens.End = EZGUI.create(Minesweeper.Screens.End, 'metalworks');
        this.__screens.End.visible = false;
        EZGUI.components.btn_replay.on('click', this.__onStartGameClicked.bind(this));
        EZGUI.components.btn_new.on('click', this.__onStartGameClicked.bind(this));

        //toolbar
        this.__screens.Toolbar = EZGUI.create(Minesweeper.Screens.Toolbar, 'metalworks');
        this.__screens.Toolbar.visible = false;
        EZGUI.components.tb_new_game.on('mousedown', this.__onToolbarButtonDown.bind(this));
        EZGUI.components.tb_restart.on('mousedown', this.__onToolbarButtonDown.bind(this));
        EZGUI.components.tb_new_game.on('mouseup', this.__onToolbarButtonUp.bind(this));
        EZGUI.components.tb_restart.on('mouseup', this.__onToolbarButtonUp.bind(this));
        //create the game
        this.__showDifficultySelection();
    },
    __onChooseDifficulty: function myfunction(evt, src) {
        var dialog = this.__screens.SelectDifficulty;
        this.__difficulty = Minesweeper.Difficulty[src.guiID];
        this.__animateDialog(dialog, false, function () {
            dialog.visible = false;
            this.__startNewGame();
        });
    },
    __createLevel: function () {
        switch (this.__difficulty) {
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
    __generateLevel: function (width, height, mineCnt) {
        this.__mineGrid = this.__game.add.group();
        this.__mineCount = mineCnt;
        this.__gridWidth = width;
        this.__gridHeight = height;
        this.__concealedCount = width * height;
        var size = this.__areaSize;
        var curX = 0, curY = 0;
        //create sprite
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var tile = this.__mineGrid.create(curX, curY, 'tile');
                tile.rowIdx = i;
                tile.colIdx = j;
                tile.currentState = Minesweeper.AreaState.Concealed;
                tile.isMine = false;
                tile.width = size;
                tile.height = size;
                tile.inputEnabled = true;
                tile.events.onInputDown.add(this.__onAreaMouseDown.bind(this), this);
                tile.events.onInputUp.add(this.__onAreaMouseUp.bind(this), this);
                curX += size + 1;
            }
            curX = 0;
            curY += size + 1;
        }
        //randomly generate mines
        this.__mineDic = {};
        var n = null;
        var rIdx = null;
        var cIdx = null;
        while (mineCnt > 0) {
            n = this.__game.rnd.integerInRange(0, width * height - 1);
            if (this.__mineGrid.children[n] && !this.__mineGrid.children[n].isMine) {
                this.__mineGrid.children[n].isMine = true;
                rIdx = Math.floor(n / width);
                cIdx = n % width;
                this.__mineDic[rIdx] = this.__mineDic[rIdx] || {};
                this.__mineDic[rIdx][cIdx] = true;
                mineCnt--;
                if (this.__debug) {
                    this.__loadTexture(this.__mineGrid.children[n], 'mine');
                }
            }
        }

        this.__mineGrid.position.x = (this.__width - this.__mineGrid.width) / 2;
        this.__mineGrid.position.y = (this.__height - this.__mineGrid.height) / 2 + 25;
    },
    __onAreaMouseDown: function (src, pointer) {
        //should play animation when mouse is down
    },
    __onAreaMouseUp: function (src, pointer) {
        if (src.currentState === Minesweeper.AreaState.Revealed) {
            return;
        }
        switch (pointer.button) {
            case 0://left
                //reveal the area
                this.__onAreaClicked(src);
                break;
            case 2://right
                //flag area,change the key of sprite to flag,
                var newKey = null;
                var newState = null;
                switch (src.currentState) {
                    case Minesweeper.AreaState.Concealed:
                        newKey = 'flagged';
                        newState = Minesweeper.AreaState.Flagged;
                        break;
                    case Minesweeper.AreaState.Flagged:
                        newKey = 'inquestion';
                        newState = Minesweeper.AreaState.Inquestion;
                        break;
                    case Minesweeper.AreaState.Inquestion:
                        newKey = 'tile';
                        newState = Minesweeper.AreaState.Concealed;
                        break;
                }
                this.__loadTexture(src, newKey);
                src.currentState = newState;
                break;
        }
    },
    __onAreaClicked: function (area) {
        var que = new Queue();
        var visited = {};
        que.enqueue(area);
        while (!que.isEmpty()) {
            var cur = que.dequeue();
            if (visited[cur.rowIdx] && visited[cur.rowIdx][cur.colIdx]) {
                continue;
            }
            if (cur.isMine) {
                this.__gameResult = Minesweeper.GameResult.Lose;
            }
            else {
                var mineCnt = 0;
                var adjaIdx = [{ r: cur.rowIdx - 1, c: cur.colIdx - 1 },
    							{ r: cur.rowIdx - 1, c: cur.colIdx },
								{ r: cur.rowIdx - 1, c: cur.colIdx + 1 },
								{ r: cur.rowIdx, c: cur.colIdx - 1 },
								{ r: cur.rowIdx, c: cur.colIdx + 1 },
								{ r: cur.rowIdx + 1, c: cur.colIdx - 1 },
								{ r: cur.rowIdx + 1, c: cur.colIdx },
								{ r: cur.rowIdx + 1, c: cur.colIdx + 1 }];
                var p = null;
                for (var i = 0; i < adjaIdx.length; i++) {
                    p = adjaIdx[i];
                    if (p.r >= 0 && p.r < this.__gridHeight && p.c >= 0 && p.c < this.__gridWidth) {
                        if (this.__mineDic[p.r] && this.__mineDic[p.r][p.c]) {
                            mineCnt++;
                        }
                    }
                }
                if (mineCnt == 0) {
                    this.__revealArea(cur, 'empty');
                    for (var i = 0; i < adjaIdx.length; i++) {
                        p = adjaIdx[i];
                        if (p.r >= 0 && p.r < this.__gridHeight && p.c >= 0 && p.c < this.__gridWidth) {
                            que.enqueue(this.__mineGrid.children[p.r * this.__gridWidth + p.c]);
                        }
                    }
                }
                else {
                    this.__revealArea(cur, "number" + mineCnt);
                }
            }
            visited[cur.rowIdx] = visited[cur.rowIdx] || {};
            visited[cur.rowIdx][cur.colIdx] = true;
        }
    },
    __revealArea: function (area, key) {
        if (area.currentState !== Minesweeper.AreaState.Revealed) {
            this.__loadTexture(area, key);
            area.currentState = Minesweeper.AreaState.Revealed;
            this.__concealedCount--;
        }
    },
    __checkWin: function () {
        if (this.__concealedCount && this.__mineCount &&
		this.__concealedCount == this.__mineCount && this.__gameResult == Minesweeper.GameResult.Playing) {
            return true;
        }
        return false;
    },
    __loadTexture: function (src, key) {
        if (src) {
            src.loadTexture(key);
            src.width = this.__areaSize;
            src.height = this.__areaSize;
        }
    },
    __animateDialog: function (dialog, isShowingDialog, afterAnimationCallback) {
        if (isShowingDialog) {
            dialog.visible = true;
            var moveToY = dialog.position.y;
            dialog.position.y = -dialog.settings.height;
            dialog.animatePosTo(dialog.position.x, moveToY, 800, EZGUI.Easing.Back.Out);
        }
        else {
            var targetY = this.__height + 20;
            var that = this;
            dialog.animatePosTo(dialog.position.x, targetY, 800, EZGUI.Easing.Back.In, afterAnimationCallback.bind(this));
        }
    },
    __createUpdateTimer: function () {
        this.__updateTimer = this.__game.time.create(false);
        this.__updateTimer.loop(1000, this.__timerCallback.bind(this), this);
    },
    __timerCallback: function () {
        if (this.__gameResult === Minesweeper.GameResult.Playing) {
            this.__elapsedTime++;
            EZGUI.components.tb_timer_lbl.text = this.__elapsedTime;
        }
    },
    __updateFlaggedCount: function () {
        if (this.__gameResult == Minesweeper.GameResult.Playing) {
            var flagCnt = 0;
            for (var i = 0; i < this.__mineGrid.children.length; i++) {
                if (this.__mineGrid.children[i].currentState === Minesweeper.AreaState.Flagged) {
                    flagCnt++;
                }
            }
            EZGUI.components.tb_mines_lbl.text = this.__mineCount - flagCnt;
        }
    },
    __showDifficultySelection: function () {
        if (this.__mineGrid) {
            this.__mineGrid.visible = false;
        }
        this.__animateDialog(this.__screens.SelectDifficulty, true);
    },
    __onStartGameClicked: function (evt, src) {
        this.__animateDialog(this.__screens.End, false, function () {
            switch (src.userData) {
                case 'new':
                    this.__showDifficultySelection();
                    break;
                case 'restart':
                    this.__restartGame();
                    break;
            }
        });
    },
    __onToolbarButtonClicked: function (evt, src) {
        this.__endGame("", "", false);
        switch (src.userData) {
            case 'new':
                this.__showDifficultySelection();
                break;
            case 'restart':
                this.__restartGame();
                break;
        }
    },
    __onToolbarButtonDown: function (evt, src) {
        src.animateSizeTo(src.width * 0.9, src.height * 0.8, 100, EZGUI.Easing.Back.Out);
    },
    __onToolbarButtonUp: function (evt, src) {
        var that = this;
        src.animateSizeTo(src.settings.width, src.settings.height, 100, EZGUI.Easing.Back.Out, function () {
            that.__onToolbarButtonClicked(evt, src);
        });
    },
    __endGame: function (titleText, playWinAnim, showEndScreen) {
        if (this.__winTitle === titleText) {
            this.__gameWon++;
        }
        this.__gameResult = null;
        this.__mineGrid.visible = false;
        this.__screens.Toolbar.visible = false;
        this.__updateTimer.stop();
        this.__updateTimer = null;
        if (showEndScreen) {
            this.__screens.End.visible = true;
            EZGUI.components.lbl_title.text = titleText;
            EZGUI.components.lbl_time.text = "Time: " + this.__elapsedTime + " seconds";
            EZGUI.components.lbl_gamesPlayed.text = "Games played: " + this.__gamePlayed;
            EZGUI.components.lbl_gamesWon.text = "Games won: " + this.__gameWon;
            EZGUI.components.lbl_percentage.text = "Percentage: " + this.__gamePlayed === 0 ? 0 : (this.__gameWon / this.__gamePlayed * 100).toFixed(2) + "%";
            var moveToY = this.__screens.End.position.y;
            this.__screens.End.position.y = -this.__screens.End.settings.height;
            this.__screens.End.animatePosTo(this.__screens.End.position.x, moveToY, 800, EZGUI.Easing.Back.Out);
        }
    },
    __startNewGame: function () {
        this.__createLevel();
        this.__resetGameProperties();
    },
    __restartGame: function () {
        this.__concealedCount = this.__gridHeight * this.__gridWidth;
        for (var i = 0; i < this.__mineGrid.children.length; i++) {
            this.__resetArea(this.__mineGrid.children[i]);
        }
        this.__resetGameProperties();
    },
    __resetArea: function (area) {
        if (!this.__debug) {
            this.__loadTexture(area, 'tile');
        }
        else if (area.isMine) {
            this.__loadTexture(area, 'mine');
        }
        else {
            this.__loadTexture(area, 'tile');
        }
        area.currentState = Minesweeper.AreaState.Concealed;
    },
    __resetGameProperties: function () {
        this.__gameResult = Minesweeper.GameResult.Playing;
        this.__mineGrid.visible = true;
        for (var key in this.__screens) {
            if (this.__screens.hasOwnProperty(key)) {
                var sc = this.__screens[key];
                sc.position.x = sc.settings.position.x;
                sc.position.y = sc.settings.position.y;
                sc.visible = false;
            }
        }
        this.__startTime = Date.now();
        this.__elapsedTime = 0;
        EZGUI.components.tb_timer_lbl.text = "0";
        this.__gamePlayed++;
        this.__screens.Toolbar.visible = true;
        this.__createUpdateTimer();
        this.__updateTimer.start();
    },
    init: function () {
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
Minesweeper.AreaState =
{
    Concealed: 0,
    Flagged: 1,
    Inquestion: 2,
    Revealed: 3
}
Minesweeper.GameResult =
{
    Win: 0,
    Lose: 1,
    Playing: 2,
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
    End:
	{
	    id: 'end',
	    component: 'Window',

	    padding: 4,
	    position: { x: 180, y: 100 },
	    width: 640,
	    height: 400,
	    layout: [3, 5],
	    children: [
			null,
			{
			    id: "lbl_title",
			    component: 'Label',
			    text: "Sorry, you lost this game. Better luck next time!",
			    font: {
			        size: '30px',
			        family: 'Skranji',
			        color: 'white'
			    },
			    position: 'center',
			    width: 200,
			    height: 60
			},
			null,

			null,
			null,
			null,

			null,
			{
			    id: 'lbl_time',
			    text: 'Time: 2 seconds',
			    component: 'Label',
			    position: 'center',
			    font: {
			        size: '20px',
			        family: 'Skranji',
			        color: 'green'
			    },
			    width: 150,
			    height: 60
			},
			null,

			{
			    id: 'lbl_gamesPlayed',
			    text: 'Games played:4',
			    component: 'Label',
			    position: 'center',
			    font: {
			        size: '20px',
			        family: 'Skranji',
			        color: 'blue'
			    },
			    width: 150,
			    height: 60
			},
			{
			    id: 'lbl_gamesWon',
			    text: 'Games won:1',
			    component: 'Label',
			    position: 'center',
			    font: {
			        size: '20px',
			        family: 'Skranji',
			        color: 'blue'
			    },
			    width: 150,
			    height: 60
			},
			{
			    id: 'lbl_percentage',
			    text: 'Percentage:25%',
			    component: 'Label',
			    position: 'center',
			    font: {
			        size: '20px',
			        family: 'Skranji',
			        color: 'blue'
			    },
			    width: 150,
			    height: 60
			},

			{
			    id: 'btn_replay',
			    text: 'Restart this game',
			    userData: "restart",
			    component: 'Button',
			    position: 'center',
			    font: {
			        size: '23px',
			        family: 'Skranji',
			        color: 'red'
			    },
			    width: 200,
			    height: 60
			},
			null,
			{
			    id: 'btn_new',
			    text: 'New game',
			    userData: "new",
			    component: 'Button',
			    position: 'center',
			    font: {
			        size: '23px',
			        family: 'Skranji',
			        color: 'red'
			    },
			    width: 200,
			    height: 60
			}
	    ]
	},
    Toolbar:
	{
	    id: 'toolbar',
	    component: 'Window',

	    padding: 2,
	    position: { x: 0, y: 0 },
	    width: 1000,
	    height: 50,
	    layout: [1, 1],
	    children: [
			{
			    id: 'toobarList',
			    component: 'List',
			    dragY: false,
			    dragX: false,
			    padding: 0,
			    position: { x: 0, y: 0 },
			    width: 1000,
			    height: 50,
			    layout: [8, 1],
			    children: [
					{ id: 'tb_new_game', image: 'newgame', userData: "new", component: 'Button', position: 'center', width: 30, height: 30, skin: 'levelBtn' },
					{ id: 'tb_restart', image: 'restart', userData: "restart", component: 'Button', position: 'center', width: 30, height: 30, skin: 'levelBtn' },
					null,
					null,
					{ id: 'tb_timer_img', image: 'clock', component: 'Button', position: 'center', width: 30, height: 30, skin: 'levelBtn' },
					{ id: 'tb_timer_lbl', text: '0', component: 'Label', position: 'left', width: 50, height: 50, font: { color: '#00EEFF' } },
					{ id: 'tb_mines_img', image: 'mine-tb', component: 'Button', position: 'center', width: 30, height: 30, skin: 'levelBtn' },
					{ id: 'tb_mines_lbl', text: '19', component: 'Label', position: 'left', width: 50, height: 50, font: { color: '#00EEFF' } },

			    ]
			}
	    ]
	},
}
$(function () {
    var g = new Minesweeper();
    g.init();
});