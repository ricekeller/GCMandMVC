CameraController = function (camera)
{
	this._camera = camera;
	document.addEventListener("wheel", this._mouseWheel.bind(this), false);
};

CameraController.prototype =
{
	_camera: null,
	ZoomDelta: 0.25,
	MINZOOM: 0.5,
	MAXZOOM: 3,
	__deltaX: 4,
	__deltaY: 4,
	_mouseWheel:function(event)
	{
		this.Zoom(event.wheelDeltaY);
	},
	Zoom: function Zoom(wheelDelta)
	{
		this._camera.zoom += (wheelDelta > 0 ? -this.ZoomDelta : this.ZoomDelta);
		if (this._camera.zoom > this.MAXZOOM) this._camera.zoom = this.MAXZOOM;
		if (this._camera.zoom < this.MINZOOM) this._camera.zoom = this.MINZOOM;
		this._camera.updateProjectionMatrix();
	},

	Move: function Move(dir)
	{
		switch (dir)
		{
			case CameraController.Directions.UP:
				this._camera.position.y += this.__deltaX;

				break;
			case CameraController.Directions.DOWN:
				this._camera.position.y -= this.__deltaX;

				break;
			case CameraController.Directions.LEFT:
				this._camera.position.x -= this.__deltaY;

				break;
			case CameraController.Directions.RIGHT:
				this._camera.position.x += this.__deltaY;

				break;
		}
		this._camera.updateProjectionMatrix();
	},
	update: function (keyboard, delta)
	{
		if (keyboard.pressed("W"))
			this._camera.position.y += this.__deltaY * delta;

		if (keyboard.pressed("S"))
			this._camera.position.y -= this.__deltaY * delta;

		if (keyboard.pressed("A"))
			this._camera.position.x -= this.__deltaX * delta;

		if (keyboard.pressed("D"))
			this._camera.position.x += this.__deltaX * delta;
	},
};

CameraController.Directions =
{
	UP: 0,
	DOWN: 1,
	LEFT: 2,
	RIGHT: 3
}