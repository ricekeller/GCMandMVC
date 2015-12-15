var MainGame = MainGame || {};

MainGame.Boot = function ()
{

}

MainGame.Boot.prototype =
{
	preload: function ()
	{
		this.load.image("loading-empty", "/Content/Images/loadingEmpty.png");
		this.load.image("loading-full", "/Content/Images/loadingFull.png");
	},
	create: function ()
	{
		this.state.start('preload');
	}
}

MainGame.Preloader = function ()
{

}

MainGame.Preloader.prototype =
{
	preload: function ()
	{
		this.__loadProgressBar = this.add.group();
		this.__loadProgressBar.create(0, 0, 'loading-empty');
		var loading = this.__loadProgressBar.create(0, 0, 'loading-full');
		this.load.setPreloadSprite(loading);
		this.__loadProgressBar.x = (this.game.width - this.__loadProgressBar.width) / 2;
		this.__loadProgressBar.y = (this.game.height - this.__loadProgressBar.height) / 2;
		//load assets
		this.load.image('brick.png', '/Content/Images/Games/BattleCity/brick.png');
		this.load.image('eagle.png', '/Content/Images/Games/BattleCity/eagle.png');
		this.load.image('lose.png', '/Content/Images/Games/BattleCity/lose.png');
		this.load.image('starting_point.png', '/Content/Images/Games/BattleCity/starting_point.png');
		this.load.image('stone.png', '/Content/Images/Games/BattleCity/stone.png');
	},
	create: function ()
	{
		this.state.start("mainmenu");
	}
}

MainGame.MainMenu = function ()
{

}

MainGame.MainMenu.prototype =
{
	__map: null,

	preload: function ()
	{

	},
	create: function ()
	{

	}
}