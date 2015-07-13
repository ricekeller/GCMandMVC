Game = function ()
{

}

Game.prototype =
{
	_game: null,
	_logo: null,

	init: function (width, height)
	{
		this._game = new Phaser.Game(width, height, Phaser.AUTO, '', { preload: this._preload.bind(this), create: this._create.bind(this), update: this._update.bind(this) });
	},

	_preload: function ()
	{
		this._game.load.spritesheet('ground', '../Content/Images/Games/PhaserTest/terrain_1.png', 32, 32);
	},

	_create: function ()
	{
		this._logo = this._game.add.sprite(this._game.world.centerX, this._game.world.centerY, 'ground');
		this._logo.animations.add('left', [0, 1, 2, 3, 4, 5], 10, true);
		this._logo.anchor.setTo(0.5, 0.5);
	},

	_update: function ()
	{
		var d = 0.1;
		this._logo.animations.play('left');
	}
}