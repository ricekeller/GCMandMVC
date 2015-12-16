var PlayerGame = function (container, width, height)
{
	this.__width = width;
	this.__height = height;
	this.__game = new Phaser.Game(width, height, Phaser.AUTO, container, { preload: this.__preload.bind(this), create: this.__create.bind(this), update: this.__update.bind(this), render: this.__render.bind(this) });
}

PlayerGame.prototype =
{
	__game: null,
	__width: null,
	__height: null,
	__filter: null,
	__emitter: null,
	__emitTimer: 0,
	__emitFrequency: 0.08,//100ms emit 1 particle
	__showPopupTimer: 0,
	__showPopupChecker: 5,
	__preload: function ()
	{
		this.__game.load.image('particle', '/Content/Images/Games/blue.png');
	},
	__create: function ()
	{
		this.__game.stage.backgroundColor = '#000000';
		//the filter
		var fragmentSrc = [

        "precision mediump float;",

        "uniform float     time;",
        "uniform vec2      resolution;",

        "#define PI 0.01",

        "void main( void ) {",

            "vec2 p = ( gl_FragCoord.xy / resolution.xy ) - 0.5;",

            "float sx = 0.2*sin( 25.0 * p.y - time * 5.);",

            "float dy = 0.9/ ( 50. * abs(p.y - sx));",

            "gl_FragColor = vec4( (p.x + 0.5) * dy, 0.5 * dy, dy-1.65, 5.0 );",

        "}"
		];
		this.__filter = new Phaser.Filter(this.__game, null, fragmentSrc);
		this.__filter.setResolution(this.__width, this.__height);

		sprite = this.__game.add.sprite();
		sprite.width = this.__width;
		sprite.height = this.__height;

		sprite.filters = [this.__filter];

		//the particle
		this.__emitter = this.__game.add.emitter(0, 0, 600);//x,y,number of particles
		this.__emitter.makeParticles('particle');

		this.__emitter.setRotation(0, 0);
		this.__emitter.setAlpha(0.3, 0.8);
		this.__emitter.setScale(0.1, 0.1);
		this.__emitter.gravity = -200;

		//	false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
		//	The 5000 value is the lifespan of each particle before it's killed
		//this.__emitter.start(false, 5000, 100);
	},
	__update: function ()
	{
		this.__filter.update();
		this.__emitter.emitX = this.__game.input.activePointer.x;
		this.__emitter.emitY = this.__game.input.activePointer.y;
		if (this.__game.input.activePointer.leftButton.isDown)
		{
			this.__emitTimer += this.__game.time.physicsElapsed;
			this.__showPopupTimer += this.__game.time.physicsElapsed;
			if (this.__emitTimer >= this.__emitFrequency)
			{
				this.__emitter.explode(2000, 1);
				this.__emitTimer = 0;
			}
			if (this.__showPopupTimer >= this.__showPopupChecker)
			{
				this.__showGamePopup();
				this.__showPopupTimer = 0;
			}
		}
		else
		{
			this.__emitTimer = 0;
			this.__showPopupTimer = 0;
		}
	},
	__render: function ()
	{

	},
	__showGamePopup: function ()
	{
		$("#game-select-dialog").dialog("open");
	},
	showGameWithIdx: function (idx)
	{
		if (typeof idx != Number)
		{
			idx = parseInt(idx);
		}
		var url = null;
		switch (idx)
		{
			case PlayerGame.Games.Minesweeper:
				url = "/Game/Minesweeper";
				break;
			case PlayerGame.Games.Hanoi:
				url = "/Game/Hanoi";
				break;
			case PlayerGame.Games.Sokoban:
				url = "/Game/Sokoban";
				break;
		}
		if (url)
		{
			this.showOverlay();
			$(".game-container").html("<iframe class='game-frame' src='" + url + "'></iframe>");
		}
	},
	onOverlayClicked: function ()
	{
		$(".game-container").html("");
		this.hideOverlay();
	},
	showOverlay: function ()
	{
		$("#overlay").removeClass("game-close");
		$("#overlay").addClass("game-open");
	},
	hideOverlay: function ()
	{
		$("#overlay").removeClass("game-open");
		$("#overlay").addClass("game-close");
	}
};
PlayerGame.Games =
{
	Minesweeper: 1,
	Hanoi: 2,
	Sokoban: 3
}