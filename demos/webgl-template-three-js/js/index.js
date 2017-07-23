var camera, scene, renderer, controls;
var stats1, stats2, stats3;
var clock;

var dirLight, dirLightHeper, hemiLight, hemiLightHelper;

var sphere;

function init( ) {
	var width = window.innerWidth;
	var height = window.innerHeight;
	var aspect = width/height;

	scene = new THREE.Scene( );
	scene.background = new THREE.Color( 0, 0, 0, 0 );
	scene.fog = new THREE.Fog( scene.background, 1, 5000 );

	camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 5000 );
	scene.add( camera );

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	renderer = Detector.webgl ? ( new THREE.WebGLRenderer( { antialias: true } ) ) : ( new THREE.CanvasRenderer( ) );
	renderer.setSize( width, height );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.renderReverseSided = false;

	document.body.appendChild( renderer.domElement );

	camera.position.z = 175;

	clock = new THREE.Clock();

	// Stats.
	stats1 = new Stats();
	stats1.showPanel(0); // Panel 0 = fps
	stats1.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
	document.body.appendChild( stats1.dom );
	stats2 = new Stats();
	stats2.showPanel(1); // Panel 0 = fps
	stats2.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';
	document.body.appendChild( stats2.dom );
	stats3 = new Stats();
	stats3.showPanel(2); // Panel 0 = fps
	stats3.domElement.style.cssText = 'position:absolute;top:0px;left:160px;';
	document.body.appendChild( stats3.dom );
	
	// Setup the orbit controls.
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 0, 0 );
	controls.update( );
	
	// Setup a resize listener.
	window.addEventListener( 'resize', onWindowResize, false );
	
	setupScene( );
}

function setupScene( )
{
	var material = new THREE.MeshStandardMaterial( { lights: true, roughness: 0.65 } );
	sphere = new THREE.Mesh( new THREE.SphereGeometry( 50, 32, 32 ), material );
	scene.add( sphere );
	sphere.castShadow = true;
	sphere.receiveShadow = true;

	// LIGHTS
	hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.8 );
	hemiLight.color.setHSL( 0.6, 1, 0.6 );
	hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
	hemiLight.position.set( 0, 50, 0 );
	hemiLight.visible = true;
	scene.add( hemiLight );
	
	hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
	scene.add( hemiLightHelper );

	//
	dirLight = new THREE.DirectionalLight( 0xffffff, .25 );
	dirLight.color.setHSL( 0.1, 1, 0.95 );
	dirLight.visible = true;
	dirLight.position.set( -10, 250, 10 );
	dirLight.target = sphere;
	scene.add( dirLight );
	
	var d = 50;
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	dirLight.shadow.camera.left = -d;
	dirLight.shadow.camera.right = d;
	dirLight.shadow.camera.top = d;
	dirLight.shadow.camera.bottom = -d;

	dirLight.shadow.camera.far = 3500;
	dirLight.shadow.bias = -0.0001;

	dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 10 );
	scene.add( dirLightHeper );
	
	// Ground.
	var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
	var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
	groundMat.color.setHSL( 0.095, 1, 0.75 );

	var ground = new THREE.Mesh( groundGeo, groundMat );
	ground.rotation.x = -Math.PI/2;
	ground.position.y = -60;
	scene.add( ground );

	ground.receiveShadow = true;
	
	// Setup shaders.
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor:    { value: new THREE.Color( 0x0077ff ) },
		bottomColor: { value: new THREE.Color( 0xffffff ) },
		offset:      { value: 33 },
		exponent:    { value: 0.6 }
	};
	uniforms.topColor.value.copy( hemiLight.color );
	scene.fog.color.copy( uniforms.bottomColor.value );

	// SKYDOME
	var vertexShader = document.getElementById( 'vertexShader' ).textContent;
	var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
	var uniforms = {
		topColor:    { value: new THREE.Color( 0x0077ff ) },
		bottomColor: { value: new THREE.Color( 0xffffff ) },
		offset:      { value: 33 },
		exponent:    { value: 0.6 }
	};
	uniforms.topColor.value.copy( hemiLight.color );
	scene.fog.color.copy( uniforms.bottomColor.value );

	var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
	var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

	var sky = new THREE.Mesh( skyGeo, skyMat );
	scene.add( sky );
}

function onWindowResize( )
{
	var width = window.innerWidth;
	var height = window.innerHeight;
	camera.aspect = width/height;
	camera.updateProjectionMatrix( );

	renderer.setSize( width, height );
}

function render( )
{
	var delta = clock.getDelta();
	var elapsed = clock.elapsedTime;
	
	camera.lookAt( sphere.position );

	dirLight.position.x = Math.cos( elapsed*2 )*360;
	dirLight.position.z = Math.sin( elapsed*2 )*360;
	
	renderer.render( scene, camera );
}

function update() {
	requestAnimationFrame( update );
	render();
	
	stats1.update();
	stats2.update();
	stats3.update();
}

init();
update();