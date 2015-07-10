Game = function (containerId)
{
	this._container = document.getElementById(containerId);
	this._mousePos = { x: 0, y: 0 };
	document.addEventListener("mousemove", this._onMouseMove.bind(this), false);
	this.init();
	this.start();
};

Game.prototype =
{
	_self: null,
	SCREEN_WIDTH: null,
	SCREEN_HEIGHT: null,
	VIEW_ANGLE: null,
	ASPECT: null,
	NEAR: null,
	FAR: null,
	_container: null,
	_scene: null,
	_camera: null,
	_renderer: null,
	_camControl: null,
	_keyboard: null,
	_clock: null,
	_assets: null,
	//custom
	_textures: null,
	_floorGeo: null,
	_projector: null,
	_mousePos: null,

	init: function ()
	{
		this._self = this;
		this._keyboard = new KeyboardState();
		this._clock = new THREE.Clock();
		// SCENE
		this._scene = new THREE.Scene();
		// CAMERA
		this.SCREEN_WIDTH = window.innerWidth, this.SCREEN_HEIGHT = window.innerHeight;
		this.VIEW_ANGLE = 45, this.ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT, this.NEAR = 0.1, this.FAR = 100;
		this._camera = new THREE.PerspectiveCamera(this.VIEW_ANGLE, this.ASPECT, this.NEAR, this.FAR);
		this._scene.add(this._camera);
		this._camControl = new CameraController(this._camera);
		this._camera.position.set(0, 0, 10);
		this._camera.lookAt(this._scene.position);
		// RENDERER
		if (Detector.webgl)
			this._renderer = new THREE.WebGLRenderer({ antialias: true });
		else
			this._renderer = new THREE.CanvasRenderer();
		this._renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
		this._container.appendChild(this._renderer.domElement);
		// EVENTS
		THREEx.WindowResize(this._renderer, this._camera);
		THREEx.FullScreen.bindKey({ charCode: 'm'.charCodeAt(0) });

		// ASSETS
		this._loadAssets();

		// COSTOM
		this._projector = new THREE.Projector();
		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
		var cube = new THREE.Mesh(geometry, material);
		cube.position.x = cube.position.y = 0;
		cube.position.z = 1;
		this._scene.add(cube);

		// floor
		var texture = this._assets["terrain"];
		var floorMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
		var t1 = [new THREE.Vector2(0, 0.8333), new THREE.Vector2(0.015625, 0.8333), new THREE.Vector2(0.015625, 1), new THREE.Vector2(0, 1)];
		this._floorGeo = new THREE.PlaneGeometry(2, 2, 4, 4);
		this._floorGeo.faceVertexUvs[0] = [];
		for (var i = 0; i < this._floorGeo.faces.length; i += 2)
		{
			this._floorGeo.faceVertexUvs[0][i] = [t1[3], t1[0], t1[2]];
			this._floorGeo.faceVertexUvs[0][i + 1] = [t1[0], t1[1], t1[2]];
		}
		var floor = new THREE.Mesh(this._floorGeo, floorMaterial);
		floor.position.x = floor.position.z = floor.position.y = 0;

		this._scene.add(floor);
	},
	start: function ()
	{
		var g = this;
		var f = function ()
		{
			g._render();
			g._update();
			requestAnimationFrame(f);
		};
		requestAnimationFrame(f);
	},
	_render: function ()
	{
		this._renderer.render(this._scene, this._camera);
	},
	_update: function ()
	{
		this._keyboard.update();
		this._camControl.update(this._keyboard, this._clock.getDelta());

		//custom
		// find intersections

		// create a Ray with origin at the mouse position
		//   and direction into the scene (camera direction)
		var vector = new THREE.Vector3(this._mousePos.x, this._mousePos.y, 1);
		this._projector.unprojectVector(vector, this._camera);
		var ray = new THREE.Raycaster(this._camera.position, vector.sub(this._camera.position).normalize());

		// create an array containing all objects in the scene with which the ray intersects
		var intersects = ray.intersectObjects(this._scene.children);
		if (intersects && intersects.length > 0)
		{
			for (var i = 0; i < intersects.length; i++)
			{
				var idx = intersects[i].faceIndex;
				this._floorGeo.faceVertexUvs[0][idx] = [new THREE.Vector2(0, 1), new THREE.Vector2(0, 0), new THREE.Vector2(1, 0)];
				//if (idx % 2 == 0)
				//{
				//	delete this._floorGeo.faceVertexUvs[0][idx + 1];
				//}
				//else
				//{
				//	delete this._floorGeo.faceVertexUvs[0][idx - 1];
				//}
			}
			// make sure new values are set
			this._floorGeo.uvsNeedUpdate = true;
		}
	},
	_loadAssets: function ()
	{
		this._assets = {};
		this._assets["terrain"] = new THREE.ImageUtils.loadTexture('../Content/Images/Games/ThreeTest/terrain_1.png');

		// generate UVs
		this._generateUV();
	},
	_generateUV: function ()
	{

	},
	_onMouseMove: function (event)
	{
		this._mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
		this._mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
	}
};