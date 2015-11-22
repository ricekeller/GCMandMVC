var Hanoi = function () {

};
Hanoi.prototype =
{
    __game: null,
    __width: 1000,
    __height: 600,

    __preload: function ()
    {

    },

    __create: function () {

    },

    __update: function () {

    },

    __render: function () {

    },

    init: function () {
        this.__game = new Phaser.Game(this.__width, this.__height, Phaser.AUTO, 'hanoi-container',
		{
		    preload: this.__preload.bind(this), create: this.__create.bind(this), update: this.__update.bind(this),
		    render: this.__render.bind(this)
		});
        this.__game.backgroundColor = '#4b0049';
    }
};
