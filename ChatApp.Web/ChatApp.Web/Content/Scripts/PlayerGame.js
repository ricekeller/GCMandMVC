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
	__preload: function ()
	{
		this.__game.load.atlasXML('sprites', '/Content/Images/Games/Sokoban/sprites.png', '/Content/Images/Games/Sokoban/sprites.xml');
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
		this.__emitter.makeParticles('sprites', 'EndPoint_Blue.png');//the image key

		this.__emitter.setRotation(0, 0);
		this.__emitter.setAlpha(0.3, 0.8);
		this.__emitter.setScale(0.5, 1);
		this.__emitter.gravity = -200;

		//	false means don't explode all the sprites at once, but instead release at a rate of one particle per 100ms
		//	The 5000 value is the lifespan of each particle before it's killed
		this.__emitter.start(false, 5000, 100);
	},
	__update: function ()
	{
		this.__filter.update();
		this.__emitter.emitX = this.__game.input.activePointer.x;
		this.__emitter.emitY = this.__game.input.activePointer.y;
	},
	__render: function ()
	{

	}
}